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

  // Map filters state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

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
      // Set initial price range based on data
      const prices = data.map(c => c.price_from || 0).filter(p => p > 0);
      if (prices.length > 0) {
        const maxP = Math.max(...prices) * 1.2;
        setPriceRange([0, maxP]);
      }
    }
    setLoading(false);
  };

  // Get available districts
  const availableDistricts = useMemo(() => {
    const districts = complexes
      .map(c => c.district)
      .filter((d): d is string => Boolean(d));
    return [...new Set(districts)].sort();
  }, [complexes]);

  // Max price for slider
  const maxPrice = useMemo(() => {
    const prices = complexes.map(c => c.price_from || 0);
    return Math.max(...prices, 50000000) * 1.2;
  }, [complexes]);

  const filteredComplexes = useMemo(() => {
    return complexes
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.district?.toLowerCase().includes(search.toLowerCase());
        
        // Apply map filters only in map view
        if (viewMode === "map") {
          const matchesPrice = (c.price_from || 0) >= priceRange[0] && 
                               (c.price_from || 0) <= priceRange[1];
          const matchesDistrict = selectedDistricts.length === 0 || 
                                  selectedDistricts.includes(c.district || "");
          return matchesSearch && matchesPrice && matchesDistrict;
        }
        
        return matchesSearch;
      })
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
        <section className="py-6 sm:py-8">
          <div className="container">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                Новостройки
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCity ? selectedCity.name : "Вся Россия"} • {filteredComplexes.length} объектов
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или району"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 text-sm bg-secondary/50 border-0 focus-visible:ring-1"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-full sm:w-40 text-sm bg-secondary/50 border-0">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Сначала дешевле</SelectItem>
                    <SelectItem value="price_desc">Сначала дороже</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="mb-6 flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 gap-1.5 px-3 text-sm ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <LayoutGrid className="h-4 w-4" />
                Список
              </Button>
              <Button
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 gap-1.5 px-3 text-sm ${viewMode === "map" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setViewMode("map")}
              >
                <Map className="h-4 w-4" />
                На карте
              </Button>
            </div>

            {/* Results */}
            {viewMode === "list" ? (
              loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-secondary/50" />
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
                <div className="py-16 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-3 text-base font-medium">Ничего не найдено</h3>
                  <p className="text-sm text-muted-foreground">Попробуйте изменить параметры поиска</p>
                </div>
              )
            ) : (
              <div className="relative min-h-[600px] rounded-xl overflow-hidden">
                {/* Map Filters */}
                <div className="absolute top-4 left-4 z-10">
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
                
                {/* Results count */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
                    {filteredComplexes.length} объектов
                  </div>
                </div>

                <PropertyMap
                  complexes={filteredComplexes}
                  onComplexClick={handleComplexClick}
                  className="h-[600px]"
                />
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
