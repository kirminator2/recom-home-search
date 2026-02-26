import { Heart, MapPin, Calendar, Star } from "lucide-react";
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
    <article className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-hover transition-shadow">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-1">
          {property.hasPromo && (
            <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
              Акция
            </span>
          )}
          {property.isNew && (
            <span className="rounded bg-trust px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
              Новый
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>

        {/* Price */}
        <div className="absolute bottom-2 left-2">
          <span className="rounded bg-background/90 px-2 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            от {formatPrice(property.priceFrom)} ₽
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {property.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{property.developer}</p>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.district}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {property.deadline}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 pt-2 border-t border-border">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-xs font-medium">{property.rating?.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({property.reviewsCount})</span>
        </div>
      </div>
    </article>
  );
};
