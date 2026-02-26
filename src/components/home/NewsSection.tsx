import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const news = [
  {
    id: "1",
    title: "Новые правила ипотеки с господдержкой в 2025 году",
    excerpt: "С января 2025 года вступают в силу изменения в программе льготной ипотеки для семей с детьми.",
    date: "15 дек 2024",
    category: "Ипотека",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
  },
  {
    id: "2",
    title: "ПИК открыл продажи в новом ЖК «Солнечные острова»",
    excerpt: "Старт продаж квартир в новом ЖК комфорт-класса на юге Москвы.",
    date: "12 дек 2024",
    category: "Новости",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    id: "3",
    title: "Скидки до 15% на квартиры в ЖК «Парк Легенд»",
    excerpt: "Донстрой объявил о новогодней акции с максимальными скидками.",
    date: "10 дек 2024",
    category: "Акции",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
];

export const NewsSection = () => {
  return (
    <section className="border-t border-border py-10 sm:py-14">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Новости и акции
          </h2>
          <Link
            to="/news"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Все новости
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="group border border-border rounded-lg overflow-hidden hover:shadow-hover transition-shadow cursor-pointer"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
