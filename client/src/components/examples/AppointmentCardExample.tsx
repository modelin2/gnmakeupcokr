import { AppointmentCard } from "../AppointmentCard";

export default function AppointmentCardExample() {
  const mockAppointment = {
    id: 1,
    name: "김선영",
    category: 1,
    date: new Date(2024, 11, 15),
    time: "오전10시",
    phone: "010-1234-5678",
    notes: "눈썹 반영구 시술 예약입니다.",
  };

  return (
    <div className="space-y-4 max-w-md">
      <AppointmentCard 
        appointment={mockAppointment} 
        onClick={() => console.log("Appointment clicked")} 
      />
      <AppointmentCard 
        appointment={{ ...mockAppointment, id: 2, category: 3, name: "이나영" }} 
        compact 
        onClick={() => console.log("Compact clicked")} 
      />
    </div>
  );
}
