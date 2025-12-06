import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import { Clock, Phone, Calendar, FileText, Pencil, Trash2 } from "lucide-react";
import type { Appointment } from "@/lib/types";

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onDelete,
}: AppointmentDetailDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-appointment-detail">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <DialogTitle className="text-xl">{appointment.name}</DialogTitle>
            <CategoryBadge categoryId={appointment.category} />
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(appointment.date, "yyyy년 M월 d일 (EEEE)", { locale: ko })}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>

          {appointment.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.phone}</span>
            </div>
          )}

          {appointment.notes && (
            <div className="flex items-start gap-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onEdit} className="flex-1" data-testid="button-edit-appointment">
            <Pencil className="h-4 w-4 mr-2" />
            수정
          </Button>
          <Button variant="destructive" onClick={onDelete} className="flex-1" data-testid="button-delete-appointment">
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
