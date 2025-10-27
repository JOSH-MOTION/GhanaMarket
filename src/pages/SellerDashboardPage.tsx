import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query as fsQuery, updateDoc, where, doc } from 'firebase/firestore';
import type { Database } from '../lib/database.types';
import { ProductCard } from '../components/ProductCard';

 type Product = Database['public']['Tables']['products']['Row'];
 type Order = Database['public']['Tables']['orders']['Row'];

 export function SellerDashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'seller') return;
    const load = async () => {
      setLoading(true);
      try {
        const prodRef = collection(db, 'products');
        const prodSnap = await getDocs(fsQuery(prodRef, where('seller_id', '==', user.uid), orderBy('created_at', 'desc')));
        setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[]);

        const ordersRef = collection(db, 'orders');
        const orderSnap = await getDocs(fsQuery(ordersRef, where('seller_id', '==', user.uid), orderBy('created_at', 'desc')));
        setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile?.role]);

  const toggleProductStatus = async (p: Product) => {
    const next = p.status === 'active' ? 'archived' : 'active';
    await updateDoc(doc(db, 'products', p.id), { status: next, updated_at: new Date().toISOString() });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Products</button>
        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Orders</button>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id}>
              <ProductCard product={p as any} />
              <div className="mt-2 flex gap-2">
                <button onClick={() => toggleProductStatus(p)} className="flex-1 border rounded px-3 py-1 text-sm">{p.status === 'active' ? 'Archive' : 'Activate'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border rounded-lg divide-y">
          {orders.map((o) => (
            <div key={o.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.order_number}</div>
                <div className="text-sm text-gray-600">{o.status}</div>
              </div>
              <div className="font-semibold">GHS {o.total_amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
 }
