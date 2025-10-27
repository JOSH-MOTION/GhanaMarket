import { useState, useEffect } from 'react';
import { Heart, Share2, MessageCircle, Star, ChevronLeft, ChevronRight, Store, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { Database } from '../lib/database.types';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

type Product = Database['public']['Tables']['products']['Row'];
type SellerProfile = Database['public']['Tables']['seller_profiles']['Row'];

interface ProductDetailPageProps {
  productId: string;
  onBack?: () => void;
  onMessageSeller?: (sellerId: string) => void;
  onViewStore?: (storeSlug: string) => void;
}

export function ProductDetailPage({ productId, onBack, onMessageSeller, onViewStore }: ProductDetailPageProps) {
  useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const prodSnap = await getDoc(doc(db, 'products', productId));
      if (!prodSnap.exists()) {
        setLoading(false);
        return;
      }
      const productData = { id: prodSnap.id, ...(prodSnap.data() as Record<string, unknown>) } as unknown as Product;
      setProduct(productData);

      const sellerSnap = await getDoc(doc(db, 'seller_profiles', productData.seller_id));
      if (sellerSnap.exists()) {
        setSeller({ id: sellerSnap.id, ...(sellerSnap.data() as Record<string, unknown>) } as unknown as SellerProfile);
      }

      const newViews = (productData.view_count || 0) + 1;
      await updateDoc(doc(db, 'products', productId), { view_count: newViews });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const images = product?.images && product.images.length > 0
    ? product.images
    : ['https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 pb-24">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        idx === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {product.condition.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{product.stock_count} in stock</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(product.price)}
                </div>
                <p className="text-sm text-gray-600">Price negotiable</p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-900 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Secure Payment with Escrow</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your payment is held securely until you confirm delivery
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => product && addItem(product, quantity)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => onMessageSeller?.(seller.user_id)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message
                </button>
              </div>

              <div
                onClick={() => onViewStore?.(seller.store_slug)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {seller.logo_url ? (
                    <img src={seller.logo_url} alt={seller.store_name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Store className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{seller.store_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {seller.rating_avg > 0 && (
                        <>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="ml-1">{seller.rating_avg.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                        </>
                      )}
                      <span>{seller.total_sales} sales</span>
                    </div>
                  </div>
                  {seller.verification_status === 'verified' && (
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Verified
                    </div>
                  )}
                </div>
                <button className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Visit Store
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">
            Buy Now - {formatPrice(product.price * quantity)}
          </button>
          <button
            onClick={() => onMessageSeller?.(seller.user_id)}
            className="p-3 border-2 border-blue-600 text-blue-600 rounded-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
