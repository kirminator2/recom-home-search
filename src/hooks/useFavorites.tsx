import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select("complex_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setFavorites(data.map((f) => f.complex_id).filter(Boolean) as string[]);
    }
    setLoading(false);
  };

  const toggleFavorite = async (complexId: string) => {
    if (!user) {
      toast.error("Войдите, чтобы добавлять в избранное");
      return;
    }

    const isFavorite = favorites.includes(complexId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("complex_id", complexId);

      if (!error) {
        setFavorites((prev) => prev.filter((id) => id !== complexId));
        toast.success("Удалено из избранного");
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, complex_id: complexId });

      if (!error) {
        setFavorites((prev) => [...prev, complexId]);
        toast.success("Добавлено в избранное");
      }
    }
  };

  const isFavorite = (complexId: string) => favorites.includes(complexId);

  return { favorites, loading, toggleFavorite, isFavorite, count: favorites.length };
};
