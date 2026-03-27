import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Clock, ChevronRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { slug: "", label: "전체" },
  { slug: "basic-makeup", label: "기초메이크업" },
  { slug: "wedding-makeup", label: "웨딩메이크업" },
  { slug: "beauty-trend", label: "뷰티트렌드" },
  { slug: "makeup-tip", label: "메이크업팁" },
  { slug: "color-makeup", label: "색조화장" },
  { slug: "skincare", label: "피부관리" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "basic-makeup": "bg-pink-100 text-pink-700",
  "wedding-makeup": "bg-rose-100 text-rose-700",
  "beauty-trend": "bg-purple-100 text-purple-700",
  "makeup-tip": "bg-amber-100 text-amber-700",
  "color-makeup": "bg-red-100 text-red-700",
  "skincare": "bg-green-100 text-green-700",
};

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  category_slug: string;
  tags: string[];
  read_time: number;
  image_url: string | null;
  created_at: string;
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("");

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", activeCategory],
    queryFn: async () => {
      const url = activeCategory ? `/api/articles?category=${activeCategory}&limit=30` : "/api/articles?limit=30";
      const res = await fetch(url);
      return res.json();
    },
  });

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light tracking-wide cursor-pointer">
              <span className="font-semibold">GN</span> Makeup
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
            <Link href="/blog" className="text-foreground font-medium">뷰티 매거진</Link>
          </nav>
        </div>
      </header>

      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-pink-50 to-background py-14 px-4 text-center">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-2 mb-4 text-pink-500">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-widest">Beauty Magazine</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
              GN 뷰티 매거진
            </h1>
            <p className="text-muted-foreground text-lg">
              메이크업 레슨부터 뷰티 트렌드까지, 전문 강사진이 전하는 실용적인 뷰티 정보
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all font-medium ${
                    activeCategory === cat.slug
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>아직 발행된 글이 없습니다.</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && !activeCategory && (
                <Link href={`/blog/${featured.slug}`}>
                  <article className="mb-10 group cursor-pointer rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all">
                    <div className="md:flex">
                      <div className="md:w-1/2 h-64 md:h-auto bg-muted relative overflow-hidden">
                        {featured.image_url ? (
                          <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
                            <span className="text-6xl">💄</span>
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-foreground text-background text-xs px-3 py-1 rounded-full font-medium">
                          FEATURED
                        </span>
                      </div>
                      <div className="md:w-1/2 p-8 flex flex-col justify-center">
                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-4 w-fit ${CATEGORY_COLORS[featured.category_slug] ?? "bg-pink-100 text-pink-700"}`}>
                          {featured.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-medium mb-4 group-hover:text-pink-600 transition-colors leading-snug">
                          {featured.title}
                        </h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">{featured.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.read_time}분</span>
                          <span>{featured.created_at}</span>
                          <span className="flex items-center gap-1 text-foreground font-medium group-hover:gap-2 transition-all">
                            읽기 <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeCategory ? articles : rest).map((article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <article className="group cursor-pointer rounded-xl overflow-hidden border border-border hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                      <div className="h-48 bg-muted overflow-hidden">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                            <span className="text-4xl">💄</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium mb-3 ${CATEGORY_COLORS[article.category_slug] ?? "bg-pink-100 text-pink-700"}`}>
                          {article.category}
                        </span>
                        <h3 className="font-semibold text-base mb-2 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_time}분</span>
                          <span>{article.created_at}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 GN Makeup. 서울 강남구 역삼동 822-7 목화밀라트 1810호</p>
        <p className="mt-1">강남역 12번 출구 도보 3분 | 카카오톡 상담 가능</p>
      </footer>
    </div>
  );
}
