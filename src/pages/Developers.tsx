import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Developer } from "@/types/database";
import { Building2, Star, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Developers = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    const { data, error } = await supabase
      .from("developers")
      .select("*")
      .order("rating", { ascending: false });

    if (!error && data) {
      setDevelopers(data);
    }
    setLoading(false);
  };

  const filteredDevelopers = developers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Застройщики
              </h1>
              <p className="mt-2 text-muted-foreground">
                {filteredDevelopers.length} проверенных компаний
              </p>
            </div>

            <div className="mb-8 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск застройщика..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredDevelopers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDevelopers.map((developer) => (
                  <Link key={developer.id} to={`/developer/${developer.slug}`}>
                    <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shrink-0">
                          <Building2 className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {developer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {developer.years_on_market} лет • {developer.projects_count} проектов
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            {developer.rating}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Ничего не найдено</h3>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Developers;
