import { AppointmentList } from "../AppointmentList";
import type { Appointment } from "@/lib/types";

export default function AppointmentListExample() {
  const today = new Date();
  
  const mockAppointments: Appointment[] = [
    { id: 1, name: "김선영", category: 1, date: today, time: "오전10시", phone: "010-1234-5678", notes: "눈썹 반영구 시술" },
    { id: 2, name: "이나영", category: 2, date: today, time: "오후2시", phone: "010-2345-6789" },
    { id: 3, name: "박지현", category: 3, date: today, time: "오후4시30분", notes: "상담 예정" },
  ];

  return (
    <div className="h-[400px] border rounded-lg overflow-hidden w-80">
      <AppointmentList
        appointments={mockAppointments}
        selectedDate={today}
        onSelectAppointment={(apt) => console.log("Selected:", apt)}
      />
    </div>
  );
}
