import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Star, Briefcase, Heart, Camera, UserCheck, Users, User, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// /meetup — 강남 실전 메이크업 레슨(메이크업 모임 · 1:1 레슨 택1). 신청·결제·현황은 레코딩카페 API(/api/gnclub/*)를 직접 호출한다
// (co.co.kr/meditherapy와 같은 구조 — 토스 승인·DB·문자는 모두 레코딩카페 쪽). 금액은 서버가 정하고, 아래 숫자는 화면 표기용이다.
const RC_API: string = (import.meta.env.VITE_RC_API as string | undefined) ?? "https://www.recordingcafe.com";

const NAVER_BOOKING = "https://booking.naver.com/booking/13/bizes/522555/items/3912107";
const NAVER_REVIEWS = "https://booking.naver.com/review/bizes/522555";
const PLACE = "서울 강남구 역삼동 822-7 목화밀라트 1810호 (강남역 3분)";

const GROUP = { name: "메이크업 모임", price: 243_000, monthly: 81_000, months: 3, sessions: 4, capacity: 6, intervalDays: 21 };
const PRIVATE = { name: "1:1 레슨", price: 700_000, sessions: 4 };
const REFUND_NOTICE = "첫 모임·레슨이 시작되기 전까지는 환불할 수 있고, 시작한 뒤에는 환불이 되지 않습니다.";

// 네이버 지도 전수조사 결과(조사 방식·기준일·순위). 조사가 끝나 수치가 확정되기 전에는 null — null이면 "1위" 문구를 화면에 내지 않는다.
type RankStudy = { rank: number; total: number; basis: string; date: string; source: string; method: string };
const RANK_STUDY: RankStudy | null = null;

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
function readSource(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    const fresh = [p.get("utm_source"), p.get("utm_campaign")].filter(Boolean).join("/");
    if (fresh) sessionStorage.setItem("gn_meetup_src", fresh.slice(0, 80));
    return sessionStorage.getItem("gn_meetup_src") ?? "";
  } catch {
    return "";
  }
}

const USE_CASES = [
  { icon: Briefcase, title: "면접·이직", desc: "단정하고 일 잘할 것 같은 첫인상" },
  { icon: Heart, title: "맞선·소개팅", desc: "호감이 먼저 가는 얼굴 설계" },
  { icon: UserCheck, title: "영업·서비스직", desc: "처음 보는 사람에게 믿음 주는 인상" },
  { icon: Camera, title: "프로필·촬영", desc: "카메라 앞에서도 덜 피곤해 보이는 베이스" },
];

export default function MeetupPage() {
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
    const prev = { title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null };
    document.title = "강남 실전 메이크업 레슨 | 면접·맞선 메이크업 메이크업 모임 · 1:1 레슨 - GN Makeup";
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", "https://www.gnmakeup.co.kr/meetup");
    return () => {
      window.clearInterval(timer);
      document.title = prev.title;
      if (prev.canonical) document.querySelector('link[rel="canonical"]')?.setAttribute("href", prev.canonical);
    };
  }, [loadStatus]);

  // 토스 결제창에서 돌아온 경우 승인 처리
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const paymentKey = p.get("paymentKey");
    const orderId = p.get("orderId");
    const amount = p.get("amount");
    if (!paymentKey && !p.get("tossFail")) return;
    window.history.replaceState({}, "", "/meetup");
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
  }, [loadStatus]);

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
      successUrl: `${origin}/meetup`,
      failUrl: `${origin}/meetup?tossFail=1`,
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
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">결제를 확인하고 있습니다…</div>;
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <CheckCircle2 className="w-14 h-14 mx-auto mb-6 text-primary" />
          <h1 className="text-2xl font-medium mb-3 break-keep">
            {done.product === "group" ? `${GROUP.name} 신청이 완료되었습니다` : `${PRIVATE.name} 결제가 완료되었습니다`}
          </h1>
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
          <p className="text-xs text-muted-foreground mb-8">카드 명세서에는 "레코딩카페"로 표기됩니다.</p>
          <Link href="/"><Button variant="outline">GN Makeup 홈으로</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl md:text-2xl font-light tracking-wide"><span className="font-semibold">GN</span> Makeup</span>
          </Link>
          <Button size="sm" onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-header-apply">
            신청하기
          </Button>
        </div>
      </header>

      {confirmError && (
        <div className="fixed top-14 inset-x-0 z-40 bg-destructive text-destructive-foreground text-sm text-center px-4 py-2 break-keep" role="alert">
          {confirmError} 결제가 이미 되었다면 중복 결제하지 마시고 문의해 주세요.
        </div>
      )}

      {/* 히어로 — 짧게 */}
      <section className="min-h-[80vh] flex items-center justify-center pt-16 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="text-center max-w-3xl mx-auto">
          <a href={NAVER_REVIEWS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8" data-testid="link-rating">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">네이버 평점 4.81</span>
            <span className="text-xs text-muted-foreground">리뷰 176</span>
            {RANK_STUDY && <span className="text-sm font-semibold text-primary">· 서울 메이크업샵 {RANK_STUDY.rank}위</span>}
          </a>
          <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6 break-keep" data-testid="text-hero-title">
            강남 <span className="font-semibold">실전 메이크업</span>을<br />그대로
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-10 break-keep">면접·맞선처럼 결과가 나와야 하는 메이크업, 현업의 방식 그대로.</p>
          <Button size="lg" className="px-8" onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-hero-apply">
            메이크업 모임 · 1:1 레슨 보기
          </Button>
        </div>
      </section>

      {/* 어떤 순간에 쓰는가 */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-10 break-keep">결과가 나와야 하는 <span className="font-medium">순간</span>을 위한 메이크업</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {USE_CASES.map((u) => (
              <Card key={u.title}>
                <CardContent className="p-5 text-center">
                  <u.icon className="w-7 h-7 mx-auto mb-3 text-primary/80" />
                  <p className="font-medium mb-1">{u.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed break-keep">{u.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 왜 현업인가 */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-6 break-keep">레슨 학원이 아닌, <span className="font-medium">매일 현장에서 하는 사람</span></h2>
          <p className="text-muted-foreground leading-relaxed mb-8 break-keep">
            GN Makeup은 면접·맞선 같은 실제 일정을 앞둔 분들의 메이크업을 매일 합니다. 현장에서 결과를 내는 방식 그대로, 내 얼굴에 맞게 알려드립니다.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            <div><p className="text-3xl font-light">4.81</p><p className="text-xs text-muted-foreground">네이버 평점</p></div>
            <div><p className="text-3xl font-light">176</p><p className="text-xs text-muted-foreground">네이버 리뷰</p></div>
            <div><p className="text-3xl font-light">150+</p><p className="text-xs text-muted-foreground">면접 메이크업 사례</p></div>
          </div>
          {RANK_STUDY && (
            <div className="mt-10 text-left rounded-lg border bg-card/50 p-5 text-sm leading-relaxed" data-testid="rank-study">
              <p className="font-medium mb-2">네이버 지도 평점 조사 — 서울 메이크업샵 {RANK_STUDY.total}곳 중 {RANK_STUDY.rank}위</p>
              <p className="text-muted-foreground">기준: {RANK_STUDY.basis}<br />조사일: {RANK_STUDY.date}<br />출처: {RANK_STUDY.source}<br />방법: {RANK_STUDY.method}</p>
            </div>
          )}
        </div>
      </section>

      {/* 상품 선택 */}
      <section id="apply" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-3">둘 중 하나를 <span className="font-medium">선택</span>하세요</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">같은 현업 노하우를 함께 배울지, 나에게만 맞춰 배울지</p>
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
        </div>
      </section>

      {/* 장소·FAQ */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <p className="flex items-start justify-center gap-2 text-sm text-muted-foreground mb-10 text-center"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{PLACE}</p>
          <Accordion type="single" collapsible>
            <AccordionItem value="a"><AccordionTrigger>메이크업 모임과 1:1 레슨 중 무엇이 맞을까요?</AccordionTrigger>
              <AccordionContent className="break-keep">현업 노하우를 여러 명과 함께 합리적으로 배우고 싶다면 메이크업 모임, 면접·맞선 등 내 일정과 내 얼굴에 맞춰 집중하고 싶다면 1:1 레슨을 권합니다. 두 가지 중 하나를 선택해 신청합니다.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>초보자도 할 수 있나요?</AccordionTrigger>
              <AccordionContent className="break-keep">네. 이미 가지고 계신 화장품과 도구로 시작해서, 실제 일정에 바로 쓸 수 있는 방법부터 알려드립니다.</AccordionContent></AccordionItem>
            <AccordionItem value="c"><AccordionTrigger>환불이 가능한가요?</AccordionTrigger>
              <AccordionContent className="break-keep">{REFUND_NOTICE}</AccordionContent></AccordionItem>
            <AccordionItem value="d"><AccordionTrigger>결제는 어떻게 하나요?</AccordionTrigger>
              <AccordionContent className="break-keep">신청서를 작성하면 카드결제창이 열립니다. 결제는 레코딩카페를 통해 처리되어 카드 명세서에는 "레코딩카페"로 표기됩니다.</AccordionContent></AccordionItem>
          </Accordion>
          <div className="text-center mt-10">
            <a href={NAVER_BOOKING} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline underline-offset-4">레슨 1회만 먼저 상담·예약하고 싶다면 (네이버 예약)</a>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 border-t text-center text-xs text-muted-foreground leading-relaxed break-keep">
        주관 GN Makeup · 신청·결제 레코딩카페 · 카드 명세서에는 "레코딩카페"로 표기됩니다.
      </footer>

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
    </div>
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
