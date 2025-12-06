import { AppointmentForm } from "../AppointmentForm";

export default function AppointmentFormExample() {
  return (
    <div className="max-w-md p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">새 예약 등록</h3>
      <AppointmentForm
        onSubmit={(data) => console.log("Form submitted:", data)}
        onCancel={() => console.log("Form cancelled")}
      />
    </div>
  );
}
