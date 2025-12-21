import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { News } from "@/types/database";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const NewsDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    const { data } = await supabase
      .from("news")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      setArticle(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-96 rounded-2xl bg-muted" />
              <div className="h-10 w-3/4 rounded bg-muted" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Tag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Статья не найдена</h1>
            <Link to="/news">
              <Button className="mt-4">Все новости</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="py-8 sm:py-12">
          <div className="container max-w-3xl">
            <Link to="/news">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Все новости
              </Button>
            </Link>

            <div className="flex items-center gap-2 mb-4">
              {article.is_promo && (
                <Badge className="bg-accent text-accent-foreground">Акция</Badge>
              )}
              {article.category && (
                <Badge variant="outline">{article.category}</Badge>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {article.published_at &&
                  format(new Date(article.published_at), "d MMMM yyyy", {
                    locale: ru,
                  })}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
              {article.title}
            </h1>

            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full rounded-2xl mb-8 aspect-[16/9] object-cover"
              />
            )}

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {article.content || article.excerpt}
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;
