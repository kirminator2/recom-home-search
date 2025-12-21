export interface City {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Developer {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  projects_count: number;
  years_on_market: number;
  rating: number;
  city_id: string | null;
  created_at: string;
}

export interface ResidentialComplex {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  district: string | null;
  price_from: number | null;
  price_to: number | null;
  completion_date: string | null;
  image_url: string | null;
  gallery: string[] | null;
  features: string[] | null;
  developer_id: string | null;
  city_id: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  developer?: Developer;
}

export interface Apartment {
  id: string;
  complex_id: string;
  rooms: number;
  area: number;
  floor: number | null;
  total_floors: number | null;
  price: number;
  price_per_sqm: number | null;
  layout_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  complex_id: string | null;
  developer_id: string | null;
  city_id: string | null;
  is_promo: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string | null;
  complex_id: string | null;
  developer_id: string | null;
  is_verified: boolean;
  created_at: string;
}
