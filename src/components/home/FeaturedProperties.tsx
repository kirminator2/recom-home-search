import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
    <section className="py-10 sm:py-14">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Рекомендуемые ЖК
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              На основе популярных запросов
            </p>
          </div>
          <Link
            to="/catalog"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Все новостройки
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};
