import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    ymaps: any;
  }
}

export const useYandexMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMaps = useCallback(async () => {
    if (window.ymaps) {
      setIsLoaded(true);
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke("get-yandex-maps-key");
      
      if (funcError || !data?.apiKey) {
        throw new Error("Failed to get API key");
      }

      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${data.apiKey}&lang=ru_RU`;
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          window.ymaps.ready(() => {
            setIsLoaded(true);
            resolve();
          });
        };
        script.onerror = () => reject(new Error("Failed to load Yandex Maps"));
        document.head.appendChild(script);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return { isLoaded, isLoading, error, loadMaps };
};
