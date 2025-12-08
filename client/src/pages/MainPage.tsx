import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Star,
  Sparkles,
  Eye,
  ChevronDown,
  HelpCircle,
  Palette,
  Timer,
  Briefcase
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import heroImage2 from "@assets/지엔메이크업2_1765022120174.png";

export default function MainPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" data-testid="link-home">
            <span className="text-xl md:text-2xl font-light tracking-wide" data-testid="text-logo">
              <span className="font-semibold">GN</span> Makeup
            </span>
          </Link>
          <nav className="flex items-center gap-2 flex-wrap">
            <a
              href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-naver-booking"
            >
              <Button variant="ghost" size="sm">
                예약하기
              </Button>
            </a>
            <a
              href="https://booking.naver.com/review/bizes/522555"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-naver-review"
            >
              <Button variant="ghost" size="sm">
                수강후기
              </Button>
            </a>
            <Link href="/schedule" data-testid="link-schedule">
              <Button variant="default" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                스케줄
              </Button>
            </Link>
            <a
              href="https://gnmakeup.com"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-shop"
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                샵 바로가기
              </Button>
            </a>
          </nav>
        </div>
      </header>

      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-foreground text-sm font-medium">네이버 평점 4.81 / 5.0</span>
            <span className="text-muted-foreground text-xs">(176명 리뷰)</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-foreground" data-testid="text-hero-title">
            화알못도 <span className="font-semibold">금손</span>이 되는 시간
          </h2>
          <p className="text-lg md:text-xl text-foreground/90 mb-4 font-light" data-testid="text-hero-description">
            1:1 메이크업 원데이 클래스
          </p>
          <p className="text-base text-muted-foreground mb-10 max-w-xl mx-auto">
            유튜브 뷰티 영상을 봐도 내 얼굴엔 안 어울리나요?<br />
            나만의 얼굴 골격과 피부 톤에 맞춘 맞춤형 레슨을 경험하세요.
          </p>
          
          <div className="flex flex-col items-center gap-3 mb-12">
            <a
              href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8" data-testid="button-hero-booking">
                1:1 레슨 상담 및 예약하기
              </Button>
            </a>
            <span className="text-xs text-muted-foreground">네이버 예약에서 일반 메이크업으로 예약 후 비고에 "레슨"이라고 적어주세요</span>
          </div>

          <div className="block">
            <button 
              onClick={() => scrollToSection('intro')}
              className="animate-bounce text-muted-foreground"
              aria-label="스크롤"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <section id="intro" className="py-20 md:py-28 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-2xl md:text-3xl font-light mb-6" data-testid="text-intro-title">
            "유튜브 뷰티 영상을 봐도<br />
            <span className="font-medium">내 얼굴엔 안 어울리나요?</span>"
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-8">
            매일 아침, 어색한 눈썹과 둥둥 뜨는 파운데이션 때문에 고민이신가요?<br />
            <span className="font-medium text-foreground">초보자 메이크업 레슨 전문 GN Makeup</span>에서는 
            남들의 화장법이 아닌, 오직 당신만의 얼굴 골격과 피부 톤에 맞춘 솔루션을 제공합니다.
          </p>
          <p className="text-muted-foreground">
            획일적인 학원식 강의가 아닌,<br />
            <span className="text-foreground font-medium">실생활에서 바로 적용 가능한 데일리 메이크업 코칭</span>을 경험해보세요.
          </p>
        </div>
      </section>

      <section id="stats" className="py-16 border-y bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="text-center" data-testid="stat-rating">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-3xl md:text-4xl font-light mb-1">4.81</p>
              <p className="text-sm text-muted-foreground">176명 평점</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="text-center" data-testid="stat-interview">
              <Briefcase className="w-8 h-8 mx-auto mb-3 text-primary/70" />
              <p className="text-3xl md:text-4xl font-light mb-1">150+</p>
              <p className="text-sm text-muted-foreground">면접 성공 사례</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="text-center" data-testid="stat-location">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-primary/70" />
              <p className="text-3xl md:text-4xl font-light mb-1">3분</p>
              <p className="text-sm text-muted-foreground">강남역 거리</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="text-center" data-testid="stat-personal">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/70" />
              <p className="text-3xl md:text-4xl font-light mb-1">1:1</p>
              <p className="text-sm text-muted-foreground">맞춤 수업</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Why Choose Us</p>
              <h3 className="text-3xl md:text-4xl font-light mb-6">
                20년 경력의<br />
                <span className="font-medium">프로 메이크업 아티스트</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                176명으로부터 4.81 평점을 받은 유일한 메이크업샵.
                GN Makeup에서 나만의 메이크업 스타일을 찾아보세요.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">150건 이상의 면접 메이크업 성공 사례</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img 
                  src={heroImage2} 
                  alt="150+ Interview Success Stories" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="curriculum" className="py-20 md:py-28 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Curriculum</p>
            <h3 className="text-3xl md:text-4xl font-light" data-testid="text-curriculum-title">
              곰손도 할 수 있는 <span className="font-medium">커리큘럼</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden" data-testid="card-curriculum-1">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-400" />
              <CardContent className="p-8 pl-10">
                <div className="w-12 h-12 mb-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-rose-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">내 파우치 심폐소생술</h4>
                <p className="text-sm text-muted-foreground mb-4">(파우치 점검)</p>
                <p className="text-muted-foreground leading-relaxed">
                  새로운 화장품을 살 필요가 없습니다. 여러분이 가지고 있는 제품을 활용해 최적의 조합을 찾아드립니다.
                </p>
                <p className="text-sm text-primary mt-4 font-medium">
                  화알못 화장법의 시작은 내가 가진 도구를 제대로 쓰는 것!
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden" data-testid="card-curriculum-2">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-400" />
              <CardContent className="p-8 pl-10">
                <div className="w-12 h-12 mb-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-violet-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">곰손도 할 수 있는 아이 메이크업</h4>
                <p className="text-sm text-muted-foreground mb-4">(눈화장 공식)</p>
                <p className="text-muted-foreground leading-relaxed">
                  번지고 지워지는 눈화장은 이제 그만. 무쌍, 속쌍, 유쌍 눈화장 배우기 과정을 통해 내 눈매를 가장 또렷하게!
                </p>
                <p className="text-sm text-primary mt-4 font-medium">
                  어려운 그라데이션도 손쉽게 하는 노하우 전수
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden" data-testid="card-curriculum-3">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
              <CardContent className="p-8 pl-10">
                <div className="w-12 h-12 mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">직장인을 위한 10분 퀵 메이크업</h4>
                <p className="text-sm text-muted-foreground mb-4">(출근 화장)</p>
                <p className="text-muted-foreground leading-relaxed">
                  바쁜 아침, 시간은 줄이고 완성도는 높이는 직장인 출근 화장 스킬을 배웁니다.
                </p>
                <p className="text-sm text-primary mt-4 font-medium">
                  베이스 지속력 UP + 생기있는 최소 터치
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Reviews</p>
            <h3 className="text-3xl md:text-4xl font-light" data-testid="text-reviews-title">
              수강생 <span className="font-medium">리얼 후기</span>
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-lg font-medium">4.81</span>
              <span className="text-muted-foreground text-sm">(176명)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card data-testid="card-review-1">
              <CardContent className="p-8">
                <div className="text-4xl text-primary/20 mb-4 font-serif">"</div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  유튜브만 보다가 직접 <span className="text-foreground font-medium">1:1 메이크업 강좌</span>를 들으니 
                  브러쉬 잡는 법부터 달랐어요. 이제 <span className="text-foreground font-medium">출근 준비 시간이 반으로 줄었습니다!</span>
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-medium">30대 직장인 김OO님</p>
              </CardContent>
            </Card>

            <Card data-testid="card-review-2">
              <CardContent className="p-8">
                <div className="text-4xl text-primary/20 mb-4 font-serif">"</div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  똥손이라 걱정했는데, <span className="text-foreground font-medium">제 눈에 맞는 아이라인 그리는 법</span>을 배우고 
                  자신감이 생겼어요. <span className="text-foreground font-medium">나에게 맞는 화장법 찾기</span>를 원하신다면 강력 추천합니다.
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-medium">20대 대학생 이OO님</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <a
              href="https://booking.naver.com/review/bizes/522555"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" data-testid="button-more-reviews">
                네이버에서 176개 후기 더보기
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-28 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">FAQ</p>
            <h3 className="text-3xl md:text-4xl font-light" data-testid="text-faq-title">
              자주 묻는 <span className="font-medium">질문</span>
            </h3>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" data-testid="faq-item-1">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>메이크업을 한 번도 안 해본 완전 초보도 가능한가요?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                <p className="text-muted-foreground leading-relaxed">
                  네, 가능합니다. 저희 클래스는 <span className="text-foreground font-medium">기초 스킨케어부터 도구 사용법</span>까지 
                  알려드리는 기초 메이크업 배우기 과정에 특화되어 있습니다. 
                  브러쉬 잡는 법부터 차근차근 알려드려요.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" data-testid="faq-item-2">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>준비물이 따로 필요한가요?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                <p className="text-muted-foreground leading-relaxed">
                  평소 사용하시는 <span className="text-foreground font-medium">화장품(파우치)을 가져오시면 됩니다.</span> 
                  부족한 제품은 샵에 비치된 전문가용 제품으로 퍼스널컬러 메이크업 실습을 진행합니다.
                  내 파우치 제품을 활용해 배우니 집에 가서도 바로 적용할 수 있어요!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" data-testid="faq-item-3">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>레슨 시간은 얼마나 걸리나요?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                <p className="text-muted-foreground leading-relaxed">
                  1:1 레슨은 보통 <span className="text-foreground font-medium">1시간</span> 정도 소요됩니다. 
                  개인의 수준과 목표에 따라 조금씩 달라질 수 있으며, 
                  상담 시 자세한 커리큘럼을 안내해 드립니다.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" data-testid="faq-item-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>한 번 레슨으로 충분한가요?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                <p className="text-muted-foreground leading-relaxed">
                  원데이 클래스만으로도 <span className="text-foreground font-medium">데일리 메이크업의 기본기</span>를 
                  충분히 익히실 수 있습니다. 더 심화된 내용을 원하시면 추가 레슨도 가능해요. 
                  상담 시 개인 목표에 맞는 과정을 추천해 드립니다.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section id="location" className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Location</p>
            <h3 className="text-3xl md:text-4xl font-light" data-testid="text-location-title">
              오시는 <span className="font-medium">길</span>
            </h3>
          </div>

          <Card data-testid="card-location">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">주소</p>
                      <p className="text-muted-foreground">
                        서울 강남구 역삼동 822-7 목화밀라트 1810호
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">운영시간</p>
                      <p className="text-muted-foreground">
                        오전 10시 - 오후 8시 (예약제)
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium mb-1">강남역 3분 거리</p>
                    <p className="text-xs text-muted-foreground">
                      강남역 11번 출구에서 도보 3분
                    </p>
                  </div>
                </div>
                <div className="aspect-[4/3] lg:aspect-auto rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">강남역 11번 출구</p>
                    <p className="text-xs text-muted-foreground">도보 3분</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50/50 to-stone-50 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-stone-950" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 bg-rose-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-light mb-4" data-testid="text-cta-title">
            지금 바로<br />
            <span className="font-medium">'곰손 탈출'</span>을 시작하세요!
          </h3>
          <p className="text-muted-foreground mb-8">
            아래 버튼을 눌러 상담을 신청해 보세요.
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-10" data-testid="button-cta-booking">
                1:1 레슨 상담 및 예약하기
              </Button>
            </a>
            <span className="text-xs text-muted-foreground">네이버 예약에서 일반 메이크업으로 예약 후 비고에 "레슨"이라고 적어주세요</span>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-center mb-8">
            <span className="text-2xl font-light tracking-wide">
              <span className="font-semibold">GN</span> Makeup
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h4 className="font-medium mb-3">GN Makeup</h4>
              <p className="text-sm text-muted-foreground">
                화알못도 금손이 되는<br />
                1:1 맞춤 메이크업 클래스
              </p>
              <div className="flex items-center gap-1 mt-2 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">4.81 (176)</span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-medium mb-3">커리큘럼</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>파우치 점검 (내 화장품 활용)</li>
                <li>아이 메이크업 (눈화장 공식)</li>
                <li>10분 퀵 메이크업 (출근 화장)</li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-medium mb-3">연락처</h4>
              <div className="space-y-2">
                <a
                  href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground flex items-center gap-2 justify-center md:justify-start"
                >
                  <ExternalLink className="w-4 h-4" />
                  네이버 예약
                </a>
                <p className="text-sm text-muted-foreground">
                  강남역 11번 출구 도보 3분
                </p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground" data-testid="text-footer">
              © 2025 GN Makeup. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
