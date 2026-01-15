import { useEffect, useRef, useState } from "react";
import { useYandexMaps } from "@/hooks/useYandexMaps";
import { ResidentialComplex } from "@/types/database";
import { Loader2, MapPin } from "lucide-react";

interface PropertyMapProps {
  complexes: ResidentialComplex[];
  onComplexClick?: (complex: ResidentialComplex) => void;
  className?: string;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн`;
  }
  return `${(price / 1000).toFixed(0)} тыс`;
};

export const PropertyMap = ({ complexes, onComplexClick, className = "" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const { isLoaded, isLoading, error, loadMaps } = useYandexMaps();
  const [selectedComplex, setSelectedComplex] = useState<ResidentialComplex | null>(null);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.ymaps) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
    }

    // Default center (Moscow)
    const defaultCenter = [55.751574, 37.573856];
    
    // Calculate center from complexes
    const complexesWithCoords = complexes.filter(c => c.latitude && c.longitude);
    let center = defaultCenter;
    
    if (complexesWithCoords.length > 0) {
      const avgLat = complexesWithCoords.reduce((sum, c) => sum + Number(c.latitude), 0) / complexesWithCoords.length;
      const avgLng = complexesWithCoords.reduce((sum, c) => sum + Number(c.longitude), 0) / complexesWithCoords.length;
      center = [avgLat, avgLng];
    }

    // Create map
    const map = new window.ymaps.Map(mapRef.current, {
      center,
      zoom: 11,
      controls: ["zoomControl", "geolocationControl"],
    }, {
      suppressMapOpenBlock: true,
    });

    mapInstanceRef.current = map;

    // Create clusterer
    const clusterer = new window.ymaps.Clusterer({
      preset: "islands#invertedVioletClusterIcons",
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
      clusterBalloonContentLayout: "cluster#balloonCarousel",
      clusterBalloonPagerSize: 5,
    });

    clustererRef.current = clusterer;

    // Create placemarks
    const placemarks = complexesWithCoords.map((complex) => {
      const placemark = new window.ymaps.Placemark(
        [Number(complex.latitude), Number(complex.longitude)],
        {
          balloonContentHeader: `<strong>${complex.name}</strong>`,
          balloonContentBody: `
            <div style="font-size: 13px; line-height: 1.4;">
              <p style="margin: 4px 0; color: #666;">${complex.district || ""}</p>
              <p style="margin: 4px 0; font-weight: 600; color: #1a1a1a;">
                от ${formatPrice(complex.price_from || 0)} ₽
              </p>
              ${complex.completion_date ? `<p style="margin: 4px 0; color: #666;">Сдача: ${complex.completion_date}</p>` : ""}
            </div>
          `,
          hintContent: complex.name,
          complexData: complex,
        },
        {
          preset: "islands#circleIcon",
          iconColor: "#6366f1",
        }
      );

      placemark.events.add("click", () => {
        setSelectedComplex(complex);
        if (onComplexClick) {
          onComplexClick(complex);
        }
      });

      return placemark;
    });

    clusterer.add(placemarks);
    map.geoObjects.add(clusterer);

    // Fit bounds if we have complexes
    if (complexesWithCoords.length > 1) {
      map.setBounds(clusterer.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 40,
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded, complexes, onComplexClick]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-xl ${className}`}>
        <div className="text-center p-6">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Не удалось загрузить карту
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-xl ${className}`}>
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/50" />
          <p className="mt-3 text-sm text-muted-foreground">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Selected complex card */}
      {selectedComplex && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80">
          <div 
            className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border cursor-pointer
                       transition-all duration-200 hover:shadow-xl"
            onClick={() => {
              if (onComplexClick) onComplexClick(selectedComplex);
            }}
          >
            <div className="flex gap-3">
              {selectedComplex.image_url && (
                <img 
                  src={selectedComplex.image_url} 
                  alt={selectedComplex.name}
                  className="w-20 h-20 rounded-md object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{selectedComplex.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedComplex.district}</p>
                <p className="font-semibold text-sm mt-2">
                  от {formatPrice(selectedComplex.price_from || 0)} ₽
                </p>
              </div>
            </div>
            <button 
              className="absolute top-2 right-2 p-1 hover:bg-secondary rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComplex(null);
              }}
            >
              <span className="sr-only">Закрыть</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
