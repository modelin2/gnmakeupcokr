import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ExternalLink, MapPin, Clock, Phone, Star } from "lucide-react";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold" data-testid="text-logo">GN Makeup</h1>
          <nav className="flex items-center gap-2 flex-wrap">
            <a
              href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-naver-booking"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                네이버예약
              </Button>
            </a>
            <a
              href="https://booking.naver.com/review/bizes/522555"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-naver-review"
            >
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-1" />
                네이버후기
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

      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-rose-100 to-pink-50 dark:from-rose-950/30 dark:to-background"
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative z-10 text-center px-4">
          <p className="text-sm text-muted-foreground mb-2" data-testid="text-subtitle">Professional Makeup Artist</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">
            메이크업의 <span className="text-primary">아름다움</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto" data-testid="text-hero-description">
            당신만의 특별한 순간을 위한 프로페셔널 메이크업 서비스
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" data-testid="button-hero-booking">
                예약하기
              </Button>
            </a>
            <Link href="/schedule">
              <Button variant="outline" size="lg" data-testid="button-hero-schedule">
                스케줄 확인
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-center mb-8" data-testid="text-services-title">
            전문가의 터치로 완성되는 뷰티
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-service-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">본식 메이크업</h4>
                <p className="text-sm text-muted-foreground">
                  인생에서 가장 아름다운 날을 위한 특별한 메이크업
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-service-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">촬영 메이크업</h4>
                <p className="text-sm text-muted-foreground">
                  프로필, 화보, 영상 촬영을 위한 전문 메이크업
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-service-3">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">레슨</h4>
                <p className="text-sm text-muted-foreground">
                  나만의 메이크업 스킬을 배우는 1:1 맞춤 클래스
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-center mb-8" data-testid="text-reviews-title">
            고객 후기
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-review-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "정말 만족스러운 메이크업이었어요. 오래 지속되고 자연스러워서 좋았습니다."
                </p>
                <p className="text-xs font-medium">- 김** 고객님</p>
              </CardContent>
            </Card>
            <Card data-testid="card-review-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "촬영 메이크업 받았는데 사진이 정말 잘 나왔어요. 감사합니다!"
                </p>
                <p className="text-xs font-medium">- 이** 고객님</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://booking.naver.com/review/bizes/522555"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" data-testid="button-more-reviews">
                <ExternalLink className="w-4 h-4 mr-2" />
                더 많은 후기 보기
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-center mb-8" data-testid="text-location-title">
            오시는 길
          </h3>
          <Card data-testid="card-location">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">주소</p>
                      <p className="text-sm text-muted-foreground">
                        서울특별시 강남구
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">영업시간</p>
                      <p className="text-sm text-muted-foreground">
                        오전 6시 - 오후 8시 (예약제)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">연락처</p>
                      <p className="text-sm text-muted-foreground">
                        네이버 예약으로 문의
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted rounded-md h-48 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">강남역 3분거리</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-footer">
            © 2025 GN Makeup. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
