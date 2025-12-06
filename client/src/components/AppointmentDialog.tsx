import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "./AppointmentForm";
import type { Appointment } from "@/lib/types";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  defaultDate?: Date;
  onSave: (data: any) => void;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  defaultDate,
  onSave,
}: AppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-appointment">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "예약 수정" : "새 예약 등록"}
          </DialogTitle>
        </DialogHeader>
        <AppointmentForm
          initialData={appointment || { date: defaultDate }}
          onSubmit={(data) => {
            onSave(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
