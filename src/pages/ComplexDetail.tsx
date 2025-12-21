import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ResidentialComplex, Apartment, Review } from "@/types/database";
import { useFavorites } from "@/hooks/useFavorites";
import {
  MapPin,
  Star,
  Heart,
  Calendar,
  Building2,
  Check,
  ChevronRight,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн ₽`;
  }
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const ComplexDetail = () => {
  const { slug } = useParams();
  const [complex, setComplex] = useState<ResidentialComplex | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (slug) {
      fetchComplex();
    }
  }, [slug]);

  const fetchComplex = async () => {
    const { data: complexData } = await supabase
      .from("residential_complexes")
      .select("*, developer:developers(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (complexData) {
      setComplex(complexData as ResidentialComplex);

      const { data: apartmentsData } = await supabase
        .from("apartments")
        .select("*")
        .eq("complex_id", complexData.id)
        .eq("is_available", true);

      if (apartmentsData) {
        setApartments(apartmentsData);
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("complex_id", complexData.id)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
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
              <div className="h-96 rounded-2xl bg-muted" />
              <div className="h-8 w-1/2 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!complex) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">ЖК не найден</h1>
            <Link to="/catalog">
              <Button className="mt-4">Вернуться в каталог</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const groupedApartments = apartments.reduce((acc, apt) => {
    const key = apt.rooms;
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {} as Record<number, Apartment[]>);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[400px] sm:h-[500px]">
          <img
            src={complex.image_url || "/placeholder.svg"}
            alt={complex.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="container relative flex h-full items-end pb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {complex.completion_date === "Сдан" ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Check className="mr-1 h-3 w-3" /> Сдан
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Calendar className="mr-1 h-3 w-3" /> {complex.completion_date}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  {complex.rating}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                {complex.name}
              </h1>
              <p className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {complex.address}, {complex.district}
              </p>
              <p className="mt-4 text-2xl font-bold text-foreground">
                от {formatPrice(complex.price_from || 0)}
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                size="lg"
                variant="outline"
                onClick={() => toggleFavorite(complex.id)}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite(complex.id) ? "fill-accent text-accent" : ""}`}
                />
              </Button>
              <Button size="lg" className="gap-2">
                <Phone className="h-4 w-4" />
                Заказать звонок
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container">
            <Tabs defaultValue="apartments" className="space-y-8">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="apartments">
                  Квартиры ({apartments.length})
                </TabsTrigger>
                <TabsTrigger value="about">О комплексе</TabsTrigger>
                <TabsTrigger value="reviews">
                  Отзывы ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="developer">Застройщик</TabsTrigger>
              </TabsList>

              <TabsContent value="apartments" className="space-y-6">
                {Object.entries(groupedApartments).map(([rooms, apts]) => (
                  <div key={rooms} className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                      {rooms === "1" ? "Студии и 1-комнатные" : `${rooms}-комнатные`}
                    </h3>
                    <div className="space-y-2">
                      {apts.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{apt.area} м²</p>
                              <p className="text-sm text-muted-foreground">
                                {apt.floor}/{apt.total_floors} этаж
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(apt.price)}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.price_per_sqm?.toLocaleString("ru-RU")} ₽/м²
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-muted-foreground">{complex.description}</p>
                </div>
                {complex.features && complex.features.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Особенности</h3>
                    <div className="flex flex-wrap gap-2">
                      {complex.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-sm">
                          <Check className="mr-1 h-3 w-3" /> {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.author_name}</span>
                          {review.is_verified && (
                            <Badge variant="outline" className="text-xs">Проверен</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Пока нет отзывов</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="developer">
                {complex.developer && (
                  <Link to={`/developer/${complex.developer.slug}`}>
                    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
                          <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{complex.developer.name}</h3>
                          <p className="text-muted-foreground">
                            {complex.developer.years_on_market} лет на рынке •{" "}
                            {complex.developer.projects_count} проектов
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-accent text-accent" />
                          <span className="font-bold">{complex.developer.rating}</span>
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 sm:hidden">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleFavorite(complex.id)}
            >
              <Heart
                className={`h-5 w-5 ${isFavorite(complex.id) ? "fill-accent text-accent" : ""}`}
              />
            </Button>
            <Button className="flex-1 gap-2">
              <Phone className="h-4 w-4" />
              Заказать звонок
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComplexDetail;
