import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { AppointmentCard } from "./AppointmentCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays } from "lucide-react";
import type { Appointment } from "@/lib/types";

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectAppointment: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  selectedDate,
  onSelectAppointment,
}: AppointmentListProps) {
  const filteredAppointments = appointments
    .filter((apt) => isSameDay(apt.date, selectedDate))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex flex-col h-full" data-testid="appointment-list">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">
          {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {filteredAppointments.length}개의 예약
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">이 날짜에 예약이 없습니다</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onClick={() => onSelectAppointment(apt)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
