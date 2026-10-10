import { useCallback, useEffect, useState } from "react";
import { Users, User, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// 메이크업 모임 · 1:1 레슨 신청 영역 — /meetup 과 메인페이지가 함께 쓴다. 신청·결제·현황은 레코딩카페 API(/api/gnclub/*)를 직접 호출한다
// (토스 승인·DB·문자는 모두 레코딩카페 쪽). 금액은 서버가 정하고, 아래 숫자는 화면 표기용이다.
const RC_API: string = (import.meta.env.VITE_RC_API as string | undefined) ?? "https://www.recordingcafe.com";

const GROUP = { name: "메이크업 모임", price: 243_000, monthly: 81_000, months: 3, sessions: 4, capacity: 6, intervalDays: 21 };
const PRIVATE = { name: "1:1 레슨", price: 700_000, sessions: 4 };
export const REFUND_NOTICE = "첫 모임·레슨이 시작되기 전까지는 환불할 수 있고, 시작한 뒤에는 환불이 되지 않습니다.";

type Cohort = { key: string; state: "open" | "full" | "started" | "waiting"; name: string; timeLabel: string; sessions: string[]; seatsLeft: number | null };
type Product = "group" | "private";
type Order = { id: number; amount: number; tierLabel: string };

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()];
  return `${m}월 ${d}일(${wd})`;
}

type TossInstance = { payment: (o: { customerKey: string }) => { requestPayment: (p: Record<string, unknown>) => Promise<void> } };
function loadToss(clientKey: string): Promise<TossInstance> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { TossPayments?: (k: string) => TossInstance };
    if (w.TossPayments) return resolve(w.TossPayments(clientKey));
    const el = document.createElement("script");
    el.src = "https://js.tosspayments.com/v2/standard";
    el.onload = () => (w.TossPayments ? resolve(w.TossPayments(clientKey)) : reject(new Error("카드결제를 불러오지 못했습니다.")));
    el.onerror = () => reject(new Error("카드결제를 불러오지 못했습니다."));
    document.head.appendChild(el);
  });
}

// 인스타 등 유입 경로(utm)를 첫 방문 때 저장해 두었다가 신청에 같이 보낸다 — 어느 채널에서 신청이 왔는지 세기 위함.
export function readSource(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    const fresh = [p.get("utm_source"), p.get("utm_campaign")].filter(Boolean).join("/");
    if (fresh) sessionStorage.setItem("gn_meetup_src", fresh.slice(0, 80));
    return sessionStorage.getItem("gn_meetup_src") ?? "";
  } catch {
    return "";
  }
}


export default function MeetupApply({ returnPath }: { returnPath: string }) {
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<{ product: Product; cohort: Cohort | null } | null>(null);
  const [confirmError, setConfirmError] = useState("");
  const [waitDone, setWaitDone] = useState(false);


  const openCohort = cohorts?.find((c) => c.state === "open") ?? null;

  const loadStatus = useCallback(() => {
    fetch(`${RC_API}/api/gnclub/status`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.cohorts)) { setCohorts(d.cohorts); setStatusFailed(false); } else setStatusFailed(true); })
      .catch(() => setStatusFailed(true));
  }, []);

  useEffect(() => {
    readSource();
    loadStatus();
    // 반이 마감되거나 첫 모임 시각이 지나면 서버가 다음 반을 열어 준다 — 화면을 열어 둔 채여도 따라가도록 주기적으로 다시 불러온다.
    const timer = window.setInterval(loadStatus, 60_000);
    return () => window.clearInterval(timer);
  }, [loadStatus]);

  // 토스 결제창에서 돌아온 경우 승인 처리
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const paymentKey = p.get("paymentKey");
    const orderId = p.get("orderId");
    const amount = p.get("amount");
    if (!paymentKey && !p.get("tossFail")) return;
    window.history.replaceState({}, "", returnPath);
    if (!paymentKey) { setConfirmError("결제가 완료되지 않았습니다. 다시 시도해 주세요."); return; }
    if (orderId?.startsWith("gnclub_") && amount) {
      setConfirming(true);
      fetch(`${RC_API}/api/gnclub/toss/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
      })
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok || !d.success) throw new Error(d.error ?? "결제 승인에 실패했습니다.");
          setDone({ product: d.product === "private" ? "private" : "group", cohort: d.cohort ?? null });
        })
        .catch((e) => setConfirmError((e as Error).message))
        .finally(() => { setConfirming(false); loadStatus(); });
    }
  }, [loadStatus, returnPath]);

  function openApply(p: Product) {
    setError("");
    setProduct(p);
  }

  async function pay(o: Order, p: Product) {
    const keyRes = await fetch(`${RC_API}/api/gnclub/toss/client-key`);
    const keyData = await keyRes.json();
    if (!keyRes.ok || !keyData.clientKey) throw new Error("카드결제를 일시적으로 사용할 수 없습니다.");
    const toss = await loadToss(keyData.clientKey);
    const payment = toss.payment({ customerKey: "ANONYMOUS" });
    const origin = window.location.origin;
    await payment.requestPayment({
      method: "CARD",
      amount: { currency: "KRW", value: o.amount },
      orderId: `gnclub_${o.id}`,
      orderName: `GN Makeup ${p === "group" ? GROUP.name : PRIVATE.name}`,
      successUrl: `${origin}${returnPath}`,
      failUrl: `${origin}${returnPath}?tossFail=1`,
      customerEmail: email || undefined,
      customerName: name || undefined,
      windowTarget: "self",
    });
  }

  async function submit() {
    setError("");
    if (!product) return;
    if (!name.trim() || !phone.trim() || !email.trim()) { setError("이름, 연락처, 이메일을 모두 입력해 주세요."); return; }
    if (!agree) { setError("환불 규정과 개인정보 수집·이용에 동의해 주세요."); return; }
    if (product === "group" && !openCohort) { setError("지금 모집 중인 모임이 없습니다."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${RC_API}/api/gnclub/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, cohort: product === "group" ? openCohort?.key : undefined, name, phone, email, source: readSource() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "신청 중 오류가 발생했습니다.");
      await pay(d as Order, product);
    } catch (e) {
      // 결제창을 닫은 경우 등 — 입력 화면에 그대로 머문다
      const msg = (e as Error)?.message;
      if (msg && !/취소|cancel/i.test(msg)) setError(msg);
      loadStatus(); // 그 사이 정원이 차거나 시작된 반이면 최신 상태로 갱신
    } finally {
      setSubmitting(false);
    }
  }

  if (confirming) {
    return <div className="py-16 text-center text-muted-foreground text-sm">결제를 확인하고 있습니다…</div>;
  }

  if (done) {
    return (
      <div className="text-center max-w-md w-full mx-auto py-8">
        <CheckCircle2 className="w-14 h-14 mx-auto mb-6 text-primary" />
        <h3 className="text-2xl font-medium mb-3 break-keep">
          {done.product === "group" ? `${GROUP.name} 신청이 완료되었습니다` : `${PRIVATE.name} 결제가 완료되었습니다`}
        </h3>
        {done.product === "group" && done.cohort ? (
          <p className="text-muted-foreground leading-relaxed mb-2 break-keep">
            {done.cohort.timeLabel} · 첫 모임 {dayLabel(done.cohort.sessions[0])}<br />
            모임 일정과 준비물은 문자와 메일로 안내드립니다.
          </p>
        ) : (
          <p className="text-muted-foreground leading-relaxed mb-2 break-keep">
            결제 후 담당자가 연락드려 레슨 일정을 함께 조율합니다.
          </p>
        )}
        <p className="text-xs text-muted-foreground">카드 명세서에는 "레코딩카페"로 표기됩니다.</p>
      </div>
    );
  }

  return (
    <>
      {confirmError && (
        <div className="fixed top-14 inset-x-0 z-40 bg-destructive text-destructive-foreground text-sm text-center px-4 py-2 break-keep" role="alert">
          {confirmError} 결제가 이미 되었다면 중복 결제하지 마시고 문의해 주세요.
        </div>
      )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-group">
              <CardContent className="p-8 flex flex-col h-full">
                <Users className="w-8 h-8 mb-4 text-primary/80" />
                <h3 className="text-xl font-medium mb-1">{GROUP.name}</h3>
                <p className="text-sm text-muted-foreground mb-5 break-keep">{GROUP.intervalDays / 7}주 간격 {GROUP.sessions}회 · 반당 {GROUP.capacity}명</p>
                <p className="text-3xl font-light mb-1">{won(GROUP.price)}</p>
                <p className="text-xs text-muted-foreground mb-6">{GROUP.months}개월 · 월 {won(GROUP.monthly)}</p>
                {openCohort ? (
                  <div className="text-sm space-y-1 mb-6">
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />{openCohort.timeLabel}</p>
                    <p className="text-muted-foreground pl-6">{openCohort.sessions.map(dayLabel).join(" · ")}</p>
                    {openCohort.seatsLeft !== null && <p className="text-primary font-medium pl-6">남은 자리 {openCohort.seatsLeft}석</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-6">{cohorts === null && !statusFailed ? "모집 현황을 불러오는 중…" : "지금은 모집 중인 모임이 없습니다. 다음 모임 알림을 신청해 주세요."}</p>
                )}
                <div className="mt-auto">
                  {openCohort ? (
                    <Button className="w-full" size="lg" onClick={() => openApply("group")} data-testid="button-apply-group">메이크업 모임 신청</Button>
                  ) : (
                    <WaitlistForm onDone={() => setWaitDone(true)} done={waitDone} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-private">
              <CardContent className="p-8 flex flex-col h-full">
                <User className="w-8 h-8 mb-4 text-primary/80" />
                <h3 className="text-xl font-medium mb-1">{PRIVATE.name}</h3>
                <p className="text-sm text-muted-foreground mb-5 break-keep">{PRIVATE.sessions}회 · 내 얼굴·내 일정에 맞춘 레슨</p>
                <p className="text-3xl font-light mb-1">{won(PRIVATE.price)}</p>
                <p className="text-xs text-muted-foreground mb-6">{PRIVATE.sessions}회 패키지</p>
                <p className="text-sm text-muted-foreground mb-6 break-keep">결제하신 뒤 담당자가 연락드려 날짜와 시간을 함께 정합니다.</p>
                <div className="mt-auto">
                  <Button className="w-full" size="lg" variant="outline" onClick={() => openApply("private")} data-testid="button-apply-private">1:1 레슨 신청</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6 break-keep">{REFUND_NOTICE}</p>

      {/* 신청 모달 */}
      <Dialog open={product !== null} onOpenChange={(o) => { if (!o && !submitting) setProduct(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{product === "private" ? `${PRIVATE.name} 신청` : `${GROUP.name} 신청`}</DialogTitle>
            <DialogDescription className="break-keep">
              {product === "private"
                ? `${PRIVATE.sessions}회 · ${won(PRIVATE.price)} — 결제 후 일정은 담당자가 조율합니다.`
                : openCohort ? `${openCohort.timeLabel} · 첫 모임 ${dayLabel(openCohort.sessions[0])} · ${won(GROUP.price)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="mp-name">이름</Label><Input id="mp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            <div><Label htmlFor="mp-phone">연락처</Label><Input id="mp-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" /></div>
            <div><Label htmlFor="mp-email">이메일</Label><Input id="mp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            <div className="flex items-start gap-2">
              <Checkbox id="mp-agree" checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
              <Label htmlFor="mp-agree" className="text-xs font-normal leading-relaxed text-muted-foreground break-keep">
                {REFUND_NOTICE} 신청·결제를 위한 개인정보(이름·연락처·이메일) 수집·이용에 동의합니다. 결제는 레코딩카페를 통해 처리되며 카드 명세서에 "레코딩카페"로 표기됩니다.
              </Label>
            </div>
            {error && <p className="text-sm text-destructive break-keep" role="alert">{error}</p>}
            <Button className="w-full" size="lg" onClick={submit} disabled={submitting} data-testid="button-submit">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `${won(product === "private" ? PRIVATE.price : GROUP.price)} 결제하기`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WaitlistForm({ onDone, done }: { onDone: () => void; done: boolean }) {
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (done) return <p className="text-sm text-primary text-center">다음 모임이 열리면 문자로 알려드릴게요.</p>;
  async function send() {
    setErr("");
    if (!n.trim() || !p.trim()) { setErr("이름과 연락처를 입력해 주세요."); return; }
    setBusy(true);
    try {
      const r = await fetch(`${RC_API}/api/gnclub/waitlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n, phone: p }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "신청 중 오류가 발생했습니다.");
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <Input placeholder="이름" value={n} onChange={(e) => setN(e.target.value)} />
      <Input placeholder="연락처" inputMode="tel" value={p} onChange={(e) => setP(e.target.value)} />
      {err && <p className="text-xs text-destructive">{err}</p>}
      <Button className="w-full" variant="outline" onClick={send} disabled={busy}>다음 모임 알림 받기</Button>
    </div>
  );
}
