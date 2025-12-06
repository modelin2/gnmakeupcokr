import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Appointment, getCategoryColor } from "@/lib/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";

interface CalendarGridProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectAppointment?: (appointment: Appointment) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarGrid({
  appointments,
  selectedDate,
  onSelectDate,
  onSelectAppointment,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(apt.date, date));
  };

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    onSelectDate(new Date());
  };

  return (
    <div className="flex flex-col h-full" data-testid="calendar-grid">
      <div className="flex items-center justify-between gap-2 p-4 border-b flex-wrap">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={goToPrevMonth} data-testid="button-prev-month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[140px] text-center">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <Button size="icon" variant="ghost" onClick={goToNextMonth} data-testid="button-next-month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} data-testid="button-today">
          오늘
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((weekday, i) => (
          <div
            key={weekday}
            className={`p-2 text-center text-sm font-medium ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
            }`}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((dayDate, index) => {
          const dayAppointments = getAppointmentsForDay(dayDate);
          const isCurrentMonth = isSameMonth(dayDate, currentMonth);
          const isSelected = isSameDay(dayDate, selectedDate);
          const isTodayDate = isToday(dayDate);
          const dayOfWeek = dayDate.getDay();

          return (
            <div
              key={index}
              className={`border-b border-r p-1 min-h-[80px] cursor-pointer transition-colors hover-elevate ${
                !isCurrentMonth ? "bg-muted/30" : ""
              } ${isSelected ? "bg-accent" : ""}`}
              onClick={() => onSelectDate(dayDate)}
              data-testid={`calendar-day-${format(dayDate, "yyyy-MM-dd")}`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate
                      ? "bg-primary text-primary-foreground font-bold"
                      : !isCurrentMonth
                      ? "text-muted-foreground"
                      : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                      ? "text-blue-500"
                      : ""
                  }`}
                >
                  {format(dayDate, "d")}
                </span>
              </div>
              <div className="space-y-px overflow-hidden">
                {dayAppointments.slice(0, 10).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-0.5 text-[10px] leading-tight px-0.5 py-px rounded truncate cursor-pointer"
                    style={{
                      backgroundColor: `${getCategoryColor(apt.category)}15`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAppointment?.(apt);
                    }}
                    data-testid={`calendar-appointment-${apt.id}`}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(apt.category) }}
                    />
                    <span className="truncate font-medium">{apt.name}</span>
                  </div>
                ))}
                {dayAppointments.length > 10 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayAppointments.length - 10}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
