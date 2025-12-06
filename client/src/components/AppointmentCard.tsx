import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "./CategoryBadge";
import { Clock, Phone, User } from "lucide-react";
import { type Appointment, getCategoryColor } from "@/lib/types";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onClick, compact = false }: AppointmentCardProps) {
  const borderColor = getCategoryColor(appointment.category);

  if (compact) {
    return (
      <div
        className="px-2 py-1 rounded-md text-xs cursor-pointer hover-elevate active-elevate-2 truncate"
        style={{ 
          backgroundColor: `${borderColor}20`,
          borderLeft: `3px solid ${borderColor}`
        }}
        onClick={onClick}
        data-testid={`card-appointment-compact-${appointment.id}`}
      >
        <span className="font-medium">{appointment.time}</span>
        <span className="ml-1 text-muted-foreground">{appointment.name}</span>
      </div>
    );
  }

  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 border-l-4"
      style={{ borderLeftColor: borderColor }}
      onClick={onClick}
      data-testid={`card-appointment-${appointment.id}`}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{appointment.name}</span>
          </div>
          <CategoryBadge categoryId={appointment.category} size="sm" />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{appointment.time}</span>
          </div>
          {appointment.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{appointment.phone}</span>
            </div>
          )}
        </div>
        {appointment.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {appointment.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
