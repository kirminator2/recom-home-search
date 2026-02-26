import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { PropertyMap } from "@/components/map/PropertyMap";
import { MapFilters } from "@/components/map/MapFilters";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/hooks/useCities";
import { ResidentialComplex } from "@/types/database";
import { Search, Building2, LayoutGrid, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = "list" | "map";

const Catalog = () => {
  const navigate = useNavigate();
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { selectedCity } = useCities();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  useEffect(() => { fetchComplexes(); }, [selectedCity]);

  const fetchComplexes = async () => {
    let query = supabase.from("residential_complexes").select("*, developer:developers(*)");
    if (selectedCity) query = query.eq("city_id", selectedCity.id);
    const { data, error } = await query;
    if (!error && data) {
      setComplexes(data as ResidentialComplex[]);
      const prices = data.map(c => c.price_from || 0).filter(p => p > 0);
      if (prices.length > 0) setPriceRange([0, Math.max(...prices) * 1.2]);
    }
    setLoading(false);
  };

  const availableDistricts = useMemo(() => {
    const districts = complexes.map(c => c.district).filter((d): d is string => Boolean(d));
    return [...new Set(districts)].sort();
  }, [complexes]);

  const maxPrice = useMemo(() => {
    const prices = complexes.map(c => c.price_from || 0);
    return Math.max(...prices, 50000000) * 1.2;
  }, [complexes]);

  const filteredComplexes = useMemo(() => {
    return complexes
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.district?.toLowerCase().includes(search.toLowerCase());
        if (viewMode === "map") {
          const matchesPrice = (c.price_from || 0) >= priceRange[0] && (c.price_from || 0) <= priceRange[1];
          const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(c.district || "");
          return matchesSearch && matchesPrice && matchesDistrict;
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price_asc": return (a.price_from || 0) - (b.price_from || 0);
          case "price_desc": return (b.price_from || 0) - (a.price_from || 0);
          case "rating": return (b.rating || 0) - (a.rating || 0);
          default: return 0;
        }
      });
  }, [complexes, search, sortBy, viewMode, priceRange, selectedDistricts]);

  const handleComplexClick = (complex: ResidentialComplex) => {
    navigate(`/complex/${complex.slug}`);
  };

  const resetFilters = () => {
    setPriceRange([0, maxPrice]);
    setSelectedDistricts([]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-6">
          <div className="container">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Новостройки</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedCity ? selectedCity.name : "Вся Россия"} • {filteredComplexes.length} объектов
              </p>
            </div>

            {/* Filters row */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или району"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 text-sm border-border"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-full sm:w-40 text-xs">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Сначала дешевле</SelectItem>
                  <SelectItem value="price_desc">Сначала дороже</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View toggle */}
            <div className="mb-4 flex items-center gap-0.5 rounded-md border border-border p-0.5 w-fit">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-3 text-xs"
                onClick={() => setViewMode("list")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Список
              </Button>
              <Button
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-3 text-xs"
                onClick={() => setViewMode("map")}
              >
                <Map className="h-3.5 w-3.5" />
                На карте
              </Button>
            </div>

            {/* Results */}
            {viewMode === "list" ? (
              loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1,2,3,4,5,6,7,8].map((i) => (
                    <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-secondary" />
                  ))}
                </div>
              ) : filteredComplexes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <div className="py-12 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">Ничего не найдено</h3>
                  <p className="text-xs text-muted-foreground">Попробуйте изменить параметры</p>
                </div>
              )
            ) : (
              <div className="relative min-h-[600px] rounded-lg overflow-hidden border border-border">
                <div className="absolute top-3 left-3 z-10">
                  <MapFilters
                    priceRange={priceRange}
                    maxPrice={maxPrice}
                    onPriceChange={setPriceRange}
                    selectedDistricts={selectedDistricts}
                    availableDistricts={availableDistricts}
                    onDistrictChange={setSelectedDistricts}
                    onReset={resetFilters}
                  />
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <div className="rounded-md bg-background/90 backdrop-blur-sm px-2.5 py-1 text-xs border border-border">
                    {filteredComplexes.length} объектов
                  </div>
                </div>
                <PropertyMap complexes={filteredComplexes} onComplexClick={handleComplexClick} className="h-[600px]" />
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
