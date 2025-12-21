import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { News as NewsType } from "@/types/database";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const News = () => {
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false });

    if (!error && data) {
      setNews(data);
    }
    setLoading(false);
  };

  const categories = Array.from(new Set(news.map((n) => n.category).filter(Boolean)));
  const filteredNews = filter
    ? news.filter((n) => n.category === filter)
    : news;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Новости и акции
              </h1>
              <p className="mt-2 text-muted-foreground">
                Актуальные события рынка новостроек
              </p>
            </div>

            {/* Categories */}
            <div className="mb-8 flex flex-wrap gap-2">
              <Button
                variant={filter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(null)}
              >
                Все
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : filteredNews.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.slug}`}>
                    <article className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {item.is_promo && (
                            <Badge className="bg-accent text-accent-foreground">
                              Акция
                            </Badge>
                          )}
                          {item.category && (
                            <Badge variant="outline">{item.category}</Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {item.excerpt}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.published_at &&
                              format(new Date(item.published_at), "d MMM yyyy", {
                                locale: ru,
                              })}
                          </span>
                          <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                            Читать <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Нет новостей</h3>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
