import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const CORRECT_PASSWORD = "0060";
const AUTH_KEY = "gn_makeup_auth";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function isSessionValid(): boolean {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return false;
    const { timestamp } = JSON.parse(stored);
    const now = Date.now();
    return now - timestamp < SESSION_DURATION;
  } catch {
    return false;
  }
}

export function setAuthSession(): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ timestamp: Date.now() }));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function PasswordDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "비밀번호 확인",
  description = "권한이 필요합니다. 비밀번호를 입력해주세요.",
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open && isSessionValid()) {
      onOpenChange(false);
      onSuccess();
    }
  }, [open, onOpenChange, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setPassword("");
      setError(false);
      setAuthSession();
      onOpenChange(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm" data-testid="dialog-password">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="비밀번호 입력"
              data-testid="input-password"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">
                비밀번호가 올바르지 않습니다.
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" data-testid="button-password-submit">
              확인
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
