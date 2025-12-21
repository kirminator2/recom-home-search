import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Персональные рекомендации на основе ваших предпочтений",
  "Моментальные уведомления о новых объектах",
  "Сохранение избранного и подборок",
  "Эксклюзивные акции от застройщиков",
];

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-16 sm:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-primary-foreground blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 backdrop-blur-sm animate-float">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>

          {/* Heading */}
          <h2 className="mb-4 text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl">
            Получайте персональные рекомендации
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Зарегистрируйтесь, чтобы ИИ подбирал идеальные варианты именно для вас
          </p>

          {/* Benefits */}
          <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-sm text-primary-foreground/90"
              >
                <CheckCircle className="h-4 w-4 text-accent" />
                {benefit}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="xl" variant="hero" className="w-full sm:w-auto">
              Создать аккаунт
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="xl" variant="hero-outline" className="w-full sm:w-auto">
              Подробнее об ИИ-поиске
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
