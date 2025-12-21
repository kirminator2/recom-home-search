import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/home/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { Developer, ResidentialComplex } from "@/types/database";
import { Building2, Star, Calendar, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DeveloperDetail = () => {
  const { slug } = useParams();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchDeveloper();
    }
  }, [slug]);

  const fetchDeveloper = async () => {
    const { data: devData } = await supabase
      .from("developers")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (devData) {
      setDeveloper(devData);

      const { data: complexData } = await supabase
        .from("residential_complexes")
        .select("*")
        .eq("developer_id", devData.id);

      if (complexData) {
        setComplexes(complexData);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-32 rounded-2xl bg-muted" />
              <div className="h-8 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Застройщик не найден</h1>
            <Link to="/developers">
              <Button className="mt-4">Все застройщики</Button>
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
        {/* Developer Info */}
        <section className="py-8 sm:py-12 border-b border-border">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary shrink-0">
                <Building2 className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                    {developer.name}
                  </h1>
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {developer.rating}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{developer.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{developer.years_on_market} лет на рынке</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{developer.projects_count} проектов</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Complexes */}
        <section className="py-8 sm:py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">
              Жилые комплексы ({complexes.length})
            </h2>
            {complexes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {complexes.map((complex) => (
                  <Link key={complex.id} to={`/complex/${complex.slug}`}>
                    <PropertyCard
                      property={{
                        id: complex.id,
                        name: complex.name,
                        developer: developer.name,
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
                <p className="mt-2 text-muted-foreground">Нет доступных проектов</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDetail;
