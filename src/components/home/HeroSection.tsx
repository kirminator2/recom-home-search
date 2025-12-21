import { useState } from "react";
import { Search, Sparkles, MapPin, Building, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const quickFilters = [
    { label: "До 10 млн ₽", icon: Banknote },
    { label: "Сдача в 2025", icon: Building },
    { label: "Рядом с метро", icon: MapPin },
  ];

  return (
    <section className="relative overflow-hidden gradient-hero py-16 sm:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">
              ИИ-подбор квартир
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl animate-slide-up">
            Найдите идеальную{" "}
            <span className="relative">
              квартиру
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-accent"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M2 10C50 2 150 2 198 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            {" "}в новостройке
          </h1>

          <p className="mb-8 text-lg text-primary-foreground/80 animate-slide-up stagger-1">
            Умный поиск анализирует ваши предпочтения и подбирает варианты,
            которые действительно подходят именно вам
          </p>

          {/* Search Box */}
          <div className="relative mb-6 animate-slide-up stagger-2">
            <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-hover sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ЖК, район, метро или застройщик..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-0 bg-secondary pl-12 text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <Button size="lg" variant="accent" className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                Подобрать с ИИ
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 animate-slide-up stagger-3">
            <span className="text-sm text-primary-foreground/60">
              Быстрый поиск:
            </span>
            {quickFilters.map((filter) => (
              <Button
                key={filter.label}
                variant="hero-outline"
                size="sm"
                className="gap-1.5"
              >
                <filter.icon className="h-3.5 w-3.5" />
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-primary-foreground/10 pt-8 animate-fade-in stagger-4">
            {[
              { value: "2,500+", label: "Жилых комплексов" },
              { value: "150+", label: "Застройщиков" },
              { value: "98%", label: "Довольных клиентов" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary-foreground sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-xs text-primary-foreground/60 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
