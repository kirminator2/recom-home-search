import { 
  Building, 
  Home, 
  Wallet, 
  Train, 
  TreePine, 
  Waves,
  GraduationCap,
  Baby
} from "lucide-react";
import { Button } from "@/components/ui/button";

const filters = [
  { icon: Building, label: "Бизнес-класс", color: "text-primary" },
  { icon: Wallet, label: "До 10 млн ₽", color: "text-trust" },
  { icon: Home, label: "Студии", color: "text-accent" },
  { icon: Train, label: "У метро", color: "text-destructive" },
  { icon: TreePine, label: "В парке", color: "text-trust" },
  { icon: Waves, label: "У воды", color: "text-primary" },
  { icon: GraduationCap, label: "Рядом школы", color: "text-accent" },
  { icon: Baby, label: "Для семьи", color: "text-destructive" },
];

export const QuickFilters = () => {
  return (
    <section className="border-b border-border bg-secondary/50 py-6">
      <div className="container">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            Популярные:
          </span>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.label}
                variant="secondary"
                size="sm"
                className="shrink-0 gap-2 rounded-full bg-card shadow-sm hover:shadow-card"
              >
                <filter.icon className={`h-4 w-4 ${filter.color}`} />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
