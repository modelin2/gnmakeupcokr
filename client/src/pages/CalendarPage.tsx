import { useState, useMemo } from "react";
import { CalendarGrid } from "@/components/CalendarGrid";
import { AppointmentList } from "@/components/AppointmentList";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { AppointmentDetailDialog } from "@/components/AppointmentDetailDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ImportDataDialog } from "@/components/ImportDataDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, CalendarDays } from "lucide-react";
import type { Appointment } from "@/lib/types";

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
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // todo: remove mock functionality - replace with real API data
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, name: "김선영", category: 1, date: new Date(), time: "오전10시", phone: "010-1234-5678", notes: "눈썹 반영구 시술" },
    { id: 2, name: "이나영", category: 2, date: new Date(), time: "오후2시", phone: "010-2345-6789" },
    { id: 3, name: "박지현", category: 3, date: new Date(), time: "오후4시30분", notes: "상담 예정" },
    { id: 4, name: "최수연", category: 4, date: new Date(Date.now() + 86400000), time: "오전11시", phone: "010-3456-7890" },
    { id: 5, name: "정민아", category: 5, date: new Date(Date.now() + 86400000 * 2), time: "오후1시" },
    { id: 6, name: "한소희", category: 6, date: new Date(Date.now() - 86400000), time: "오전9시30분", phone: "010-4567-8901" },
    { id: 7, name: "송혜교", category: 7, date: new Date(Date.now() + 86400000 * 3), time: "오후3시", notes: "재방문 고객" },
  ]);

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

  const handleAddAppointment = (data: any) => {
    // todo: remove mock functionality - replace with real API call
    const newAppointment: Appointment = {
      id: Date.now(),
      name: data.name,
      category: parseInt(data.category),
      date: data.date,
      time: data.time,
      phone: data.phone,
      notes: data.notes,
    };
    setAppointments((prev) => [...prev, newAppointment]);
    toast({
      title: "예약 등록 완료",
      description: `${data.name}님의 예약이 등록되었습니다.`,
    });
  };

  const handleEditAppointment = (data: any) => {
    if (!selectedAppointment) return;
    // todo: remove mock functionality - replace with real API call
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === selectedAppointment.id
          ? {
              ...apt,
              name: data.name,
              category: parseInt(data.category),
              date: data.date,
              time: data.time,
              phone: data.phone,
              notes: data.notes,
            }
          : apt
      )
    );
    toast({
      title: "예약 수정 완료",
      description: `${data.name}님의 예약이 수정되었습니다.`,
    });
  };

  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;
    // todo: remove mock functionality - replace with real API call
    setAppointments((prev) => prev.filter((apt) => apt.id !== selectedAppointment.id));
    setShowDeleteDialog(false);
    setShowDetailDialog(false);
    toast({
      title: "예약 삭제 완료",
      description: "예약이 삭제되었습니다.",
    });
  };

  const handleImport = async (file: File) => {
    // todo: remove mock functionality - replace with real API call
    console.log("Importing file:", file.name);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock: add some imported appointments
    const importedAppointments: Appointment[] = [
      { id: Date.now() + 1, name: "가져온 예약1", category: 1, date: new Date(2024, 0, 15), time: "오전10시" },
      { id: Date.now() + 2, name: "가져온 예약2", category: 2, date: new Date(2024, 0, 20), time: "오후2시" },
    ];
    
    setAppointments((prev) => [...prev, ...importedAppointments]);
    
    return { success: true, count: importedAppointments.length };
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-appointment">
            <Plus className="h-4 w-4 mr-2" />
            예약 추가
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="p-4 space-y-4 border-b">
        <SearchBar onSearch={setSearchQuery} />
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
          setShowEditDialog(true);
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
    </div>
  );
}
