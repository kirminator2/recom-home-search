import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard, Property } from "./PropertyCard";

const featuredProperties: Property[] = [
  {
    id: "1",
    name: "ЖК Солнечный город",
    developer: "ПИК",
    district: "Южное Бутово",
    metro: "м. Бунинская аллея",
    priceFrom: 8500000,
    priceTo: 25000000,
    deadline: "IV кв. 2025",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    rating: 4.7,
    reviewsCount: 234,
    hasPromo: true,
  },
  {
    id: "2",
    name: "ЖК Парк Легенд",
    developer: "Донстрой",
    district: "ЗАО, Раменки",
    metro: "м. Университет",
    priceFrom: 15000000,
    priceTo: 45000000,
    deadline: "II кв. 2025",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    rating: 4.9,
    reviewsCount: 156,
    isNew: true,
  },
  {
    id: "3",
    name: "ЖК Символ",
    developer: "Донстрой",
    district: "ЮВАО, Лефортово",
    metro: "м. Авиамоторная",
    priceFrom: 12000000,
    priceTo: 38000000,
    deadline: "I кв. 2026",
    imageUrl: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80",
    rating: 4.6,
    reviewsCount: 89,
  },
  {
    id: "4",
    name: "ЖК Level Стрешнево",
    developer: "Level Group",
    district: "СЗАО, Покровское-Стрешнево",
    metro: "м. Щукинская",
    priceFrom: 9500000,
    priceTo: 28000000,
    deadline: "III кв. 2025",
    imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80",
    rating: 4.5,
    reviewsCount: 178,
    hasPromo: true,
  },
];

export const FeaturedProperties = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">
                Рекомендации ИИ
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Подобрано для вас
            </h2>
            <p className="mt-2 text-muted-foreground">
              На основе ваших предпочтений и популярных запросов
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start">
            Все новостройки
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
