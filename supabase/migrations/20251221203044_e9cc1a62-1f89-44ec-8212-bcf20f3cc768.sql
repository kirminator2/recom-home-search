-- Города
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Застройщики
CREATE TABLE public.developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  projects_count INTEGER DEFAULT 0,
  years_on_market INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  city_id UUID REFERENCES public.cities(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Жилые комплексы
CREATE TABLE public.residential_complexes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  district TEXT,
  price_from BIGINT,
  price_to BIGINT,
  completion_date TEXT,
  image_url TEXT,
  gallery TEXT[],
  features TEXT[],
  developer_id UUID REFERENCES public.developers(id),
  city_id UUID REFERENCES public.cities(id),
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Квартиры
CREATE TABLE public.apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complex_id UUID REFERENCES public.residential_complexes(id) ON DELETE CASCADE,
  rooms INTEGER NOT NULL,
  area DECIMAL(6,2) NOT NULL,
  floor INTEGER,
  total_floors INTEGER,
  price BIGINT NOT NULL,
  price_per_sqm BIGINT,
  layout_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Новости
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT,
  complex_id UUID REFERENCES public.residential_complexes(id),
  developer_id UUID REFERENCES public.developers(id),
  city_id UUID REFERENCES public.cities(id),
  is_promo BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Отзывы
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  complex_id UUID REFERENCES public.residential_complexes(id),
  developer_id UUID REFERENCES public.developers(id),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Избранное (требует авторизации)
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  complex_id UUID REFERENCES public.residential_complexes(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, complex_id),
  UNIQUE(user_id, apartment_id)
);

-- Подборки
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  complex_id UUID REFERENCES public.residential_complexes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, complex_id)
);

-- Профили пользователей
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_city_id UUID REFERENCES public.cities(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residential_complexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Developers are publicly readable" ON public.developers FOR SELECT USING (true);
CREATE POLICY "Complexes are publicly readable" ON public.residential_complexes FOR SELECT USING (true);
CREATE POLICY "Apartments are publicly readable" ON public.apartments FOR SELECT USING (true);
CREATE POLICY "News are publicly readable" ON public.news FOR SELECT USING (true);
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their collection items" ON public.collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);
CREATE POLICY "Users can add to their collections" ON public.collection_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);
CREATE POLICY "Users can remove from their collections" ON public.collection_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews can be created by anyone (for now)
CREATE POLICY "Anyone can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_complexes_city ON public.residential_complexes(city_id);
CREATE INDEX idx_complexes_developer ON public.residential_complexes(developer_id);
CREATE INDEX idx_apartments_complex ON public.apartments(complex_id);
CREATE INDEX idx_news_city ON public.news(city_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_collections_user ON public.collections(user_id);