import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/hooks/useCities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Clock,
  Search,
  Bell,
  Settings,
  Trash2,
  MapPin,
  Building2,
  Heart,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ViewHistoryItem {
  id: string;
  complex_id: string;
  viewed_at: string;
  complex?: {
    id: string;
    name: string;
    slug: string;
    district: string | null;
    image_url: string | null;
    price_from: number | null;
  };
}

interface SavedSearch {
  id: string;
  name: string;
  city_id: string | null;
  min_price: number | null;
  max_price: number | null;
  rooms: number[] | null;
  districts: string[] | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  email_notifications: boolean;
  push_notifications: boolean;
  price_alerts: boolean;
  new_complexes_alerts: boolean;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн ₽`;
  }
  return `${(price / 1000).toFixed(0)} тыс ₽`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Только что";
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString("ru-RU");
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cities } = useCities();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, phone, email_notifications, push_notifications, price_alerts, new_complexes_alerts")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch view history with complex details
      const { data: historyData } = await supabase
        .from("view_history")
        .select(`
          id,
          complex_id,
          viewed_at
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);

      if (historyData && historyData.length > 0) {
        // Fetch complex details separately
        const complexIds = historyData.map(h => h.complex_id);
        const { data: complexesData } = await supabase
          .from("residential_complexes")
          .select("id, name, slug, district, image_url, price_from")
          .in("id", complexIds);

        const historyWithComplexes = historyData.map(h => ({
          ...h,
          complex: complexesData?.find(c => c.id === h.complex_id),
        }));

        setViewHistory(historyWithComplexes);
      }

      // Fetch saved searches
      const { data: searchesData } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (searchesData) {
        setSavedSearches(searchesData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success("Настройки сохранены");
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      await supabase
        .from("view_history")
        .delete()
        .eq("user_id", user.id);

      setViewHistory([]);
      toast.success("История очищена");
    } catch (error) {
      toast.error("Ошибка очистки истории");
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await supabase
        .from("saved_searches")
        .delete()
        .eq("id", id);

      setSavedSearches(prev => prev.filter(s => s.id !== id));
      toast.success("Поиск удален");
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-6 sm:py-8">
          <div className="container max-w-4xl">
            {/* Profile Header */}
            <div className="mb-8 flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold">
                  {profile?.full_name || "Пользователь"}
                </h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="history" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="history" className="gap-2 py-2.5">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">История</span>
                </TabsTrigger>
                <TabsTrigger value="searches" className="gap-2 py-2.5">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Поиски</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2 py-2.5">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Уведомления</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 py-2.5">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Настройки</span>
                </TabsTrigger>
              </TabsList>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">История просмотров</h2>
                    <p className="text-sm text-muted-foreground">
                      Последние просмотренные ЖК
                    </p>
                  </div>
                  {viewHistory.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Очистить
                    </Button>
                  )}
                </div>

                {viewHistory.length > 0 ? (
                  <div className="space-y-2">
                    {viewHistory.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => item.complex?.slug && navigate(`/complex/${item.complex.slug}`)}
                      >
                        <CardContent className="p-3 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {item.complex?.image_url ? (
                              <img
                                src={item.complex.image_url}
                                alt={item.complex.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {item.complex?.name || "Неизвестный ЖК"}
                            </h3>
                            {item.complex?.district && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.complex.district}
                              </p>
                            )}
                            {item.complex?.price_from && (
                              <p className="text-sm font-medium mt-1">
                                от {formatPrice(item.complex.price_from)}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            {formatDate(item.viewed_at)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        История просмотров пуста
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate("/catalog")}
                      >
                        Перейти в каталог
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Saved Searches Tab */}
              <TabsContent value="searches" className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium">Сохранённые поиски</h2>
                  <p className="text-sm text-muted-foreground">
                    Быстрый доступ к частым запросам
                  </p>
                </div>

                {savedSearches.length > 0 ? (
                  <div className="space-y-2">
                    {savedSearches.map((search) => {
                      const city = cities.find(c => c.id === search.city_id);
                      return (
                        <Card key={search.id}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Search className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm">{search.name}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {city && (
                                  <Badge variant="secondary" className="text-xs">
                                    {city.name}
                                  </Badge>
                                )}
                                {search.min_price && (
                                  <Badge variant="secondary" className="text-xs">
                                    от {formatPrice(search.min_price)}
                                  </Badge>
                                )}
                                {search.max_price && (
                                  <Badge variant="secondary" className="text-xs">
                                    до {formatPrice(search.max_price)}
                                  </Badge>
                                )}
                                {search.rooms?.map(r => (
                                  <Badge key={r} variant="secondary" className="text-xs">
                                    {r}-комн.
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => deleteSearch(search.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        Нет сохранённых поисков
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Сохраняйте фильтры поиска для быстрого доступа
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium">Уведомления</h2>
                  <p className="text-sm text-muted-foreground">
                    Настройте, о чём вы хотите получать уведомления
                  </p>
                </div>

                <Card>
                  <CardContent className="p-0 divide-y">
                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="email_notifications" className="font-medium">
                          Email-уведомления
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Получать уведомления на почту
                        </p>
                      </div>
                      <Switch
                        id="email_notifications"
                        checked={profile?.email_notifications ?? true}
                        onCheckedChange={(checked) =>
                          updateProfile({ email_notifications: checked })
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="push_notifications" className="font-medium">
                          Push-уведомления
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Уведомления в браузере
                        </p>
                      </div>
                      <Switch
                        id="push_notifications"
                        checked={profile?.push_notifications ?? true}
                        onCheckedChange={(checked) =>
                          updateProfile({ push_notifications: checked })
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="price_alerts" className="font-medium">
                          Изменение цен
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Уведомлять о снижении цен в избранных ЖК
                        </p>
                      </div>
                      <Switch
                        id="price_alerts"
                        checked={profile?.price_alerts ?? true}
                        onCheckedChange={(checked) =>
                          updateProfile({ price_alerts: checked })
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="new_complexes_alerts" className="font-medium">
                          Новые ЖК
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Уведомлять о новых объектах по вашим критериям
                        </p>
                      </div>
                      <Switch
                        id="new_complexes_alerts"
                        checked={profile?.new_complexes_alerts ?? false}
                        onCheckedChange={(checked) =>
                          updateProfile({ new_complexes_alerts: checked })
                        }
                        disabled={saving}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium">Настройки профиля</h2>
                  <p className="text-sm text-muted-foreground">
                    Личная информация
                  </p>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Имя</Label>
                      <Input
                        id="full_name"
                        value={profile?.full_name || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                        placeholder="Введите имя"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile?.phone || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <Button
                      onClick={() => updateProfile({ full_name: profile?.full_name, phone: profile?.phone })}
                      disabled={saving}
                      className="w-full sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        "Сохранить"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => navigate("/favorites")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                        <Heart className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Избранное</h3>
                        <p className="text-xs text-muted-foreground">
                          Сохранённые объекты
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => navigate("/catalog")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Каталог</h3>
                        <p className="text-xs text-muted-foreground">
                          Все новостройки
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
