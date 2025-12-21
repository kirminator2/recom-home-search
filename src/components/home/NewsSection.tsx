import { ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const news = [
  {
    id: "1",
    title: "Новые правила ипотеки с господдержкой в 2025 году",
    excerpt: "С января 2025 года вступают в силу изменения в программе льготной ипотеки для семей с детьми.",
    date: "15 декабря 2024",
    category: "Ипотека",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
  },
  {
    id: "2",
    title: "ПИК открыл продажи в новом ЖК «Солнечные острова»",
    excerpt: "Старт продаж квартир в новом жилом комплексе комфорт-класса на юге Москвы.",
    date: "12 декабря 2024",
    category: "Новости рынка",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    id: "3",
    title: "Скидки до 15% на квартиры в ЖК «Парк Легенд»",
    excerpt: "Донстрой объявил о новогодней акции с максимальными скидками за всю историю продаж.",
    date: "10 декабря 2024",
    category: "Акции",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
];

export const NewsSection = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Новости и акции
            </h2>
            <p className="mt-2 text-muted-foreground">
              Актуальные события рынка недвижимости
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start">
            Все новости
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Featured News */}
          <article className="group relative overflow-hidden rounded-2xl bg-card shadow-card lg:col-span-2 lg:row-span-2 cursor-pointer transition-all duration-300 hover:shadow-hover">
            <div className="absolute inset-0">
              <img
                src={news[0].imageUrl}
                alt={news[0].title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
            </div>
            <div className="relative flex h-full min-h-[300px] flex-col justify-end p-6 lg:min-h-[400px] lg:p-8">
              <Badge className="mb-4 w-fit bg-accent text-accent-foreground border-0">
                <Tag className="mr-1.5 h-3 w-3" />
                {news[0].category}
              </Badge>
              <h3 className="mb-3 text-xl font-bold text-primary-foreground lg:text-2xl">
                {news[0].title}
              </h3>
              <p className="mb-4 text-primary-foreground/80 line-clamp-2">
                {news[0].excerpt}
              </p>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Calendar className="h-4 w-4" />
                {news[0].date}
              </div>
            </div>
          </article>

          {/* Other News */}
          {news.slice(1).map((item) => (
            <article
              key={item.id}
              className="group flex gap-4 rounded-xl bg-card p-4 shadow-card cursor-pointer transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-between py-1">
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {item.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {item.date}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
