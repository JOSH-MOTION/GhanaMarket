import { useState, useEffect } from 'react';
import { MapPin, Filter, TrendingUp } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';
import type { Database } from '../lib/database.types';
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  query as fsQuery,
  where,
  orderBy,
  limit as fsLimit,
  documentId,
  Query,
  DocumentData,
} from 'firebase/firestore';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'] & {
  seller_profiles?: {
    store_name: string;
    rating_avg: number;
    logo_url: string | null;
  };
};

interface HomePageProps {
  onProductClick?: (productId: string) => void;
}

export function HomePage({ onProductClick }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getUserLocation();
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ lat: 5.6037, lon: -0.1870 });
        }
      );
    } else {
      setUserLocation({ lat: 5.6037, lon: -0.1870 });
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      // Attempt to filter to root categories and order by display_order
      const q: Query<DocumentData> = fsQuery(categoriesRef, where('parent_id', '==', null), orderBy('display_order'));
      const snap = await getDocs(q);
      const rows: Category[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as unknown as Category[];
      setCategories(rows);
    } catch {
      // Fallback to unfiltered categories if index missing
      const snap = await getDocs(collection(db, 'categories'));
      const rows: Category[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as unknown as Category[];
      setCategories(rows.filter((c) => c.parent_id === null).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
    }
  };

  const loadProducts = async () => {
    setLoading(true);

    try {
      const productsRef = collection(db, 'products');
      const constraints = [where('status', '==', 'active') as any, orderBy('created_at', 'desc') as any, fsLimit(50) as any];
      if (selectedCategory) {
        constraints.unshift(where('category_id', '==', selectedCategory) as any);
      }
      const q = fsQuery(productsRef, ...(constraints as any));
      const snap = await getDocs(q);
      let rows: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as unknown as Product[];

      if (searchQuery) {
        const qlc = searchQuery.toLowerCase();
        rows = rows.filter(
          (p) => p.title.toLowerCase().includes(qlc) || p.description.toLowerCase().includes(qlc)
        );
      }

      // Attach seller profile summary in batches of 10
      const sellerIds = Array.from(new Set(rows.map((p) => p.seller_id))).filter(Boolean);
      const sellerMap: Record<string, { store_name: string; rating_avg: number; logo_url: string | null }> = {};
      for (let i = 0; i < sellerIds.length; i += 10) {
        const chunk = sellerIds.slice(i, i + 10);
        const sellerRef = collection(db, 'seller_profiles');
        const sellerQ = fsQuery(sellerRef, where(documentId(), 'in', chunk as string[]));
        const sellerSnap = await getDocs(sellerQ);
        sellerSnap.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown> & {
            store_name: string;
            rating_avg?: number;
            logo_url?: string | null;
          };
          sellerMap[docSnap.id] = {
            store_name: d.store_name,
            rating_avg: (d.rating_avg as number | undefined) ?? 0,
            logo_url: (d.logo_url as string | null | undefined) ?? null,
          };
        });
      }

      const rowsWithSeller = rows.map((p) => ({
        ...p,
        seller_profiles: sellerMap[p.seller_id!],
      }));

      setProducts(rowsWithSeller);
    } catch (e) {
      console.error('Load products failed', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Your Location</span>
          </div>
          <p className="text-sm text-blue-100">
            {userLocation
              ? 'Accra, Ghana'
              : 'Enable location to see nearby products'}
          </p>
          {!userLocation && (
            <button
              onClick={getUserLocation}
              className="mt-2 px-4 py-1.5 bg-white text-blue-600 text-sm rounded-full font-medium hover:bg-blue-50"
            >
              Enable Location
            </button>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : searchQuery
                ? `Search results for "${searchQuery}"`
                : 'Nearby Products'}
            </h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => onProductClick?.(product.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
