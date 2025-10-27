import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { addDoc, collection, getDocs, orderBy, query as fsQuery, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

 type Conversation = Database['public']['Tables']['conversations']['Row'];
 type Message = Database['public']['Tables']['messages']['Row'];

 export function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const convRef = collection(db, 'conversations');
        const q = fsQuery(
          convRef,
          where('buyer_id', '==', user.uid)
        );
        const q2 = fsQuery(convRef, where('seller_id', '==', user.uid));
        const [a, b] = await Promise.all([getDocs(q), getDocs(q2)]);
        const rows = [...a.docs, ...b.docs].map((d) => ({ id: d.id, ...(d.data() as any) })) as Conversation[];
        rows.sort((x, y) => (y.last_message_at || '').localeCompare(x.last_message_at || ''));
        setConversations(rows);
        if (rows[0]) setActiveId(rows[0].id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      const msgRef = collection(db, 'messages');
      const q = fsQuery(msgRef, where('conversation_id', '==', activeId), orderBy('created_at'));
      const snap = await getDocs(q);
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Message[]);
    };
    load();
  }, [activeId]);

  const sendMessage = async () => {
    if (!user || !activeId || !text.trim()) return;
    const payload: Database['public']['Tables']['messages']['Insert'] = {
      conversation_id: activeId,
      sender_id: user.uid,
      message_text: text,
      attachments: [],
      read_at: null,
      created_at: new Date().toISOString(),
    };
    await addDoc(collection(db, 'messages'), payload as any);
    setText('');
    // Reload
    const msgRef = collection(db, 'messages');
    const q = fsQuery(msgRef, where('conversation_id', '==', activeId), orderBy('created_at'));
    const snap = await getDocs(q);
    setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Message[]);
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-3 font-semibold border-b">Messages</div>
        <div className="divide-y">
          {conversations.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full text-left p-3 hover:bg-gray-50 ${activeId === c.id ? 'bg-gray-50' : ''}`}>
              <div className="font-medium">Conversation</div>
              <div className="text-xs text-gray-500">{new Date(c.last_message_at).toLocaleString()}</div>
            </button>
          ))}
          {conversations.length === 0 && <div className="p-3 text-gray-600">No conversations yet.</div>}
        </div>
      </div>

      <div className="md:col-span-2 bg-white border rounded-lg flex flex-col">
        <div className="p-3 border-b font-medium">Chat</div>
        <div className="flex-1 p-3 space-y-2 overflow-auto">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[70%] px-3 py-2 rounded-lg ${m.sender_id === user?.uid ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100'}`}>
              {m.message_text}
              <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-gray-600">No messages yet.</div>}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" placeholder="Write a message..." />
          <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
 }
