import { useState } from "react";
import { CalendarGrid } from "../CalendarGrid";
import type { Appointment } from "@/lib/types";

export default function CalendarGridExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const mockAppointments: Appointment[] = [
    { id: 1, name: "김선영", category: 1, date: new Date(), time: "오전10시", phone: "010-1234-5678" },
    { id: 2, name: "이나영", category: 2, date: new Date(), time: "오후2시", phone: "010-2345-6789" },
    { id: 3, name: "박지현", category: 3, date: new Date(), time: "오후4시" },
    { id: 4, name: "최수연", category: 4, date: new Date(Date.now() + 86400000), time: "오전11시" },
    { id: 5, name: "정민아", category: 5, date: new Date(Date.now() + 86400000 * 2), time: "오후1시" },
  ];

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <CalendarGrid
        appointments={mockAppointments}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          console.log("Selected date:", date);
        }}
        onSelectAppointment={(apt) => console.log("Selected appointment:", apt)}
      />
    </div>
  );
}
