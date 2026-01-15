import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MapFiltersProps {
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (range: [number, number]) => void;
  selectedDistricts: string[];
  availableDistricts: string[];
  onDistrictChange: (districts: string[]) => void;
  onReset: () => void;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн`;
  }
  return `${(price / 1000).toFixed(0)} тыс`;
};

export const MapFilters = ({
  priceRange,
  maxPrice,
  onPriceChange,
  selectedDistricts,
  availableDistricts,
  onDistrictChange,
  onReset,
}: MapFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < maxPrice || selectedDistricts.length > 0;

  const toggleDistrict = (district: string) => {
    if (selectedDistricts.includes(district)) {
      onDistrictChange(selectedDistricts.filter(d => d !== district));
    } else {
      onDistrictChange([...selectedDistricts, district]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 gap-2 bg-background/90 backdrop-blur-sm border-border/50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {(priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + selectedDistricts.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Цена</label>
              <Slider
                value={priceRange}
                min={0}
                max={maxPrice}
                step={500000}
                onValueChange={(value) => onPriceChange(value as [number, number])}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>от {formatPrice(priceRange[0])} ₽</span>
                <span>до {formatPrice(priceRange[1])} ₽</span>
              </div>
            </div>

            {/* Districts */}
            {availableDistricts.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Район</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableDistricts.slice(0, 8).map((district) => (
                    <Badge
                      key={district}
                      variant={selectedDistricts.includes(district) ? "default" : "outline"}
                      className="cursor-pointer transition-all text-xs"
                      onClick={() => toggleDistrict(district)}
                    >
                      {district}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reset */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground"
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {selectedDistricts.length > 0 && (
        <div className="hidden sm:flex gap-1.5">
          {selectedDistricts.slice(0, 2).map((district) => (
            <Badge 
              key={district} 
              variant="secondary" 
              className="h-7 gap-1 pr-1 bg-background/90 backdrop-blur-sm"
            >
              {district}
              <button 
                className="p-0.5 hover:bg-secondary rounded-full"
                onClick={() => toggleDistrict(district)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedDistricts.length > 2 && (
            <Badge variant="secondary" className="h-7 bg-background/90 backdrop-blur-sm">
              +{selectedDistricts.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
