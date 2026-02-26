import { ArrowRight, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const developers = [
  { id: "1", name: "ПИК", projectsCount: 45, rating: 4.8, isVerified: true },
  { id: "2", name: "Донстрой", projectsCount: 28, rating: 4.9, isVerified: true },
  { id: "3", name: "Level Group", projectsCount: 15, rating: 4.7, isVerified: true },
  { id: "4", name: "Самолет", projectsCount: 32, rating: 4.6, isVerified: true },
  { id: "5", name: "ЛСР", projectsCount: 22, rating: 4.5, isVerified: true },
  { id: "6", name: "Инград", projectsCount: 18, rating: 4.4, isVerified: false },
];

export const DevelopersSection = () => {
  return (
    <section className="border-t border-border py-10 sm:py-14">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Застройщики
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Рейтинг на основе отзывов и сроков сдачи
            </p>
          </div>
          <Link
            to="/developers"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Все застройщики
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((dev) => (
            <div
              key={dev.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-foreground">
                {dev.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground truncate">{dev.name}</span>
                  {dev.isVerified && <CheckCircle className="h-3.5 w-3.5 text-trust shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{dev.projectsCount} проектов</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-medium">{dev.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
