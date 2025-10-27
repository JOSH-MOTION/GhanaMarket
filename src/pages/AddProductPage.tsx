import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import type { Database } from '../lib/database.types';
import { db } from '../lib/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';

 type ProductInsert = Database['public']['Tables']['products']['Insert'];
 type Category = Database['public']['Tables']['categories']['Row'];

 export function AddProductPage() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Category[]);
    };
    loadCategories();
  }, []);

  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true);
    try {
      const uploaded: string[] = [];
      for (const f of Array.from(files)) {
        const res = await uploadToCloudinary(f, 'products');
        uploaded.push(res.secure_url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    if (!user || profile?.role !== 'seller') return;
    setLoading(true);
    try {
      const payload: ProductInsert = {
        seller_id: user.uid,
        title,
        description,
        price: Number(price),
        currency: 'GHS',
        images,
        video_url: null,
        category_id: categoryId,
        stock_count: 10,
        condition: 'new',
        tags: [],
        status: 'active',
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await addDoc(collection(db, 'products'), payload as any);
      setTitle('');
      setDescription('');
      setPrice(0);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={5} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Price (GHS)</label>
            <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value || null)} className="w-full border rounded px-3 py-2">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => onUpload(e.target.files)} />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <img key={i} src={url} className="w-full h-24 object-cover rounded" />
            ))}
          </div>
        </div>
        <button onClick={createProduct} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{loading ? 'Saving...' : 'Create Product'}</button>
      </div>
    </div>
  );
 }
