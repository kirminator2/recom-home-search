import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MapPin } from "lucide-react";

const MapPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Карта новостроек</h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              Интерактивная карта с фильтрами появится здесь. 
              Для полноценной работы требуется интеграция с картографическим сервисом.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
