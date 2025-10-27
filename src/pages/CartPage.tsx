import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import type { Database } from '../lib/database.types';
import { formatAmount, initiatePayment } from '../lib/payment';
import { useNavigate } from 'react-router-dom';

type Order = Database['public']['Tables']['orders']['Insert'];

export function CartPage() {
  const { items, updateQuantity, removeItem, clear, totalAmount } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const groupedBySeller = useMemo(() => {
    const map: Record<string, typeof items> = {};
    for (const it of items) {
      map[it.sellerId] ||= [];
      map[it.sellerId].push(it);
    }
    return map;
  }, [items]);

  const handleCheckout = async () => {
    if (!user) return;
    if (items.length === 0) return;
    setLoading(true);
    try {
      for (const [sellerId, sellerItems] of Object.entries(groupedBySeller)) {
        const orderDoc = await addDoc(collection(db, 'orders'), {
          order_number: 'LM-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          buyer_id: user.uid,
          seller_id: sellerId,
          total_amount: sellerItems.reduce((s: number, i) => s + i.price * i.quantity, 0),
          currency: 'GHS',
          status: 'created',
          delivery_method: 'courier',
          delivery_address: null,
          delivery_cost: 0,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Order);

        for (const it of sellerItems) {
          const itemDocRef = doc(collection(db, 'order_items'));
          await setDoc(itemDocRef, {
            order_id: orderDoc.id,
            product_id: it.productId,
            quantity: it.quantity,
            unit_price: it.price,
            total_price: it.price * it.quantity,
            product_snapshot: {
              title: it.title,
              image: it.imageUrl,
            },
            created_at: new Date().toISOString(),
          });
        }

        try {
          await initiatePayment({
            orderId: orderDoc.id,
            amount: sellerItems.reduce((s: number, i) => s + i.price * i.quantity, 0),
            method: 'mtn_momo',
            provider: 'paystack',
            email: user.email || 'customer@example.com',
          });
        } catch {}

        navigate(`/orders/${orderDoc.id}`);
      }
      clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.productId} className="flex gap-4 bg-white rounded-lg border p-3">
                <img src={it.imageUrl ?? 'https://via.placeholder.com/80'} alt="" className="w-20 h-20 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-600">{formatAmount(it.price)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))} className="px-2 border rounded">-</button>
                    <input value={it.quantity} onChange={(e) => updateQuantity(it.productId, Math.max(1, parseInt(e.target.value) || 1))} className="w-14 text-center border rounded px-2 py-1" />
                    <button onClick={() => updateQuantity(it.productId, it.quantity + 1)} className="px-2 border rounded">+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(it.productId)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border p-4 h-fit">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatAmount(totalAmount)}</span>
            </div>
            <button disabled={loading} onClick={handleCheckout} className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
