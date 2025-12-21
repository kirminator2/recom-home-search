import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { ResidentialComplex } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favLoading } = useFavorites();
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !favLoading && favorites.length > 0) {
      fetchFavorites();
    } else if (!authLoading && !favLoading) {
      setLoading(false);
    }
  }, [authLoading, favLoading, favorites]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from("residential_complexes")
      .select("*, developer:developers(*)")
      .in("id", favorites);

    if (!error && data) {
      setComplexes(data as ResidentialComplex[]);
    }
    setLoading(false);
  };

  if (!user && !authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Избранное</h1>
            <p className="mt-2 text-muted-foreground">
              Войдите, чтобы сохранять понравившиеся объекты
            </p>
            <Link to="/auth">
              <Button className="mt-4 gap-2">
                Войти <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Избранное
              </h1>
              <p className="mt-2 text-muted-foreground">
                {complexes.length} сохранённых объектов
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : complexes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {complexes.map((complex) => (
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
                <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Пока пусто</h3>
                <p className="text-muted-foreground">
                  Добавляйте понравившиеся объекты в избранное
                </p>
                <Link to="/catalog">
                  <Button className="mt-4">Смотреть каталог</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
