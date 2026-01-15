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
  Newspaper,
  Star,
  LogOut,
  Sparkles
} from "lucide-react";
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
import { AISearchDialog } from "@/components/ai/AISearchDialog";

const navLinks = [
  { href: "/catalog", label: "Каталог", icon: Building2 },
  { href: "/developers", label: "Застройщики", icon: Star },
  { href: "/news", label: "Новости", icon: Newspaper },
];

export const Header = () => {
  const { cities, selectedCity, setSelectedCity } = useCities();
  const { user, signOut } = useAuth();
  const { count: favCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiSearchOpen, setAiSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden text-lg font-semibold text-foreground sm:inline-block">
            НовоДом
          </span>
        </Link>

        {/* City Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 gap-1.5 px-2.5 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">{selectedCity?.name || "Город"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 animate-in fade-in-0 zoom-in-95 duration-200">
            {cities.map((city) => (
              <DropdownMenuItem
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={`cursor-pointer transition-colors ${selectedCity?.id === city.id ? "bg-secondary font-medium" : ""}`}
              >
                {city.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1.5 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => setAiSearchOpen(true)}
            size="sm"
            className="hidden h-8 gap-1.5 px-3 text-xs sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-подбор
          </Button>
          <Button
            onClick={() => setAiSearchOpen(true)}
            size="icon"
            className="h-8 w-8 sm:hidden"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Link to="/favorites">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 transition-colors hover:bg-secondary/80"
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${favCount > 0 ? "fill-primary text-primary" : ""}`} />
              {favCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground animate-in zoom-in-50 duration-200">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              )}
            </Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex hover:bg-secondary/80">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 animate-in fade-in-0 zoom-in-95 duration-200">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer gap-2">
                    <User className="h-4 w-4" />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 md:hidden hover:bg-secondary/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`absolute left-0 right-0 top-14 overflow-hidden border-b border-border/50 bg-background transition-all duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <nav className="container flex flex-col gap-1 py-3">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start gap-2 h-10 text-sm">
                <link.icon className="h-4 w-4 text-muted-foreground" />
                {link.label}
              </Button>
            </Link>
          ))}
          {user ? (
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 h-10 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                Профиль
              </Button>
            </Link>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 h-10 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                Войти
              </Button>
            </Link>
          )}
        </nav>
      </div>
      
      <AISearchDialog open={aiSearchOpen} onOpenChange={setAiSearchOpen} />
    </header>
  );
};
