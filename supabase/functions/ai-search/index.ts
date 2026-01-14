import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, cityId, budget, rooms, preferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch available complexes from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let complexQuery = supabase
      .from("residential_complexes")
      .select("id, name, slug, address, district, price_from, price_to, completion_date, rating, reviews_count, features, description, developer:developers(name)")
      .order("rating", { ascending: false });

    if (cityId) {
      complexQuery = complexQuery.eq("city_id", cityId);
    }

    const { data: complexes, error: dbError } = await complexQuery;
    
    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to fetch complexes");
    }

    const complexesContext = complexes?.map(c => {
      const dev = c.developer as unknown as { name: string } | null;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        district: c.district,
        priceFrom: c.price_from,
        priceTo: c.price_to,
        deadline: c.completion_date,
        rating: c.rating,
        reviews: c.reviews_count,
        features: c.features || [],
        description: c.description,
        developer: dev?.name,
      };
    }) || [];

    const systemPrompt = `Ты — умный AI-помощник по подбору новостроек. Ты помогаешь пользователям найти идеальную квартиру.

Доступные жилые комплексы:
${JSON.stringify(complexesContext, null, 2)}

Твоя задача:
1. Проанализировать запрос пользователя
2. Учесть его предпочтения: бюджет (${budget ? `до ${budget} млн ₽` : "не указан"}), количество комнат (${rooms || "не указано"}), особые пожелания
3. Порекомендовать 1-3 наиболее подходящих комплекса из списка
4. Объяснить, почему каждый комплекс подходит

Формат ответа:
- Краткий дружелюбный ответ на русском языке
- Для каждой рекомендации: название, почему подходит, ключевые преимущества
- Используй эмодзи для наглядности
- В конце добавь ID рекомендованных комплексов в формате: [IDS: id1, id2, id3]

Если запрос не связан с недвижимостью, вежливо направь пользователя к теме поиска жилья.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query || "Помоги подобрать квартиру" },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов. Попробуйте позже." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Требуется пополнение баланса AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Ошибка AI сервиса" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
