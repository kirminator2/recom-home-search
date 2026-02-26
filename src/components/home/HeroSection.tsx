import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="border-b border-border bg-background py-10 sm:py-14">
      <div className="container">
        <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">
          Найдите квартиру в новостройке
        </h1>

        {/* Search Form */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ЖК, район, улица, метро"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 text-sm border-border"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Rooms */}
            <Select>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Комнатность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Студия</SelectItem>
                <SelectItem value="1">1 комн.</SelectItem>
                <SelectItem value="2">2 комн.</SelectItem>
                <SelectItem value="3">3 комн.</SelectItem>
                <SelectItem value="4">4+ комн.</SelectItem>
              </SelectContent>
            </Select>

            {/* Price */}
            <Select>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Стоимость до" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5000000">до 5 млн ₽</SelectItem>
                <SelectItem value="7000000">до 7 млн ₽</SelectItem>
                <SelectItem value="10000000">до 10 млн ₽</SelectItem>
                <SelectItem value="15000000">до 15 млн ₽</SelectItem>
                <SelectItem value="20000000">до 20 млн ₽</SelectItem>
              </SelectContent>
            </Select>

            {/* Submit */}
            <Button onClick={handleSearch} className="h-10 gap-2">
              <Search className="h-4 w-4" />
              Показать
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-4 flex items-center gap-6 border-t border-border pt-3 text-sm text-muted-foreground">
            <span>2 500+ квартир</span>
            <button
              onClick={() => navigate("/catalog?view=map")}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              На карте
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
