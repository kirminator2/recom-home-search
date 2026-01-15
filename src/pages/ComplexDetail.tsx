import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ResidentialComplex, Apartment, Review } from "@/types/database";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useViewHistory } from "@/hooks/useViewHistory";
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
  Video,
  Calculator,
  ThumbsUp,
  ThumbsDown,
  Gift,
  Send,
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
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн ₽`;
  }
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const formatPriceShort = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)} млн ₽`;
  }
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

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    pros: "",
    cons: "",
    text: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Calculator state
  const [mortgageCalc, setMortgageCalc] = useState({
    price: 5000000,
    downPayment: 1000000,
    rate: 8,
    years: 20,
  });

  const [installmentCalc, setInstallmentCalc] = useState({
    price: 5000000,
    downPayment: 1500000,
    months: 24,
  });

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
      setMortgageCalc(prev => ({ ...prev, price: complexData.price_from || 5000000 }));
      setInstallmentCalc(prev => ({ ...prev, price: complexData.price_from || 5000000 }));
      
      // Track view in history
      trackView(complexData.id);

      // Fetch apartments
      const { data: apartmentsData } = await supabase
        .from("apartments")
        .select("*")
        .eq("complex_id", complexData.id)
        .eq("is_available", true);

      if (apartmentsData) {
        setApartments(apartmentsData);
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("complex_id", complexData.id)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
      }

      // Fetch similar complexes
      const { data: similarData } = await supabase
        .from("residential_complexes")
        .select("*, developer:developers(*)")
        .eq("city_id", complexData.city_id)
        .neq("id", complexData.id)
        .limit(4);

      if (similarData) {
        setSimilarComplexes(similarData as ResidentialComplex[]);
      }

      // Fetch developer's other complexes
      if (complexData.developer_id) {
        const { data: devComplexes } = await supabase
          .from("residential_complexes")
          .select("*, developer:developers(*)")
          .eq("developer_id", complexData.developer_id)
          .neq("id", complexData.id)
          .limit(4);

        if (devComplexes) {
          setDeveloperComplexes(devComplexes as ResidentialComplex[]);
        }
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

    const { error } = await supabase.from("reviews").insert({
      complex_id: complex?.id,
      author_name: reviewForm.name,
      rating: reviewForm.rating,
      text: fullText,
    });

    if (!error) {
      toast({ title: "Отзыв отправлен!" });
      setReviewForm({ name: "", rating: 5, pros: "", cons: "", text: "" });
      fetchComplex();
    } else {
      toast({ title: "Ошибка при отправке", variant: "destructive" });
    }
    setSubmittingReview(false);
  };

  // Mortgage calculation
  const calculateMortgage = () => {
    const principal = mortgageCalc.price - mortgageCalc.downPayment;
    const monthlyRate = mortgageCalc.rate / 100 / 12;
    const numPayments = mortgageCalc.years * 12;
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    return isNaN(monthly) ? 0 : monthly;
  };

  // Installment calculation
  const calculateInstallment = () => {
    const remaining = installmentCalc.price - installmentCalc.downPayment;
    return remaining / installmentCalc.months;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-80 rounded-xl bg-secondary/50" />
              <div className="h-6 w-1/2 rounded bg-secondary/50" />
              <div className="h-4 w-1/3 rounded bg-secondary/50" />
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
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold">ЖК не найден</h1>
            <Link to="/catalog">
              <Button className="mt-4" size="sm">Вернуться в каталог</Button>
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

  const isComplexFavorite = isFavorite(complex.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">
        {/* Hero */}
        <section className="relative">
          <div className="relative h-[320px] sm:h-[400px] lg:h-[450px]">
            <img
              src={complex.image_url || "/placeholder.svg"}
              alt={complex.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
          
          <div className="container relative -mt-32 sm:-mt-40">
            <div className="flex flex-col lg:flex-row lg:gap-6">
              {/* Main info */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  {complex.completion_date === "Сдан" ? (
                    <Badge className="bg-trust/20 text-trust border-trust/30 text-xs">
                      <Check className="mr-1 h-3 w-3" /> Сдан
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="mr-1 h-3 w-3" /> {complex.completion_date}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    {complex.rating}
                  </Badge>
                </div>
                <h1 className="text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl">
                  {complex.name}
                </h1>
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {complex.address}, {complex.district}
                </p>
                <p className="mt-4 text-xl font-semibold text-foreground sm:text-2xl">
                  от {formatPrice(complex.price_from || 0)}
                </p>
              </div>

              {/* Floating contact card */}
              <div className="hidden lg:block lg:w-80 lg:-mt-12 relative z-10">
                <div className="rounded-xl bg-card p-5 shadow-hover border border-border/50">
                  <div className="space-y-3">
                    <Button className="w-full gap-2" size="lg">
                      <Phone className="h-4 w-4" />
                      Заказать звонок
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Video className="h-4 w-4" />
                      Онлайн-просмотр
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => toggleFavorite(complex.id)}
                    >
                      <Heart className={`h-4 w-4 transition-all ${isComplexFavorite ? "fill-primary text-primary" : ""}`} />
                      {isComplexFavorite ? "В избранном" : "В избранное"}
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">Работаем ежедневно 9:00 — 21:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6">
          <div className="container">
            <Tabs defaultValue="apartments" className="space-y-6">
              <TabsList className="w-full justify-start overflow-x-auto bg-secondary/30 p-1">
                <TabsTrigger value="apartments" className="text-sm">
                  Квартиры ({apartments.length})
                </TabsTrigger>
                <TabsTrigger value="about" className="text-sm">О комплексе</TabsTrigger>
                <TabsTrigger value="calculator" className="text-sm">Калькулятор</TabsTrigger>
                <TabsTrigger value="promos" className="text-sm">Акции</TabsTrigger>
                <TabsTrigger value="reviews" className="text-sm">
                  Отзывы ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="developer" className="text-sm">Застройщик</TabsTrigger>
              </TabsList>

              {/* Apartments */}
              <TabsContent value="apartments" className="space-y-4">
                {Object.entries(groupedApartments).length > 0 ? (
                  Object.entries(groupedApartments).map(([rooms, apts]) => (
                    <div key={rooms} className="rounded-xl border border-border/50 bg-card/50 p-4">
                      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                        {rooms === "1" ? "Студии и 1-комнатные" : `${rooms}-комнатные`}
                      </h3>
                      <div className="space-y-2">
                        {apts.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50 cursor-pointer"
                          >
                            <div>
                              <p className="text-sm font-medium">{apt.area} м²</p>
                              <p className="text-xs text-muted-foreground">
                                {apt.floor}/{apt.total_floors} этаж
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatPrice(apt.price)}</p>
                              <p className="text-xs text-muted-foreground">
                                {apt.price_per_sqm?.toLocaleString("ru-RU")} ₽/м²
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Квартиры скоро появятся</p>
                  </div>
                )}
              </TabsContent>

              {/* About */}
              <TabsContent value="about" className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{complex.description}</p>
                {complex.features && complex.features.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Особенности</h3>
                    <div className="flex flex-wrap gap-2">
                      {complex.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs font-normal">
                          <Check className="mr-1 h-3 w-3" /> {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Calculator */}
              <TabsContent value="calculator" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Mortgage Calculator */}
                  <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Calculator className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Ипотечный калькулятор</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Стоимость квартиры</label>
                        <p className="text-sm font-medium">{formatPriceShort(mortgageCalc.price)}</p>
                        <Slider
                          value={[mortgageCalc.price]}
                          onValueChange={([v]) => setMortgageCalc(prev => ({ ...prev, price: v }))}
                          min={2000000}
                          max={30000000}
                          step={100000}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Первоначальный взнос</label>
                        <p className="text-sm font-medium">{formatPriceShort(mortgageCalc.downPayment)}</p>
                        <Slider
                          value={[mortgageCalc.downPayment]}
                          onValueChange={([v]) => setMortgageCalc(prev => ({ ...prev, downPayment: v }))}
                          min={0}
                          max={mortgageCalc.price * 0.9}
                          step={100000}
                          className="mt-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Ставка, %</label>
                          <Input
                            type="number"
                            value={mortgageCalc.rate}
                            onChange={(e) => setMortgageCalc(prev => ({ ...prev, rate: Number(e.target.value) }))}
                            className="mt-1 h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Срок, лет</label>
                          <Input
                            type="number"
                            value={mortgageCalc.years}
                            onChange={(e) => setMortgageCalc(prev => ({ ...prev, years: Number(e.target.value) }))}
                            className="mt-1 h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Ежемесячный платёж</p>
                        <p className="text-xl font-semibold text-primary">{formatPriceShort(calculateMortgage())}/мес</p>
                      </div>
                    </div>
                  </div>

                  {/* Installment Calculator */}
                  <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Calculator className="h-4 w-4 text-accent" />
                      <h3 className="font-medium">Калькулятор рассрочки</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Стоимость квартиры</label>
                        <p className="text-sm font-medium">{formatPriceShort(installmentCalc.price)}</p>
                        <Slider
                          value={[installmentCalc.price]}
                          onValueChange={([v]) => setInstallmentCalc(prev => ({ ...prev, price: v }))}
                          min={2000000}
                          max={30000000}
                          step={100000}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Первоначальный взнос</label>
                        <p className="text-sm font-medium">{formatPriceShort(installmentCalc.downPayment)}</p>
                        <Slider
                          value={[installmentCalc.downPayment]}
                          onValueChange={([v]) => setInstallmentCalc(prev => ({ ...prev, downPayment: v }))}
                          min={0}
                          max={installmentCalc.price * 0.9}
                          step={100000}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Срок рассрочки, месяцев</label>
                        <Input
                          type="number"
                          value={installmentCalc.months}
                          onChange={(e) => setInstallmentCalc(prev => ({ ...prev, months: Number(e.target.value) }))}
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Ежемесячный платёж</p>
                        <p className="text-xl font-semibold text-accent">{formatPriceShort(calculateInstallment())}/мес</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Promos */}
              <TabsContent value="promos">
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="h-5 w-5 text-accent" />
                    <h3 className="font-medium">Специальное предложение</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Скидка 5% на квартиры с чистовой отделкой до конца месяца. 
                    Также доступна ипотека от 5.9% и беспроцентная рассрочка на 24 месяца.
                  </p>
                  <Button size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Узнать подробности
                  </Button>
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="space-y-6">
                {/* Review Form */}
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <h3 className="font-medium mb-4">Оставить отзыв</h3>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Ваше имя</label>
                        <Input
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Иван"
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Оценка</label>
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: n }))}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-5 w-5 ${n <= reviewForm.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-trust" /> Плюсы
                        </label>
                        <Input
                          value={reviewForm.pros}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, pros: e.target.value }))}
                          placeholder="Что понравилось"
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3 text-destructive" /> Минусы
                        </label>
                        <Input
                          value={reviewForm.cons}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, cons: e.target.value }))}
                          placeholder="Что не понравилось"
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Ваш отзыв</label>
                      <Textarea
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Поделитесь впечатлениями..."
                        className="mt-1 text-sm resize-none"
                        rows={3}
                      />
                    </div>
                    <Button onClick={submitReview} disabled={submittingReview} size="sm" className="gap-2">
                      <Send className="h-4 w-4" />
                      Отправить отзыв
                    </Button>
                  </div>
                </div>

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl border border-border/50 bg-card/50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{review.author_name}</span>
                            {review.is_verified && (
                              <Badge variant="outline" className="text-[10px] h-5">Проверен</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/20"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{review.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">Пока нет отзывов. Будьте первым!</p>
                  </div>
                )}
              </TabsContent>

              {/* Developer */}
              <TabsContent value="developer">
                {complex.developer && (
                  <Link to={`/developer/${complex.developer.slug}`}>
                    <div className="rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{complex.developer.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {complex.developer.years_on_market} лет на рынке • {complex.developer.projects_count} проектов
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">{complex.developer.rating}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                )}
              </TabsContent>
            </Tabs>

            {/* Similar complexes */}
            {similarComplexes.length > 0 && (
              <div className="mt-12">
                <h2 className="text-lg font-semibold mb-4">Похожие комплексы</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {similarComplexes.map((c) => (
                    <Link key={c.id} to={`/complex/${c.slug}`}>
                      <PropertyCard
                        property={{
                          id: c.id,
                          name: c.name,
                          developer: c.developer?.name || "",
                          district: c.district || "",
                          priceFrom: c.price_from || 0,
                          priceTo: c.price_to || 0,
                          deadline: c.completion_date || "",
                          imageUrl: c.image_url || "/placeholder.svg",
                          rating: c.rating,
                          reviewsCount: c.reviews_count,
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Developer's other complexes */}
            {developerComplexes.length > 0 && (
              <div className="mt-12">
                <h2 className="text-lg font-semibold mb-4">Другие проекты {complex.developer?.name}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {developerComplexes.map((c) => (
                    <Link key={c.id} to={`/complex/${c.slug}`}>
                      <PropertyCard
                        property={{
                          id: c.id,
                          name: c.name,
                          developer: c.developer?.name || "",
                          district: c.district || "",
                          priceFrom: c.price_from || 0,
                          priceTo: c.price_to || 0,
                          deadline: c.completion_date || "",
                          imageUrl: c.image_url || "/placeholder.svg",
                          rating: c.rating,
                          reviewsCount: c.reviews_count,
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-md p-3 sm:hidden z-40">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => toggleFavorite(complex.id)}
            >
              <Heart className={`h-4 w-4 transition-all ${isComplexFavorite ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button className="flex-1 h-10 gap-2">
              <Phone className="h-4 w-4" />
              Заказать звонок
            </Button>
            <Button variant="secondary" className="h-10 gap-2">
              <Video className="h-4 w-4" />
              Онлайн
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComplexDetail;
