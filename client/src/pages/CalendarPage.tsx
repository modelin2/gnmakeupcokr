import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarGrid } from "@/components/CalendarGrid";
import { AppointmentList } from "@/components/AppointmentList";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { AppointmentDetailDialog } from "@/components/AppointmentDetailDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ImportDataDialog } from "@/components/ImportDataDialog";
import { PasswordDialog } from "@/components/PasswordDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Upload, CalendarDays, Loader2 } from "lucide-react";
import type { Appointment } from "@/lib/types";

interface ApiAppointment {
  id: number;
  name: string;
  category: number;
  date: string;
  time: string;
  phone: string | null;
  notes: string | null;
  secret: boolean | null;
  originalNo: number | null;
}

function parseApiAppointment(apt: ApiAppointment): Appointment {
  return {
    id: apt.id,
    name: apt.name,
    category: apt.category,
    date: new Date(apt.date),
    time: apt.time,
    phone: apt.phone || undefined,
    notes: apt.notes || undefined,
    secret: apt.secret || undefined,
  };
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"add" | "edit" | "search" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data: apiAppointments = [], isLoading } = useQuery<ApiAppointment[]>({
    queryKey: ['/api/appointments'],
  });

  const appointments = useMemo(() => {
    return apiAppointments.map(parseApiAppointment);
  }, [apiAppointments]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: number; date: Date; time: string; phone?: string; notes?: string }) => {
      const response = await apiRequest("POST", "/api/appointments", {
        ...data,
        date: data.date.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; category: number; date: Date; time: string; phone?: string; notes?: string } }) => {
      const response = await apiRequest("PUT", `/api/appointments/${id}`, {
        ...data,
        date: data.date.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (sqlContent: string) => {
      const response = await apiRequest("POST", "/api/appointments/import", { sqlContent });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
  });

  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (apt) =>
          apt.name.toLowerCase().includes(query) ||
          apt.phone?.includes(query) ||
          apt.notes?.toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((apt) => selectedCategories.includes(apt.category));
    }

    return result;
  }, [appointments, searchQuery, selectedCategories]);

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailDialog(true);
  };

  const handleAddAppointment = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        category: parseInt(data.category),
        date: data.date,
        time: data.time,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
      });
      setShowAddDialog(false);
      toast({
        title: "예약 등록 완료",
        description: `${data.name}님의 예약이 등록되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "예약 등록에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditAppointment = async (data: any) => {
    if (!selectedAppointment) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedAppointment.id,
        data: {
          name: data.name,
          category: parseInt(data.category),
          date: data.date,
          time: data.time,
          phone: data.phone || undefined,
          notes: data.notes || undefined,
        },
      });
      setShowEditDialog(false);
      toast({
        title: "예약 수정 완료",
        description: `${data.name}님의 예약이 수정되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "예약 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      await deleteMutation.mutateAsync(selectedAppointment.id);
      setShowDeleteDialog(false);
      setShowDetailDialog(false);
      toast({
        title: "예약 삭제 완료",
        description: "예약이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "예약 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('euc-kr');
    const sqlContent = decoder.decode(arrayBuffer);
    try {
      const result = await importMutation.mutateAsync(sqlContent);
      return { success: true, count: result.importedCount };
    } catch (error) {
      throw error;
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddClick = () => {
    if (isAuthenticated) {
      setShowAddDialog(true);
    } else {
      setPasswordAction("add");
      setShowPasswordDialog(true);
    }
  };

  const handleEditClick = () => {
    if (isAuthenticated) {
      setShowEditDialog(true);
    } else {
      setPasswordAction("edit");
      setShowPasswordDialog(true);
    }
  };

  const handleSearchChange = (query: string) => {
    if (!query) {
      setSearchQuery("");
      return;
    }
    if (isAuthenticated) {
      setSearchQuery(query);
    } else {
      setPendingSearchQuery(query);
      setPasswordAction("search");
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsAuthenticated(true);
    if (passwordAction === "add") {
      setShowAddDialog(true);
    } else if (passwordAction === "edit") {
      setShowEditDialog(true);
    } else if (passwordAction === "search") {
      setSearchQuery(pendingSearchQuery);
    }
    setPasswordAction(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background" data-testid="page-calendar-loading">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="page-calendar">
      <header className="flex items-center justify-between gap-4 p-4 border-b flex-wrap">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">예약 달력</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowImportDialog(true)} data-testid="button-import">
            <Upload className="h-4 w-4 mr-2" />
            가져오기
          </Button>
          <Button onClick={handleAddClick} data-testid="button-add-appointment">
            <Plus className="h-4 w-4 mr-2" />
            예약 추가
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="p-4 space-y-4 border-b">
        <SearchBar onSearch={handleSearchChange} />
        <CategoryFilter
          selectedCategories={selectedCategories}
          onToggle={handleCategoryToggle}
          onClearAll={() => setSelectedCategories([])}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <CalendarGrid
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSelectAppointment={handleSelectAppointment}
          />
        </div>
        <div className="w-80 border-l hidden lg:block">
          <AppointmentList
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            onSelectAppointment={handleSelectAppointment}
          />
        </div>
      </div>

      <AppointmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultDate={selectedDate}
        onSave={handleAddAppointment}
      />

      <AppointmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        appointment={selectedAppointment || undefined}
        onSave={handleEditAppointment}
      />

      <AppointmentDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        appointment={selectedAppointment}
        onEdit={() => {
          setShowDetailDialog(false);
          handleEditClick();
        }}
        onDelete={() => {
          setShowDeleteDialog(true);
        }}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAppointment}
      />

      <ImportDataDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
      />

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}
