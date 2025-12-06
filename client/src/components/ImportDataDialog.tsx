import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<{ success: boolean; count: number; message?: string }>;
}

type ImportState = "idle" | "uploading" | "processing" | "success" | "error";

export function ImportDataDialog({
  open,
  onOpenChange,
  onImport,
}: ImportDataDialogProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ count: number; message?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setState("idle");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".sql") || droppedFile.name.endsWith(".txt"))) {
      setFile(droppedFile);
      setState("idle");
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    if (!file) return;

    setState("uploading");
    setProgress(20);

    try {
      setState("processing");
      setProgress(50);

      const importResult = await onImport(file);

      setProgress(100);

      if (importResult.success) {
        setState("success");
        setResult({ count: importResult.count, message: importResult.message });
      } else {
        setState("error");
        setResult({ count: 0, message: importResult.message });
      }
    } catch (err) {
      setState("error");
      setResult({ count: 0, message: "파일 처리 중 오류가 발생했습니다." });
    }
  };

  const handleClose = () => {
    setState("idle");
    setProgress(0);
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="dialog-import">
        <DialogHeader>
          <DialogTitle>데이터 가져오기</DialogTitle>
          <DialogDescription>
            SQL 백업 파일을 업로드하여 기존 예약 데이터를 가져옵니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {state === "idle" && (
            <>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover-elevate"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("file-input")?.click()}
                data-testid="dropzone-file"
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-xs text-muted-foreground">
                  .sql 또는 .txt 파일 지원
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".sql,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-file"
                />
              </div>

              {file && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleImport}
                disabled={!file}
                data-testid="button-start-import"
              >
                가져오기 시작
              </Button>
            </>
          )}

          {(state === "uploading" || state === "processing") && (
            <div className="space-y-4 py-8">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {state === "uploading" ? "파일 업로드 중..." : "데이터 처리 중..."}
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <p className="font-semibold text-lg">가져오기 완료!</p>
                <p className="text-sm text-muted-foreground">
                  {result?.count.toLocaleString()}개의 예약이 성공적으로 가져와졌습니다.
                </p>
              </div>
              <Button onClick={handleClose} data-testid="button-close-import">
                닫기
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <div>
                <p className="font-semibold text-lg">가져오기 실패</p>
                <p className="text-sm text-muted-foreground">
                  {result?.message || "오류가 발생했습니다."}
                </p>
              </div>
              <Button variant="outline" onClick={() => setState("idle")} data-testid="button-retry-import">
                다시 시도
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
