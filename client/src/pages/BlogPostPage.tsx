import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Clock, ArrowLeft, Tag } from "lucide-react";
import { useEffect } from "react";

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
  content: string;
  meta_description: string;
  category: string;
  category_slug: string;
  tags: string[];
  author: string;
  read_time: number;
  image_url: string | null;
  created_at: string;
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: article, isLoading, isError } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  // 동적 메타태그 업데이트
  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} | GN Makeup 뷰티 매거진`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", article.meta_description || article.excerpt || "");
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", article.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", article.meta_description || article.excerpt || "");
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg && article.image_url) ogImg.setAttribute("content", article.image_url);
    return () => {
      document.title = "GN Makeup | 강남 1:1 메이크업 레슨";
    };
  }, [article]);

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
            <Link href="/blog" className="hover:text-foreground transition-colors">뷰티 매거진</Link>
          </nav>
        </div>
      </header>

      <main className="pt-20 pb-16">
        {isLoading ? (
          <div className="container mx-auto px-4 py-20 max-w-3xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-64 bg-muted rounded-xl" />
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}
              </div>
            </div>
          </div>
        ) : isError || !article ? (
          <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
            <p className="text-muted-foreground mb-6">글을 찾을 수 없습니다.</p>
            <Link href="/blog">
              <button className="flex items-center gap-2 mx-auto text-sm text-foreground hover:underline">
                <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
              </button>
            </Link>
          </div>
        ) : (
          <article className="container mx-auto px-4 max-w-3xl">
            {/* Back */}
            <Link href="/blog">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 mt-6">
                <ArrowLeft className="w-4 h-4" /> 뷰티 매거진으로
              </button>
            </Link>

            {/* Category + Title */}
            <header className="mb-8">
              <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-4 ${CATEGORY_COLORS[article.category_slug] ?? "bg-pink-100 text-pink-700"}`}>
                {article.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-medium leading-tight mb-6">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                <span>{article.author}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.read_time}분 읽기</span>
                <span>{article.created_at}</span>
              </div>
            </header>

            {/* Hero Image */}
            {article.image_url && (
              <div className="mb-10 rounded-2xl overflow-hidden">
                <img src={article.image_url} alt={article.title} className="w-full h-64 md:h-96 object-cover" />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-neutral max-w-none
                prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
                prose-p:leading-8 prose-p:text-muted-foreground prose-p:mb-5
                prose-strong:text-foreground prose-li:text-muted-foreground prose-li:leading-7"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl text-center border border-pink-100">
              <p className="text-lg font-medium mb-2">메이크업 레슨에 관심 있으신가요?</p>
              <p className="text-muted-foreground text-sm mb-6">강남역 3분 거리, 1:1 맞춤 메이크업 레슨 상담 신청</p>
              <a
                href="https://booking.naver.com/booking/13/bizes/522555/items/3912107"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-foreground text-background px-8 py-3 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
              >
                네이버 예약하기
              </a>
            </div>
          </article>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 GN Makeup. 서울 강남구 역삼동 822-7 목화밀라트 1810호</p>
        <p className="mt-1">강남역 12번 출구 도보 3분 | 카카오톡 상담 가능</p>
      </footer>
    </div>
  );
}
