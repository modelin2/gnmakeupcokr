import { useState } from "react";
import { ImportDataDialog } from "../ImportDataDialog";
import { Button } from "@/components/ui/button";

export default function ImportDataDialogExample() {
  const [open, setOpen] = useState(false);

  const handleImport = async (file: File): Promise<{ success: boolean; count: number; message?: string }> => {
    console.log("Importing file:", file.name);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, count: 1234 };
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>데이터 가져오기</Button>
      <ImportDataDialog
        open={open}
        onOpenChange={setOpen}
        onImport={handleImport}
      />
    </div>
  );
}
