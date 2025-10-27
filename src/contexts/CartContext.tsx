import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem {
  productId: string;
  sellerId: string;
  title: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalAmount: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'cart:v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem: CartContextType['addItem'] = (product, quantity) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(product.stock_count, i.quantity + quantity) }
            : i
        );
      }
      const imageUrl = product.images?.[0] ?? null;
      return [
        ...prev,
        {
          productId: product.id,
          sellerId: product.seller_id,
          title: product.title,
          price: product.price,
          imageUrl,
          quantity: Math.max(1, Math.min(quantity, product.stock_count || 1)),
        },
      ];
    });
  };

  const updateQuantity: CartContextType['updateQuantity'] = (productId, quantity) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)));
  };

  const removeItem: CartContextType['removeItem'] = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clear = () => setItems([]);

  const { totalAmount, totalCount } = useMemo(
    () => ({
      totalAmount: items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0),
      totalCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    }),
    [items]
  );

  const value: CartContextType = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    totalAmount,
    totalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
