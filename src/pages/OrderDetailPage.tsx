import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, orderBy, query as fsQuery, updateDoc, where } from 'firebase/firestore';
import type { Database } from '../lib/database.types';
import { releaseEscrow, formatAmount } from '../lib/payment';
import { useAuth } from '../contexts/AuthContext';

 type Order = Database['public']['Tables']['orders']['Row'];
 type OrderItem = Database['public']['Tables']['order_items']['Row'];

export function OrderDetailPage({ orderId: propOrderId }: { orderId?: string }) {
  const params = useParams();
  const { profile } = useAuth();
  const orderId = propOrderId || params.id!;
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...(orderSnap.data() as any) } as Order);
        }
        const itemsRef = collection(db, 'order_items');
        const snap = await getDocs(fsQuery(itemsRef, where('order_id', '==', orderId), orderBy('created_at')));
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as OrderItem[];
        setItems(rows);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const markShipped = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'shipped', updated_at: new Date().toISOString() });
      setOrder({ ...order, status: 'shipped' });
    } finally {
      setActionLoading(false);
    }
  };

  const markDelivered = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'delivered', updated_at: new Date().toISOString() });
      await releaseEscrow(order.id);
      setOrder({ ...order, status: 'delivered' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Order {order.order_number}</h1>
      <div className="text-gray-600 mb-4">Status: {order.status}</div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="bg-white border rounded-lg p-3 flex items-center gap-3">
              {it.product_snapshot && (it.product_snapshot as any).image ? (
                <img src={(it.product_snapshot as any).image} className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded" />
              )}
              <div className="flex-1">
                <div className="font-medium">{(it.product_snapshot as any)?.title || 'Product'}</div>
                <div className="text-sm text-gray-600">Qty {it.quantity}</div>
              </div>
              <div className="font-semibold">{formatAmount(it.total_price)}</div>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-lg p-4 h-fit">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total</span>
            <span className="font-semibold">{formatAmount(order.total_amount)}</span>
          </div>

          {profile?.role === 'seller' && order.status === 'paid_in_escrow' && (
            <button onClick={markShipped} disabled={actionLoading} className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-semibold">Mark as shipped</button>
          )}
          {profile?.role === 'buyer' && order.status === 'shipped' && (
            <button onClick={markDelivered} disabled={actionLoading} className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-semibold">Confirm delivery</button>
          )}
        </div>
      </div>
    </div>
  );
 }
