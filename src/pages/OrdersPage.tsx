import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query as fsQuery, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import { Link } from 'react-router-dom';

type Order = Database['public']['Tables']['orders']['Row'];

export function OrdersPage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = fsQuery(
          ordersRef,
          where(profile?.role === 'seller' ? 'seller_id' : 'buyer_id', '==', user.uid),
          orderBy('created_at', 'desc')
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
        setOrders(rows);
      } catch {
        const snap = await getDocs(collection(db, 'orders'));
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
        setOrders(rows.filter((o) => (profile?.role === 'seller' ? o.seller_id === user.uid : o.buyer_id === user.uid)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{profile?.role === 'seller' ? 'Store Orders' : 'My Orders'}</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <div className="font-medium">Order {o.order_number}</div>
                <div className="text-sm text-gray-600">Status: {o.status}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">GHS {o.total_amount.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
