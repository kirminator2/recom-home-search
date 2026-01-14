import { Heart, MapPin, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";

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
  const { toggleFavorite, isFavorite } = useFavorites();
  const isLiked = isFavorite(property.id);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`;
    }
    return `${(price / 1000).toFixed(0)} тыс`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  return (
    <article className="group relative overflow-hidden rounded-xl bg-card transition-all duration-300 ease-out hover:shadow-hover">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {property.hasPromo && (
            <Badge className="bg-accent/90 text-accent-foreground border-0 text-xs font-medium backdrop-blur-sm">
              Акция
            </Badge>
          )}
          {property.isNew && (
            <Badge className="bg-trust/90 text-primary-foreground border-0 text-xs font-medium backdrop-blur-sm">
              Новый
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105 ${
            isLiked ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 transition-all duration-200 ${isLiked ? "fill-current scale-110" : ""}`} />
        </Button>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-baseline rounded-lg bg-white/95 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-sm font-semibold text-foreground">
              от {formatPrice(property.priceFrom)} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Title & Developer */}
        <div className="mb-2.5">
          <h3 className="mb-0.5 text-base font-semibold text-foreground line-clamp-1 transition-colors duration-200 group-hover:text-primary">
            {property.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {property.developer}
          </p>
        </div>

        {/* Info */}
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.district}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {property.deadline}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 pt-2.5 border-t border-border/50">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-sm font-medium text-foreground">
            {property.rating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-muted-foreground">
            ({property.reviewsCount || 0})
          </span>
        </div>
      </div>
    </article>
  );
};
