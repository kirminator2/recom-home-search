import { useState } from "react";
import { Heart, MapPin, Calendar, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Property {
  id: string;
  name: string;
  developer: string;
  district: string;
  metro?: string;
  priceFrom: number;
  priceTo: number;
  deadline: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  hasPromo?: boolean;
  isNew?: boolean;
}

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`;
    }
    return `${(price / 1000).toFixed(0)} тыс`;
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {property.hasPromo && (
            <Badge className="bg-accent text-accent-foreground border-0">
              Акция
            </Badge>
          )}
          {property.isNew && (
            <Badge className="bg-trust text-primary-foreground border-0">
              Новый
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-3 top-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card ${
            isFavorite ? "text-destructive" : "text-muted-foreground"
          }`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="inline-flex items-baseline gap-1 rounded-lg bg-card/90 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-lg font-bold text-foreground">
              от {formatPrice(property.priceFrom)} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Developer */}
        <div className="mb-3">
          <h3 className="mb-1 text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {property.developer}
          </p>
        </div>

        {/* Info Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{property.district}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{property.deadline}</span>
          </div>
          {property.metro && (
            <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="truncate">{property.metro}</span>
            </div>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-semibold text-foreground">
              {property.rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({property.reviewsCount} отзывов)
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            Подробнее
          </Button>
        </div>
      </div>
    </article>
  );
};
