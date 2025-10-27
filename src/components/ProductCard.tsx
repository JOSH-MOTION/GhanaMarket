import { MapPin, Eye } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  seller_profiles?: {
    store_name: string;
    rating_avg: number;
    logo_url: string | null;
  };
};

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const primaryImage = product.images?.[0] || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-100"
    >
      <div className="relative aspect-square bg-gray-100">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {product.condition !== 'new' && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
            {product.condition.replace('_', ' ').toUpperCase()}
          </span>
        )}
        {product.stock_count === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-sm">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.view_count > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Eye className="w-3 h-3 mr-1" />
              {product.view_count}
            </div>
          )}
        </div>

        {product.seller_profiles && (
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {product.seller_profiles.logo_url && (
                <img
                  src={product.seller_profiles.logo_url}
                  alt={product.seller_profiles.store_name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="truncate max-w-[120px]">
                {product.seller_profiles.store_name}
              </span>
            </div>
            {product.seller_profiles.rating_avg > 0 && (
              <div className="flex items-center">
                <span className="text-amber-500 mr-0.5">★</span>
                <span>{product.seller_profiles.rating_avg.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
