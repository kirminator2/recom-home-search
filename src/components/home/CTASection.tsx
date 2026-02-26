import { Link } from "react-router-dom";
import { MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="border-t border-border bg-secondary/30 py-10 sm:py-14">
      <div className="container">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Нужна помощь в выборе?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Наши специалисты бесплатно подберут варианты под ваш бюджет и пожелания
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button className="gap-2 w-full sm:w-auto">
              <MessageSquare className="h-4 w-4" />
              Написать в чат
            </Button>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Phone className="h-4 w-4" />
              Заказать звонок
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Работаем ежедневно с 9:00 до 21:00
          </p>
        </div>
      </div>
    </section>
  );
};
