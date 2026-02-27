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
  MessageSquare, X, Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { PropertyCard } from "@/components/home/PropertyCard";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const formatPrice = (price: number) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)} млн ₽`;
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const formatPriceShort = (price: number) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)} млн ₽`;
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const getRoomLabel = (rooms: number) => {
  if (rooms === 0) return "Студии";
  if (rooms === 1) return "1-комнатные";
  if (rooms === 2) return "2-комнатные";
  if (rooms === 3) return "3-комнатные";
  return `${rooms}-комнатные`;
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
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [aptModalApt, setAptModalApt] = useState<Apartment | null>(null);

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

              {/* Section Nav */}
              <nav className="sticky top-0 z-20 bg-background border-b border-border mb-6 -mx-4 px-4 sm:-mx-5 sm:px-5">
                <div className="flex gap-1 overflow-x-auto py-2">
                  {[
                    { id: "apartments", label: `Квартиры (${apartments.length})` },
                    { id: "about", label: "О комплексе" },
                    { id: "mortgage", label: "Ипотека" },
                    { id: "installment", label: "Рассрочка" },
                    { id: "reviews", label: `Отзывы (${reviews.length})` },
                    { id: "developer", label: "Застройщик" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </nav>

              {/* === APARTMENTS === */}
              <section id="apartments" className="scroll-mt-16 mb-10">
                <h2 className="text-base font-semibold mb-3">Квартиры</h2>
                {Object.entries(groupedApartments).length > 0 ? (
                  <div className="flex gap-4">
                    {/* Left: compact table */}
                    <div className="flex-1 min-w-0">
                      {Object.entries(groupedApartments).map(([rooms, apts]) => {
                        const minArea = Math.min(...apts.map(a => a.area));
                        const maxArea = Math.max(...apts.map(a => a.area));
                        return (
                          <div key={rooms} className="mb-4">
                            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {getRoomLabel(Number(rooms))}{" "}
                              <span className="font-normal normal-case">от {minArea} до {maxArea} м²</span>
                            </h3>
                            <div className="border border-border rounded-md overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left px-3 py-1.5 text-[11px] font-medium text-muted-foreground w-10"></th>
                                    <th className="text-left px-3 py-1.5 text-[11px] font-medium text-muted-foreground">Площадь</th>
                                    <th className="text-left px-3 py-1.5 text-[11px] font-medium text-muted-foreground">Этаж</th>
                                    <th className="text-left px-3 py-1.5 text-[11px] font-medium text-muted-foreground">Срок сдачи</th>
                                    <th className="text-right px-3 py-1.5 text-[11px] font-medium text-primary">Стоимость</th>
                                    <th className="w-8"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {apts.map((apt) => (
                                    <tr
                                      key={apt.id}
                                      className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-secondary/40 ${selectedApt?.id === apt.id ? "bg-primary/5" : ""}`}
                                      onClick={() => setSelectedApt(apt)}
                                    >
                                      <td className="px-3 py-2">
                                        {apt.layout_url ? (
                                          <img src={apt.layout_url} alt="План" className="h-8 w-8 object-contain rounded border border-border" />
                                        ) : (
                                          <div className="h-8 w-8 rounded border border-border bg-secondary/50 flex items-center justify-center">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className="font-medium text-primary">{apt.area} м²</span>
                                      </td>
                                      <td className="px-3 py-2 text-muted-foreground text-xs">
                                        {apt.floor}/{apt.total_floors}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-muted-foreground">
                                        {complex?.completion_date || "—"}
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium">
                                        {apt.price.toLocaleString("ru-RU")} ₽
                                      </td>
                                      <td className="px-1 py-2">
                                        <button
                                          className="text-primary hover:underline text-xs"
                                          onClick={(e) => { e.stopPropagation(); setAptModalApt(apt); setAptModalOpen(true); }}
                                        >
                                          Подробнее
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: selected layout preview */}
                    {selectedApt && (
                      <div className="hidden md:block w-[260px] shrink-0 sticky top-20 self-start">
                        <div className="rounded-lg border border-border p-3">
                          <div className="aspect-square rounded bg-secondary/30 border border-border flex items-center justify-center mb-3 overflow-hidden relative group">
                            {selectedApt.layout_url ? (
                              <>
                                <img src={selectedApt.layout_url} alt="Планировка" className="max-h-full max-w-full object-contain" />
                                <button
                                  className="absolute top-2 right-2 h-7 w-7 bg-background/80 rounded-md border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => { setAptModalApt(selectedApt); setAptModalOpen(true); }}
                                >
                                  <Maximize2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="text-center">
                                <Building2 className="mx-auto h-8 w-8 text-muted-foreground/30" />
                                <p className="text-[10px] text-muted-foreground mt-1">Планировка недоступна</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-sm font-semibold">
                              {Number(selectedApt.rooms) === 0 ? "Студия" : `${selectedApt.rooms}-комн.`} {selectedApt.area} м²
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedApt.floor} этаж (из {selectedApt.total_floors})
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {selectedApt.price.toLocaleString("ru-RU")} ₽
                            </p>
                            {selectedApt.price_per_sqm && (
                              <p className="text-[11px] text-muted-foreground">
                                {selectedApt.price_per_sqm.toLocaleString("ru-RU")} ₽/м²
                              </p>
                            )}
                            <Button
                              size="sm"
                              className="w-full mt-2 text-xs gap-1.5"
                              onClick={() => { setAptModalApt(selectedApt); setAptModalOpen(true); }}
                            >
                              <Maximize2 className="h-3 w-3" /> Подробнее
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Building2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">Квартиры скоро появятся</p>
                  </div>
                )}
              </section>

              {/* Apartment Detail Modal */}
              <Dialog open={aptModalOpen} onOpenChange={setAptModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {aptModalApt && (Number(aptModalApt.rooms) === 0 ? "Студия" : `${aptModalApt.rooms}-комн. квартира`)}
                      {aptModalApt && `, ${aptModalApt.area} м²`}
                    </DialogTitle>
                  </DialogHeader>
                  {aptModalApt && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="sm:w-1/2">
                        <div className="aspect-square rounded-lg bg-secondary/30 border border-border flex items-center justify-center overflow-hidden">
                          {aptModalApt.layout_url ? (
                            <img src={aptModalApt.layout_url} alt="Планировка" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
                              <p className="text-xs text-muted-foreground mt-2">Планировка недоступна</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="sm:w-1/2 space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Площадь</span>
                            <span className="font-medium">{aptModalApt.area} м²</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Этаж</span>
                            <span className="font-medium">{aptModalApt.floor} из {aptModalApt.total_floors}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Срок сдачи</span>
                            <span className="font-medium">{complex?.completion_date || "—"}</span>
                          </div>
                          {aptModalApt.price_per_sqm && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Цена за м²</span>
                              <span className="font-medium">{aptModalApt.price_per_sqm.toLocaleString("ru-RU")} ₽</span>
                            </div>
                          )}
                        </div>
                        <div className="border-t border-border pt-3">
                          <p className="text-xl font-bold">{aptModalApt.price.toLocaleString("ru-RU")} ₽</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button className="flex-1 gap-1.5 text-xs" size="sm">
                            <MessageSquare className="h-3.5 w-3.5" /> Запросить
                          </Button>
                          <Button variant="outline" className="gap-1.5 text-xs" size="sm">
                            <Phone className="h-3.5 w-3.5" /> Позвонить
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* === ABOUT === */}
              <section id="about" className="scroll-mt-16 mb-10">
                <h2 className="text-base font-semibold mb-3">О комплексе</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{complex.description}</p>
                {complex.features && complex.features.length > 0 && (
                  <div className="mt-4">
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
              </section>

              {/* === MORTGAGE CALCULATOR === */}
              <section id="mortgage" className="scroll-mt-16 mb-10">
                <h2 className="text-base font-semibold mb-4">Ипотечный калькулятор</h2>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left: inputs */}
                  <div className="flex-1 rounded-lg border border-border p-5">
                    {/* Program tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {["Семейная ипотека", "Новостройка", "IT-ипотека", "Военная"].map((prog, i) => (
                        <button
                          key={prog}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                        >
                          {prog}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Стоимость объекта, руб.</label>
                        <Input
                          value={mortgageCalc.price.toLocaleString("ru-RU")}
                          onChange={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); if (v) setMortgageCalc(p => ({ ...p, price: v })); }}
                          className="h-10 text-sm font-medium"
                        />
                        <Slider value={[mortgageCalc.price]} onValueChange={([v]) => setMortgageCalc(p => ({ ...p, price: v }))} min={2000000} max={30000000} step={100000} className="mt-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>2 млн ₽</span><span>30 млн ₽</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Первоначальный взнос, руб.</label>
                        <div className="relative">
                          <Input
                            value={mortgageCalc.downPayment.toLocaleString("ru-RU")}
                            onChange={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); setMortgageCalc(p => ({ ...p, downPayment: v })); }}
                            className="h-10 text-sm font-medium pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {mortgageCalc.price > 0 ? Math.round(mortgageCalc.downPayment / mortgageCalc.price * 100) : 0}%
                          </span>
                        </div>
                        <Slider value={[mortgageCalc.downPayment]} onValueChange={([v]) => setMortgageCalc(p => ({ ...p, downPayment: v }))} min={0} max={mortgageCalc.price * 0.9} step={100000} className="mt-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>0 ₽</span><span>{formatPrice(mortgageCalc.price * 0.9)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Ставка, %</label>
                          <Input type="number" value={mortgageCalc.rate} onChange={(e) => setMortgageCalc(p => ({ ...p, rate: Number(e.target.value) }))} className="h-10 text-sm font-medium" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Срок кредита, лет</label>
                          <Input type="number" value={mortgageCalc.years} onChange={(e) => setMortgageCalc(p => ({ ...p, years: Number(e.target.value) }))} className="h-10 text-sm font-medium" />
                          <Slider value={[mortgageCalc.years]} onValueChange={([v]) => setMortgageCalc(p => ({ ...p, years: v }))} min={1} max={30} step={1} className="mt-2" />
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                            <span>1 год</span><span>30 лет</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: result */}
                  <div className="lg:w-[300px] shrink-0 rounded-lg bg-secondary/50 p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ежемесячный платёж</p>
                      <p className="text-2xl font-bold text-foreground">{formatPriceShort(calculateMortgage())}</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Средняя ставка</span>
                          <span className="font-semibold">{mortgageCalc.rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Сумма кредита</span>
                          <span className="font-semibold">{formatPriceShort(mortgageCalc.price - mortgageCalc.downPayment)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <Button className="w-full gap-1.5" size="lg">
                        <Send className="h-4 w-4" /> Подать заявку
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">Одна заявка во все банки</p>
                      <Button variant="outline" className="w-full gap-1.5 text-xs" size="sm">
                        <MessageSquare className="h-3.5 w-3.5" /> Обсудить в чате
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* === INSTALLMENT CALCULATOR === */}
              <section id="installment" className="scroll-mt-16 mb-10">
                <h2 className="text-base font-semibold mb-4">Рассрочка от застройщика</h2>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left: inputs */}
                  <div className="flex-1 rounded-lg border border-border p-5">
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Стоимость объекта, руб.</label>
                        <Input
                          value={installmentCalc.price.toLocaleString("ru-RU")}
                          onChange={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); if (v) setInstallmentCalc(p => ({ ...p, price: v })); }}
                          className="h-10 text-sm font-medium"
                        />
                        <Slider value={[installmentCalc.price]} onValueChange={([v]) => setInstallmentCalc(p => ({ ...p, price: v }))} min={2000000} max={30000000} step={100000} className="mt-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>2 млн ₽</span><span>30 млн ₽</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Первоначальный взнос, руб.</label>
                        <div className="relative">
                          <Input
                            value={installmentCalc.downPayment.toLocaleString("ru-RU")}
                            onChange={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); setInstallmentCalc(p => ({ ...p, downPayment: v })); }}
                            className="h-10 text-sm font-medium pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {installmentCalc.price > 0 ? Math.round(installmentCalc.downPayment / installmentCalc.price * 100) : 0}%
                          </span>
                        </div>
                        <Slider value={[installmentCalc.downPayment]} onValueChange={([v]) => setInstallmentCalc(p => ({ ...p, downPayment: v }))} min={0} max={installmentCalc.price * 0.9} step={100000} className="mt-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>0 ₽</span><span>{formatPrice(installmentCalc.price * 0.9)}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Срок рассрочки, мес.</label>
                        <Input type="number" value={installmentCalc.months} onChange={(e) => setInstallmentCalc(p => ({ ...p, months: Number(e.target.value) }))} className="h-10 text-sm font-medium" />
                        <Slider value={[installmentCalc.months]} onValueChange={([v]) => setInstallmentCalc(p => ({ ...p, months: v }))} min={3} max={60} step={1} className="mt-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>3 мес</span><span>60 мес</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: result */}
                  <div className="lg:w-[300px] shrink-0 rounded-lg bg-secondary/50 p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ежемесячный платёж</p>
                      <p className="text-2xl font-bold text-foreground">{formatPriceShort(calculateInstallment())}</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Без процентов</span>
                          <span className="font-semibold text-trust">0%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Остаток</span>
                          <span className="font-semibold">{formatPriceShort(installmentCalc.price - installmentCalc.downPayment)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Срок</span>
                          <span className="font-semibold">{installmentCalc.months} мес.</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <Button className="w-full gap-1.5" size="lg">
                        <Send className="h-4 w-4" /> Узнать условия
                      </Button>
                      <Button variant="outline" className="w-full gap-1.5 text-xs" size="sm">
                        <MessageSquare className="h-3.5 w-3.5" /> Обсудить в чате
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* === REVIEWS === */}
              <section id="reviews" className="scroll-mt-16 mb-10">
                <h2 className="text-base font-semibold mb-3">Отзывы</h2>
                <div className="rounded-lg border border-border p-4 mb-4">
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
              </section>

              {/* === DEVELOPER === */}
              <section id="developer" className="scroll-mt-16 mb-10">
                <h2 className="text-base font-semibold mb-3">Застройщик</h2>
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
              </section>

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
