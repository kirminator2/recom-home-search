import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComplexChat } from "@/components/complex/ComplexChat";
import { supabase } from "@/integrations/supabase/client";
import { ResidentialComplex, Apartment, Review } from "@/types/database";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useViewHistory } from "@/hooks/useViewHistory";
import {
  MapPin, Star, Heart, Calendar, Building2, Check, ChevronRight,
  Phone, Video, Calculator, ThumbsUp, ThumbsDown, Gift, Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { PropertyCard } from "@/components/home/PropertyCard";
import { toast } from "@/hooks/use-toast";

const formatPrice = (price: number) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)} млн ₽`;
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const formatPriceShort = (price: number) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)} млн ₽`;
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const ComplexDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { trackView } = useViewHistory();
  const [complex, setComplex] = useState<ResidentialComplex | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarComplexes, setSimilarComplexes] = useState<ResidentialComplex[]>([]);
  const [developerComplexes, setDeveloperComplexes] = useState<ResidentialComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, pros: "", cons: "", text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [mortgageCalc, setMortgageCalc] = useState({ price: 5000000, downPayment: 1000000, rate: 8, years: 20 });
  const [installmentCalc, setInstallmentCalc] = useState({ price: 5000000, downPayment: 1500000, months: 24 });

  useEffect(() => { if (slug) fetchComplex(); }, [slug]);

  const fetchComplex = async () => {
    const { data: complexData } = await supabase
      .from("residential_complexes")
      .select("*, developer:developers(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (complexData) {
      setComplex(complexData as ResidentialComplex);
      setMortgageCalc(prev => ({ ...prev, price: complexData.price_from || 5000000 }));
      setInstallmentCalc(prev => ({ ...prev, price: complexData.price_from || 5000000 }));
      trackView(complexData.id);

      const [aptRes, revRes, simRes] = await Promise.all([
        supabase.from("apartments").select("*").eq("complex_id", complexData.id).eq("is_available", true),
        supabase.from("reviews").select("*").eq("complex_id", complexData.id).order("created_at", { ascending: false }),
        supabase.from("residential_complexes").select("*, developer:developers(*)").eq("city_id", complexData.city_id).neq("id", complexData.id).limit(4),
      ]);

      if (aptRes.data) setApartments(aptRes.data);
      if (revRes.data) setReviews(revRes.data);
      if (simRes.data) setSimilarComplexes(simRes.data as ResidentialComplex[]);

      if (complexData.developer_id) {
        const { data: devComplexes } = await supabase
          .from("residential_complexes")
          .select("*, developer:developers(*)")
          .eq("developer_id", complexData.developer_id)
          .neq("id", complexData.id)
          .limit(4);
        if (devComplexes) setDeveloperComplexes(devComplexes as ResidentialComplex[]);
      }
    }
    setLoading(false);
  };

  const submitReview = async () => {
    if (!reviewForm.name || !reviewForm.text) {
      toast({ title: "Заполните имя и отзыв", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    const fullText = `${reviewForm.text}${reviewForm.pros ? `\n\n✅ Плюсы: ${reviewForm.pros}` : ""}${reviewForm.cons ? `\n\n❌ Минусы: ${reviewForm.cons}` : ""}`;
    const { error } = await supabase.from("reviews").insert({ complex_id: complex?.id, author_name: reviewForm.name, rating: reviewForm.rating, text: fullText });
    if (!error) {
      toast({ title: "Отзыв отправлен!" });
      setReviewForm({ name: "", rating: 5, pros: "", cons: "", text: "" });
      fetchComplex();
    } else {
      toast({ title: "Ошибка при отправке", variant: "destructive" });
    }
    setSubmittingReview(false);
  };

  const calculateMortgage = () => {
    const principal = mortgageCalc.price - mortgageCalc.downPayment;
    const monthlyRate = mortgageCalc.rate / 100 / 12;
    const numPayments = mortgageCalc.years * 12;
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    return isNaN(monthly) ? 0 : monthly;
  };

  const calculateInstallment = () => {
    return (installmentCalc.price - installmentCalc.downPayment) / installmentCalc.months;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-64 rounded-lg bg-secondary" />
              <div className="h-6 w-1/2 rounded bg-secondary" />
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
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-3 text-lg font-medium">ЖК не найден</h1>
            <Link to="/catalog"><Button className="mt-3" size="sm">В каталог</Button></Link>
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

  const isComplexFavorite = isFavorite(complex.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">
        {/* Hero Image */}
        <div className="relative h-[240px] sm:h-[320px]">
          <img
            src={complex.image_url || "/placeholder.svg"}
            alt={complex.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative -mt-16">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Info card */}
              <div className="rounded-lg border border-border bg-card p-4 sm:p-5 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {complex.completion_date === "Сдан" ? (
                    <span className="rounded bg-trust/10 px-2 py-0.5 text-[11px] font-medium text-trust">
                      <Check className="inline mr-0.5 h-3 w-3" /> Сдан
                    </span>
                  ) : (
                    <span className="rounded bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Calendar className="inline mr-0.5 h-3 w-3" /> {complex.completion_date}
                    </span>
                  )}
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    {complex.rating}
                  </span>
                </div>

                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                  {complex.name}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {complex.address}, {complex.district}
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  от {formatPrice(complex.price_from || 0)}
                </p>

                {/* Quick actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Phone className="h-3.5 w-3.5" />
                    Позвонить
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Video className="h-3.5 w-3.5" />
                    Онлайн-просмотр
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => toggleFavorite(complex.id)}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isComplexFavorite ? "fill-primary text-primary" : ""}`} />
                    {isComplexFavorite ? "В избранном" : "В избранное"}
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="apartments" className="space-y-4">
                <TabsList className="w-full justify-start overflow-x-auto bg-secondary/50 p-0.5 h-auto">
                  <TabsTrigger value="apartments" className="text-xs h-8">Квартиры ({apartments.length})</TabsTrigger>
                  <TabsTrigger value="about" className="text-xs h-8">О комплексе</TabsTrigger>
                  <TabsTrigger value="calculator" className="text-xs h-8">Калькулятор</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs h-8">Отзывы ({reviews.length})</TabsTrigger>
                  <TabsTrigger value="developer" className="text-xs h-8">Застройщик</TabsTrigger>
                </TabsList>

                {/* Apartments */}
                <TabsContent value="apartments" className="space-y-3">
                  {Object.entries(groupedApartments).length > 0 ? (
                    Object.entries(groupedApartments).map(([rooms, apts]) => (
                      <div key={rooms} className="rounded-lg border border-border p-3">
                        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                          {rooms === "1" ? "Студии и 1-комнатные" : `${rooms}-комнатные`}
                        </h3>
                        <div className="space-y-1.5">
                          {apts.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between rounded-md bg-secondary/50 p-2.5 hover:bg-secondary transition-colors cursor-pointer">
                              <div>
                                <p className="text-sm font-medium">{apt.area} м²</p>
                                <p className="text-[11px] text-muted-foreground">{apt.floor}/{apt.total_floors} этаж</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{formatPrice(apt.price)}</p>
                                <p className="text-[11px] text-muted-foreground">{apt.price_per_sqm?.toLocaleString("ru-RU")} ₽/м²</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <Building2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-xs text-muted-foreground">Квартиры скоро появятся</p>
                    </div>
                  )}
                </TabsContent>

                {/* About */}
                <TabsContent value="about" className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{complex.description}</p>
                  {complex.features && complex.features.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium">Особенности</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {complex.features.map((f) => (
                          <span key={f} className="rounded bg-secondary px-2 py-1 text-xs text-foreground">
                            <Check className="inline mr-0.5 h-3 w-3" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Calculator */}
                <TabsContent value="calculator" className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Ипотека</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Стоимость</label>
                          <p className="text-sm font-medium">{formatPriceShort(mortgageCalc.price)}</p>
                          <Slider value={[mortgageCalc.price]} onValueChange={([v]) => setMortgageCalc(p => ({ ...p, price: v }))} min={2000000} max={30000000} step={100000} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Первый взнос</label>
                          <p className="text-sm font-medium">{formatPriceShort(mortgageCalc.downPayment)}</p>
                          <Slider value={[mortgageCalc.downPayment]} onValueChange={([v]) => setMortgageCalc(p => ({ ...p, downPayment: v }))} min={0} max={mortgageCalc.price * 0.9} step={100000} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-muted-foreground">Ставка, %</label>
                            <Input type="number" value={mortgageCalc.rate} onChange={(e) => setMortgageCalc(p => ({ ...p, rate: Number(e.target.value) }))} className="mt-1 h-8 text-sm" />
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground">Срок, лет</label>
                            <Input type="number" value={mortgageCalc.years} onChange={(e) => setMortgageCalc(p => ({ ...p, years: Number(e.target.value) }))} className="mt-1 h-8 text-sm" />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-[11px] text-muted-foreground">Ежемесячный платёж</p>
                          <p className="text-lg font-semibold text-primary">{formatPriceShort(calculateMortgage())}/мес</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Рассрочка</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Стоимость</label>
                          <p className="text-sm font-medium">{formatPriceShort(installmentCalc.price)}</p>
                          <Slider value={[installmentCalc.price]} onValueChange={([v]) => setInstallmentCalc(p => ({ ...p, price: v }))} min={2000000} max={30000000} step={100000} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Первый взнос</label>
                          <p className="text-sm font-medium">{formatPriceShort(installmentCalc.downPayment)}</p>
                          <Slider value={[installmentCalc.downPayment]} onValueChange={([v]) => setInstallmentCalc(p => ({ ...p, downPayment: v }))} min={0} max={installmentCalc.price * 0.9} step={100000} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Срок, мес.</label>
                          <Input type="number" value={installmentCalc.months} onChange={(e) => setInstallmentCalc(p => ({ ...p, months: Number(e.target.value) }))} className="mt-1 h-8 text-sm" />
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-[11px] text-muted-foreground">Ежемесячный платёж</p>
                          <p className="text-lg font-semibold text-foreground">{formatPriceShort(calculateInstallment())}/мес</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Reviews */}
                <TabsContent value="reviews" className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="text-sm font-medium mb-3">Оставить отзыв</h3>
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Имя</label>
                          <Input value={reviewForm.name} onChange={(e) => setReviewForm(p => ({ ...p, name: e.target.value }))} placeholder="Иван" className="mt-1 h-8 text-sm" />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Оценка</label>
                          <div className="mt-1 flex gap-0.5">
                            {[1,2,3,4,5].map((n) => (
                              <button key={n} onClick={() => setReviewForm(p => ({ ...p, rating: n }))}>
                                <Star className={`h-5 w-5 ${n <= reviewForm.rating ? "fill-primary text-primary" : "text-border"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-trust" /> Плюсы</label>
                          <Input value={reviewForm.pros} onChange={(e) => setReviewForm(p => ({ ...p, pros: e.target.value }))} placeholder="Что понравилось" className="mt-1 h-8 text-sm" />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground flex items-center gap-1"><ThumbsDown className="h-3 w-3 text-destructive" /> Минусы</label>
                          <Input value={reviewForm.cons} onChange={(e) => setReviewForm(p => ({ ...p, cons: e.target.value }))} placeholder="Что не понравилось" className="mt-1 h-8 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Отзыв</label>
                        <Textarea value={reviewForm.text} onChange={(e) => setReviewForm(p => ({ ...p, text: e.target.value }))} placeholder="Поделитесь впечатлениями..." className="mt-1 text-sm resize-none" rows={3} />
                      </div>
                      <Button onClick={submitReview} disabled={submittingReview} size="sm" className="gap-1.5 text-xs">
                        <Send className="h-3.5 w-3.5" /> Отправить
                      </Button>
                    </div>
                  </div>
                  {reviews.length > 0 ? (
                    <div className="space-y-2">
                      {reviews.map((r) => (
                        <div key={r.id} className="rounded-lg border border-border p-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{r.author_name}</span>
                              {r.is_verified && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">Проверен</span>}
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-border"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-pre-line">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground/40" />
                      <p className="mt-1 text-xs text-muted-foreground">Пока нет отзывов</p>
                    </div>
                  )}
                </TabsContent>

                {/* Developer */}
                <TabsContent value="developer">
                  {complex.developer && (
                    <Link to={`/developer/${complex.developer.slug}`}>
                      <div className="rounded-lg border border-border p-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-sm font-semibold">
                            {complex.developer.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium">{complex.developer.name}</h3>
                            <p className="text-[11px] text-muted-foreground">{complex.developer.years_on_market} лет • {complex.developer.projects_count} проектов</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span className="text-sm font-medium">{complex.developer.rating}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  )}
                </TabsContent>
              </Tabs>

              {/* Similar */}
              {similarComplexes.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold mb-3">Похожие комплексы</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {similarComplexes.slice(0, 3).map((c) => (
                      <Link key={c.id} to={`/complex/${c.slug}`}>
                        <PropertyCard property={{ id: c.id, name: c.name, developer: c.developer?.name || "", district: c.district || "", priceFrom: c.price_from || 0, priceTo: c.price_to || 0, deadline: c.completion_date || "", imageUrl: c.image_url || "/placeholder.svg", rating: c.rating, reviewsCount: c.reviews_count }} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — Chat */}
            <div className="hidden lg:block lg:w-[320px] shrink-0">
              <div className="sticky top-16">
                <ComplexChat complexName={complex.name} />
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Ежедневно 9:00 — 21:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-2 sm:hidden z-40">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => toggleFavorite(complex.id)}>
              <Heart className={`h-4 w-4 ${isComplexFavorite ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button className="flex-1 h-9 gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Написать
            </Button>
            <Button variant="outline" className="h-9 gap-1.5 text-xs">
              <Phone className="h-3.5 w-3.5" />
              Позвонить
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComplexDetail;
