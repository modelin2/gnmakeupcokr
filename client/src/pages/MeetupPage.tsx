import { useEffect } from "react";
import { Link } from "wouter";
import { Star, Briefcase, Heart, Camera, UserCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MeetupApply, { REFUND_NOTICE, readSource } from "@/components/MeetupApply";

// /meetup — 강남 실전 메이크업 레슨(메이크업 모임 · 1:1 레슨 택1). 신청·결제 영역은 components/MeetupApply (레코딩카페 API 호출).

const NAVER_PLACE = "https://map.naver.com/p/entry/place/21423491"; // 네이버 지도 플레이스(지엔 메이크업)
const NAVER_RATING = { score: "4.88", reviews: 204, asOf: "2026.10.10" }; // 네이버 지도 방문자 리뷰 기준 — 확인일 기준 값
const PLACE = "서울 강남구 역삼동 822-7 목화밀라트 1810호 (강남역 3분)";

const USE_CASES = [
  { icon: Briefcase, title: "면접·이직", desc: "단정하고 일 잘할 것 같은 첫인상" },
  { icon: Heart, title: "맞선·소개팅", desc: "호감이 먼저 가는 얼굴 설계" },
  { icon: UserCheck, title: "영업·서비스직", desc: "처음 보는 사람에게 믿음 주는 인상" },
  { icon: Camera, title: "프로필·촬영", desc: "카메라 앞에서도 덜 피곤해 보이는 베이스" },
];

export default function MeetupPage() {
  useEffect(() => {
    readSource();
    const prev = { title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null };
    document.title = "강남 실전 메이크업 레슨 | 면접·맞선 메이크업 메이크업 모임 · 1:1 레슨 - GN Makeup";
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", "https://www.gnmakeup.co.kr/meetup");
    return () => {
      document.title = prev.title;
      if (prev.canonical) document.querySelector('link[rel="canonical"]')?.setAttribute("href", prev.canonical);
    };
  }, []);

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

      {/* 히어로 — 짧게 */}
      <section className="min-h-[80vh] flex items-center justify-center pt-16 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="text-center max-w-3xl mx-auto">
          <a href={NAVER_PLACE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8" data-testid="link-rating">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">네이버 평점 {NAVER_RATING.score}</span>
            <span className="text-xs text-muted-foreground">방문자 리뷰 {NAVER_RATING.reviews}</span>
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
            <div><p className="text-3xl font-light">{NAVER_RATING.score}</p><p className="text-xs text-muted-foreground">네이버 평점</p></div>
            <div><p className="text-3xl font-light">{NAVER_RATING.reviews}</p><p className="text-xs text-muted-foreground">방문자 리뷰</p></div>
            <div><p className="text-3xl font-light">150+</p><p className="text-xs text-muted-foreground">면접 메이크업 사례</p></div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">네이버 지도 방문자 리뷰 기준, {NAVER_RATING.asOf} 확인</p>
        </div>
      </section>

      {/* 상품 선택 */}
      <section id="apply" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-3">둘 중 하나를 <span className="font-medium">선택</span>하세요</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">같은 현업 노하우를 함께 배울지, 나에게만 맞춰 배울지</p>
          <MeetupApply returnPath="/meetup" />
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
        </div>
      </section>

      <footer className="py-10 px-4 border-t text-center text-xs text-muted-foreground leading-relaxed break-keep">
        주관 GN Makeup · 신청·결제 레코딩카페 · 카드 명세서에는 "레코딩카페"로 표기됩니다.
      </footer>

    </div>
  );
}
