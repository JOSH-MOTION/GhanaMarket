import { useState, useEffect } from 'react';
import { MapPin, Star, MessageCircle, Share2, ChevronLeft, Store, Package, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { Database } from '../lib/database.types';

type SellerProfile = Database['public']['Tables']['seller_profiles']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface SellerStorePageProps {
  storeSlug: string;
  onBack?: () => void;
  onProductClick?: (productId: string) => void;
  onMessageSeller?: (sellerId: string) => void;
}

export function SellerStorePage({ storeSlug, onBack, onProductClick, onMessageSeller }: SellerStorePageProps) {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  useEffect(() => {
    loadStore();
  }, [storeSlug]);

  const loadStore = async () => {
    setLoading(true);

    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('store_slug', storeSlug)
      .maybeSingle();

    if (sellerError || !sellerData) {
      setLoading(false);
      return;
    }

    setSeller(sellerData);

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerData.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (productsData) {
      setProducts(productsData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Store not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 hover:opacity-80"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-start gap-4">
            {seller.logo_url ? (
              <img
                src={seller.logo_url}
                alt={seller.store_name}
                className="w-20 h-20 rounded-full border-4 border-white/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/20 flex items-center justify-center">
                <Store className="w-10 h-10" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{seller.store_name}</h1>
                  {seller.verification_status === 'verified' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full mb-2">
                      <span>✓</span>
                      Verified Seller
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                {seller.rating_avg > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{seller.rating_avg.toFixed(1)}</span>
                    <span className="text-white/80">({seller.rating_count} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{products.length} Products</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{seller.total_sales} Sales</span>
                </div>
              </div>

              {seller.bio && (
                <p className="mt-3 text-white/90 text-sm">
                  {seller.bio}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onMessageSeller?.(seller.user_id)}
            className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Message Seller
          </button>
        </div>

        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews ({seller.rating_count})
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'products' && (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => onProductClick?.(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No products available yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg p-6">
              {seller.rating_count > 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Reviews coming soon</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
