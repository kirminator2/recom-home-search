import { ArrowRight, Building2, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const developers = [
  {
    id: "1",
    name: "ПИК",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80",
    projectsCount: 45,
    rating: 4.8,
    isVerified: true,
  },
  {
    id: "2",
    name: "Донстрой",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=80",
    projectsCount: 28,
    rating: 4.9,
    isVerified: true,
  },
  {
    id: "3",
    name: "Level Group",
    logo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80",
    projectsCount: 15,
    rating: 4.7,
    isVerified: true,
  },
  {
    id: "4",
    name: "Самолет",
    logo: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=200&q=80",
    projectsCount: 32,
    rating: 4.6,
    isVerified: true,
  },
  {
    id: "5",
    name: "ЛСР",
    logo: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=200&q=80",
    projectsCount: 22,
    rating: 4.5,
    isVerified: true,
  },
  {
    id: "6",
    name: "Инград",
    logo: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=200&q=80",
    projectsCount: 18,
    rating: 4.4,
    isVerified: false,
  },
];

export const DevelopersSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Проверенные партнёры
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Надёжные застройщики
            </h2>
            <p className="mt-2 text-muted-foreground">
              Рейтинг основан на отзывах покупателей и сроках сдачи объектов
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start">
            Все застройщики
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Developers Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer, index) => (
            <article
              key={developer.id}
              className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Logo */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={developer.logo}
                  alt={developer.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {developer.name}
                  </h3>
                  {developer.isVerified && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-trust" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {developer.projectsCount} проектов
                </p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    {developer.rating}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
