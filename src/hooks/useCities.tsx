import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

interface City {
  id: string;
  name: string;
  slug: string;
}

interface CityContextType {
  cities: City[];
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
  loading: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("name");

      if (!error && data) {
        setCities(data);
        // Default to Moscow
        const moscow = data.find((c) => c.slug === "moscow");
        setSelectedCity(moscow || data[0] || null);
      }
      setLoading(false);
    };

    fetchCities();
  }, []);

  return (
    <CityContext.Provider value={{ cities, selectedCity, setSelectedCity, loading }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCities = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error("useCities must be used within a CityProvider");
  }
  return context;
};
