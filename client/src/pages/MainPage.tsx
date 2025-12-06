import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Sparkles,
  GraduationCap,
  Palette,
  Award,
  Briefcase,
  ChevronDown
} from "lucide-react";

export default function MainPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-light tracking-wide" data-testid="text-logo">
            <span className="font-medium">GN</span> Makeup
          </h1>
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
          </nav>
        </div>
      </header>

      <section className="relative min-h-[85vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50/30 to-stone-50 dark:from-rose-950/20 dark:via-amber-950/10 dark:to-stone-950" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6" data-testid="text-subtitle">
            1:1 Personal Makeup Lesson
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight" data-testid="text-hero-title">
            메이크업을 배우는
            <br />
            <span className="font-medium">특별한 시간</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 font-light" data-testid="text-hero-description">
            한층 더 자신있게 나를 표현할 수 있는 시간
          </p>
          <p className="text-base text-muted-foreground/80 mb-10">
            2,800명 이상의 수강생이 선택한 1:1 맞춤 메이크업 클래스
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
            <a
              href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8" data-testid="button-hero-booking">
                상담 신청하기
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8"
              onClick={() => scrollToSection('reviews')}
              data-testid="button-hero-reviews"
            >
              수강후기 보기
            </Button>
          </div>

          <button 
            onClick={() => scrollToSection('stats')}
            className="animate-bounce text-muted-foreground/60"
            aria-label="스크롤"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      <section id="stats" className="py-16 border-y bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="text-center" data-testid="stat-students">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary/70" />
              <p className="text-3xl md:text-4xl font-light mb-1">2,800+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">수강생</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="text-center" data-testid="stat-location">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-primary/70" />
              <p className="text-3xl md:text-4xl font-light mb-1">3분</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">강남역 거리</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="text-center" data-testid="stat-personal">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/70" />
              <p className="text-3xl md:text-4xl font-light mb-1">1:1</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">맞춤 수업</p>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Programs</p>
            <h3 className="text-3xl md:text-4xl font-light" data-testid="text-programs-title">
              나에게 맞는 <span className="font-medium">프로그램</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group transition-all duration-300 hover:-translate-y-1" data-testid="card-program-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 mb-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Palette className="w-7 h-7 text-rose-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">셀프 메이크업</h4>
                <p className="text-muted-foreground leading-relaxed">
                  나에게 어울리는 메이크업을 직접 할 수 있도록 기초부터 차근차근 배우는 클래스
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:-translate-y-1" data-testid="card-program-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-amber-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">취미반</h4>
                <p className="text-muted-foreground leading-relaxed">
                  메이크업을 취미로 즐기고 싶은 분들을 위한 편안하고 즐거운 클래스
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:-translate-y-1" data-testid="card-program-3">
              <CardContent className="p-8">
                <div className="w-14 h-14 mb-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Award className="w-7 h-7 text-violet-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">자격증반</h4>
                <p className="text-muted-foreground leading-relaxed">
                  메이크업 국가자격증 취득을 목표로 체계적으로 준비하는 전문 클래스
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:-translate-y-1" data-testid="card-program-4">
              <CardContent className="p-8">
                <div className="w-14 h-14 mb-6 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-sky-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">대학입시반</h4>
                <p className="text-muted-foreground leading-relaxed">
                  뷰티학과 입시를 준비하는 학생들을 위한 맞춤형 실기 준비 클래스
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:-translate-y-1" data-testid="card-program-5">
              <CardContent className="p-8">
                <div className="w-14 h-14 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-emerald-500" />
                </div>
                <h4 className="text-xl font-medium mb-3">전문가반</h4>
                <p className="text-muted-foreground leading-relaxed">
                  메이크업 아티스트로 활동하고자 하는 분들을 위한 심화 과정 클래스
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:-translate-y-1 bg-primary/5 border-primary/20" data-testid="card-program-cta">
              <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg font-medium mb-4">나에게 맞는 클래스가 궁금하세요?</p>
                <a
                  href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>
                    무료 상담받기
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Why Choose Us</p>
              <h3 className="text-3xl md:text-4xl font-light mb-6" data-testid="text-why-title">
                <span className="font-medium">2,800명</span>이 선택한 이유
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">나만을 위한 1:1 맞춤 커리큘럼</h4>
                    <p className="text-muted-foreground text-sm">
                      개인의 피부톤, 얼굴형, 취향에 맞춘 맞춤형 수업을 진행합니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">체계적인 단계별 교육</h4>
                    <p className="text-muted-foreground text-sm">
                      기초부터 심화까지 단계별로 배워 확실하게 실력을 향상시킵니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">강남역 도보 3분 접근성</h4>
                    <p className="text-muted-foreground text-sm">
                      편리한 위치에서 부담 없이 수업에 참여할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-rose-100 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/40" />
                  <p className="text-lg font-light text-muted-foreground">
                    나만의 메이크업 스타일을 찾아보세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Reviews</p>
            <h3 className="text-3xl md:text-4xl font-light" data-testid="text-reviews-title">
              수강생 <span className="font-medium">후기</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card data-testid="card-review-1">
              <CardContent className="p-8">
                <div className="text-4xl text-primary/20 mb-4 font-serif">"</div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  메이크업을 전혀 못하던 제가 이제는 혼자서도 자신있게 할 수 있게 되었어요. 정말 감사합니다!
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-medium">김** 수강생</p>
                <p className="text-xs text-muted-foreground">셀프메이크업 과정</p>
              </CardContent>
            </Card>

            <Card data-testid="card-review-2">
              <CardContent className="p-8">
                <div className="text-4xl text-primary/20 mb-4 font-serif">"</div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  1:1 수업이라 제 얼굴에 맞는 메이크업을 배울 수 있어서 좋았어요. 다른 곳과 확실히 달라요.
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-medium">이** 수강생</p>
                <p className="text-xs text-muted-foreground">취미반 과정</p>
              </CardContent>
            </Card>

            <Card data-testid="card-review-3">
              <CardContent className="p-8">
                <div className="text-4xl text-primary/20 mb-4 font-serif">"</div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  자격증 준비하면서 불안했는데, 체계적인 커리큘럼 덕분에 한 번에 합격했습니다!
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-medium">박** 수강생</p>
                <p className="text-xs text-muted-foreground">자격증반 과정</p>
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
                더 많은 후기 보기
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="location" className="py-20 md:py-28 px-4 bg-muted/30">
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
                        서울특별시 강남구 강남대로94길 10
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
            나만의 메이크업 스타일을
            <br />
            <span className="font-medium">찾아보세요</span>
          </h3>
          <p className="text-muted-foreground mb-8">
            무료 상담을 통해 나에게 맞는 프로그램을 추천받으세요
          </p>
          <a
            href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="px-10" data-testid="button-cta-booking">
              무료 상담 신청하기
            </Button>
          </a>
        </div>
      </section>

      <footer className="py-12 px-4 border-t bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-medium mb-3">GN Makeup</h4>
              <p className="text-sm text-muted-foreground">
                2,800명 이상의 수강생이 선택한
                <br />
                1:1 맞춤 메이크업 클래스
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">프로그램</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>셀프메이크업</li>
                <li>취미반 / 자격증반</li>
                <li>대학입시반 / 전문가반</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">연락처</h4>
              <div className="space-y-2">
                <a
                  href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground flex items-center gap-2"
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
