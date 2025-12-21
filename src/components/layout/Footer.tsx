import { Link } from "react-router-dom";
import { Building2, Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  catalog: {
    title: "Каталог",
    links: [
      { label: "Все новостройки", href: "/catalog" },
      { label: "На карте", href: "/map" },
      { label: "Застройщики", href: "/developers" },
      { label: "Акции", href: "/promos" },
    ],
  },
  company: {
    title: "Компания",
    links: [
      { label: "О нас", href: "/about" },
      { label: "Новости", href: "/news" },
      { label: "Отзывы", href: "/reviews" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  help: {
    title: "Помощь",
    links: [
      { label: "Ипотечный калькулятор", href: "/calculator" },
      { label: "Как выбрать квартиру", href: "/guides/choose" },
      { label: "FAQ", href: "/faq" },
      { label: "Политика конфиденциальности", href: "/privacy" },
    ],
  },
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                НовоДом
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Умный портал для поиска квартир в новостройках. 
              ИИ-рекомендации, честные отзывы и проверенные застройщики.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+74951234567"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                +7 (495) 123-45-67
              </a>
              <a
                href="mailto:info@novodom.ru"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@novodom.ru
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Москва, ул. Примерная, 1
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 НовоДом. Все права защищены.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Конфиденциальность
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
