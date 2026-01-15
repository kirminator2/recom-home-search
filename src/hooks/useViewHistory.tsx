import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useViewHistory = () => {
  const { user } = useAuth();

  const trackView = useCallback(async (complexId: string) => {
    if (!user) return;

    try {
      // Check if already viewed recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: existing } = await supabase
        .from("view_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("complex_id", complexId)
        .gte("viewed_at", oneHourAgo)
        .maybeSingle();

      if (!existing) {
        await supabase.from("view_history").insert({
          user_id: user.id,
          complex_id: complexId,
        });
      }
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  }, [user]);

  return { trackView };
};
