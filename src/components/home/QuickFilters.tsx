import { Link } from "react-router-dom";

const filters = [
  { label: "Студии", href: "/catalog?rooms=studio" },
  { label: "До 10 млн ₽", href: "/catalog?max=10000000" },
  { label: "Сдан", href: "/catalog?deadline=done" },
  { label: "Рядом с метро", href: "/catalog?metro=1" },
  { label: "Бизнес-класс", href: "/catalog?class=business" },
  { label: "С отделкой", href: "/catalog?finish=1" },
];

export const QuickFilters = () => {
  return (
    <section className="border-b border-border py-3">
      <div className="container">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="shrink-0 text-xs text-muted-foreground">Популярное:</span>
          <div className="flex gap-2">
            {filters.map((f) => (
              <Link
                key={f.label}
                to={f.href}
                className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
