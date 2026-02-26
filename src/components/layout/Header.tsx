import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ChevronDown, Heart, User, Menu, X, LogOut, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCities } from "@/hooks/useCities";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

const navLinks = [
  { href: "/catalog", label: "Новостройки" },
  { href: "/developers", label: "Застройщики" },
  { href: "/news", label: "Новости" },
];

export const Header = () => {
  const { cities, selectedCity, setSelectedCity } = useCities();
  const { user, signOut } = useAuth();
  const { count: favCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-12 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
            НД
          </div>
          <span className="hidden text-sm font-semibold text-foreground sm:inline-block">
            НовоДом
          </span>
        </Link>

        {/* City */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-7 gap-1 px-2 text-xs">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">{selectedCity?.name || "Город"}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {cities.map((city) => (
              <DropdownMenuItem
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={`cursor-pointer text-sm ${selectedCity?.id === city.id ? "bg-secondary font-medium" : ""}`}
              >
                {city.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground">
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <a href="tel:+74951234567" className="hidden items-center gap-1 text-xs font-medium text-foreground lg:flex mr-2">
            <Phone className="h-3 w-3 text-primary" />
            33-55555
          </a>

          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Heart className={`h-4 w-4 ${favCount > 0 ? "fill-primary text-primary" : ""}`} />
              {favCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {favCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer gap-2 text-sm">
                    <User className="h-3.5 w-3.5" />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer gap-2 text-sm text-destructive focus:text-destructive">
                  <LogOut className="h-3.5 w-3.5" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Войти
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-2">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                  {link.label}
                </Button>
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-9 text-sm">
                  Войти
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
