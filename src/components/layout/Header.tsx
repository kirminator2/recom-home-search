import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  ChevronDown, 
  Heart, 
  User, 
  Menu, 
  X,
  Building2,
  Search,
  Newspaper,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const cities = [
  { id: "moscow", name: "Москва" },
  { id: "spb", name: "Санкт-Петербург" },
  { id: "kazan", name: "Казань" },
  { id: "sochi", name: "Сочи" },
  { id: "ekb", name: "Екатеринбург" },
];

const navLinks = [
  { href: "/catalog", label: "Каталог ЖК", icon: Building2 },
  { href: "/map", label: "На карте", icon: Search },
  { href: "/developers", label: "Застройщики", icon: Star },
  { href: "/news", label: "Новости", icon: Newspaper },
];

export const Header = () => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:inline-block">
            НовоДом
          </span>
        </Link>

        {/* City Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="hidden sm:inline">{selectedCity.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {cities.map((city) => (
              <DropdownMenuItem
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={selectedCity.id === city.id ? "bg-secondary" : ""}
              >
                {city.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                3
              </span>
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <User className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
