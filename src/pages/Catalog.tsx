import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/hooks/useCities";
import { ResidentialComplex } from "@/types/database";
import { Search, SlidersHorizontal, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Catalog = () => {
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");
  const { selectedCity } = useCities();

  useEffect(() => {
    fetchComplexes();
  }, [selectedCity]);

  const fetchComplexes = async () => {
    let query = supabase
      .from("residential_complexes")
      .select("*, developer:developers(*)");

    if (selectedCity) {
      query = query.eq("city_id", selectedCity.id);
    }

    const { data, error } = await query;

    if (!error && data) {
      setComplexes(data as ResidentialComplex[]);
    }
    setLoading(false);
  };

  const filteredComplexes = complexes
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.district?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price_from || 0) - (b.price_from || 0);
        case "price_desc":
          return (b.price_from || 0) - (a.price_from || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Каталог новостроек
              </h1>
              <p className="mt-2 text-muted-foreground">
                {selectedCity ? `в ${selectedCity.name}` : "по всей России"} • {filteredComplexes.length} объектов
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или району..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Сначала дешевле</SelectItem>
                  <SelectItem value="price_desc">Сначала дороже</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры
              </Button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : filteredComplexes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredComplexes.map((complex) => (
                  <Link key={complex.id} to={`/complex/${complex.slug}`}>
                    <PropertyCard
                      property={{
                        id: complex.id,
                        name: complex.name,
                        developer: complex.developer?.name || "",
                        district: complex.district || "",
                        priceFrom: complex.price_from || 0,
                        priceTo: complex.price_to || 0,
                        deadline: complex.completion_date || "",
                        imageUrl: complex.image_url || "/placeholder.svg",
                        rating: complex.rating,
                        reviewsCount: complex.reviews_count,
                      }}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Ничего не найдено</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
