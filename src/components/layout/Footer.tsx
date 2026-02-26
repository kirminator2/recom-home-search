import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";

const footerLinks = {
  catalog: {
    title: "Каталог",
    links: [
      { label: "Все новостройки", href: "/catalog" },
      { label: "На карте", href: "/catalog?view=map" },
      { label: "Застройщики", href: "/developers" },
    ],
  },
  company: {
    title: "Компания",
    links: [
      { label: "О нас", href: "/about" },
      { label: "Новости", href: "/news" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  help: {
    title: "Помощь",
    links: [
      { label: "Как выбрать квартиру", href: "/guides/choose" },
      { label: "FAQ", href: "/faq" },
      { label: "Конфиденциальность", href: "/privacy" },
    ],
  },
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-8 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                НД
              </div>
              <span className="text-sm font-semibold text-foreground">НовоДом</span>
            </Link>
            <p className="mb-4 max-w-xs text-xs text-muted-foreground leading-relaxed">
              Портал новостроек. Проверенные застройщики, честные отзывы, актуальные цены.
            </p>
            <div className="space-y-2">
              <a href="tel:+74951234567" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-3 w-3" />
                +7 (495) 123-45-67
              </a>
              <a href="mailto:info@novodom.ru" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-3 w-3" />
                info@novodom.ru
              </a>
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} НовоДом
          </p>
        </div>
      </div>
    </footer>
  );
};
