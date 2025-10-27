/*
  # Ghana Marketplace Platform - Core Schema

  ## Overview
  Complete database schema for a mobile-first marketplace platform focused on Ghana,
  with support for buyers, sellers, escrow payments, delivery tracking, and real-time chat.

  ## New Tables

  ### 1. `profiles`
  Extended user profile information with location and role management
  - `id` (uuid, references auth.users)
  - `role` (enum: buyer, seller, admin)
  - `full_name` (text)
  - `phone` (text, unique)
  - `phone_verified_at` (timestamptz)
  - `avatar_url` (text)
  - `location_lat` (numeric)
  - `location_lon` (numeric)
  - `city` (text)
  - `region` (text)
  - `address` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `seller_profiles`
  Seller-specific business information and verification
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `store_name` (text, unique)
  - `store_slug` (text, unique)
  - `logo_url` (text)
  - `bio` (text)
  - `business_doc_url` (text)
  - `verification_status` (enum: pending, verified, rejected)
  - `verified_at` (timestamptz)
  - `rating_avg` (numeric, default 0)
  - `rating_count` (int, default 0)
  - `total_sales` (int, default 0)
  - `followers_count` (int, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `categories`
  Product categories for organization and filtering
  - `id` (uuid, primary key)
  - `name` (text)
  - `slug` (text, unique)
  - `icon` (text)
  - `parent_id` (uuid, references categories)
  - `display_order` (int)

  ### 4. `products`
  Product listings with media, pricing, and inventory
  - `id` (uuid, primary key)
  - `seller_id` (uuid, references seller_profiles)
  - `title` (text)
  - `description` (text)
  - `price` (numeric)
  - `currency` (text, default 'GHS')
  - `images` (text array)
  - `video_url` (text)
  - `category_id` (uuid, references categories)
  - `stock_count` (int, default 0)
  - `condition` (enum: new, like_new, good, fair)
  - `tags` (text array)
  - `status` (enum: draft, active, sold, archived)
  - `view_count` (int, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `orders`
  Order transactions with escrow and delivery tracking
  - `id` (uuid, primary key)
  - `order_number` (text, unique)
  - `buyer_id` (uuid, references profiles)
  - `seller_id` (uuid, references seller_profiles)
  - `total_amount` (numeric)
  - `currency` (text, default 'GHS')
  - `status` (enum: created, paid_in_escrow, shipped, delivered, completed, disputed, refunded, cancelled)
  - `delivery_method` (enum: pickup, courier)
  - `delivery_address` (text)
  - `delivery_cost` (numeric, default 0)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `order_items`
  Individual items within orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `product_id` (uuid, references products)
  - `quantity` (int)
  - `unit_price` (numeric)
  - `total_price` (numeric)
  - `product_snapshot` (jsonb)

  ### 7. `escrows`
  Payment escrow management for secure transactions
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders, unique)
  - `amount` (numeric)
  - `status` (enum: holding, released, refunded)
  - `hold_until` (timestamptz)
  - `released_at` (timestamptz)
  - `release_reference` (text)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 8. `payments`
  Payment transaction records
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `method` (enum: mtn_momo, vodafone_cash, airteltigo_money, card)
  - `provider` (enum: paystack, flutterwave, direct)
  - `provider_reference` (text)
  - `amount` (numeric)
  - `status` (enum: pending, successful, failed, refunded)
  - `phone_number` (text)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. `shipments`
  Delivery and shipment tracking
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders, unique)
  - `courier_name` (text)
  - `courier_phone` (text)
  - `tracking_number` (text)
  - `cost` (numeric)
  - `eta_minutes` (int)
  - `status` (enum: pending, assigned, picked_up, in_transit, delivered, failed)
  - `pickup_address` (text)
  - `delivery_address` (text)
  - `pickup_lat` (numeric)
  - `pickup_lon` (numeric)
  - `delivery_lat` (numeric)
  - `delivery_lon` (numeric)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 10. `conversations`
  Chat conversations between users
  - `id` (uuid, primary key)
  - `buyer_id` (uuid, references profiles)
  - `seller_id` (uuid, references profiles)
  - `order_id` (uuid, references orders)
  - `last_message_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 11. `messages`
  Individual chat messages
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references conversations)
  - `sender_id` (uuid, references profiles)
  - `message_text` (text)
  - `attachments` (text array)
  - `read_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 12. `reviews`
  Ratings and reviews for sellers and delivery
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `reviewer_id` (uuid, references profiles)
  - `seller_id` (uuid, references seller_profiles)
  - `rating` (int, 1-5)
  - `review_text` (text)
  - `review_type` (enum: seller, delivery)
  - `created_at` (timestamptz)

  ### 13. `notifications`
  Real-time notifications for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `type` (text)
  - `title` (text)
  - `message` (text)
  - `data` (jsonb)
  - `read_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 14. `disputes`
  Order dispute management
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `raised_by` (uuid, references profiles)
  - `reason` (text)
  - `evidence` (text array)
  - `status` (enum: open, investigating, resolved, closed)
  - `resolution` (text)
  - `resolved_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for user data access based on role and ownership
  - Admin-only access for sensitive operations
  - Secure payment and escrow operations
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'sold', 'archived');
CREATE TYPE order_status AS ENUM ('created', 'paid_in_escrow', 'shipped', 'delivered', 'completed', 'disputed', 'refunded', 'cancelled');
CREATE TYPE delivery_method AS ENUM ('pickup', 'courier');
CREATE TYPE escrow_status AS ENUM ('holding', 'released', 'refunded');
CREATE TYPE payment_method AS ENUM ('mtn_momo', 'vodafone_cash', 'airteltigo_money', 'card');
CREATE TYPE payment_provider AS ENUM ('paystack', 'flutterwave', 'direct');
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');
CREATE TYPE shipment_status AS ENUM ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed');
CREATE TYPE review_type AS ENUM ('seller', 'delivery');
CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved', 'closed');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'buyer',
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  phone_verified_at timestamptz,
  avatar_url text,
  location_lat numeric,
  location_lon numeric,
  city text,
  region text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view public profile data"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Seller profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_name text UNIQUE NOT NULL,
  store_slug text UNIQUE NOT NULL,
  logo_url text,
  bio text,
  business_doc_url text,
  verification_status verification_status DEFAULT 'pending',
  verified_at timestamptz,
  rating_avg numeric DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count int DEFAULT 0,
  total_sales int DEFAULT 0,
  followers_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own store"
  ON seller_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Sellers can update own store"
  ON seller_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view verified stores"
  ON seller_profiles FOR SELECT
  TO authenticated
  USING (verification_status = 'verified');

CREATE POLICY "Sellers can create own store"
  ON seller_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  currency text DEFAULT 'GHS',
  images text[] DEFAULT '{}',
  video_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock_count int DEFAULT 0 CHECK (stock_count >= 0),
  condition product_condition DEFAULT 'new',
  tags text[] DEFAULT '{}',
  status product_status DEFAULT 'draft',
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM seller_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    seller_id IN (
      SELECT id FROM seller_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  currency text DEFAULT 'GHS',
  status order_status DEFAULT 'created',
  delivery_method delivery_method DEFAULT 'courier',
  delivery_address text,
  delivery_cost numeric DEFAULT 0 CHECK (delivery_cost >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view their sales"
  ON orders FOR SELECT
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM seller_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM seller_profiles WHERE user_id = auth.uid()
    )
  );

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  product_snapshot jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())
    )
  );

-- Escrows table
CREATE TABLE IF NOT EXISTS escrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  status escrow_status DEFAULT 'holding',
  hold_until timestamptz,
  released_at timestamptz,
  release_reference text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view escrow"
  ON escrows FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())
    )
  );

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  provider payment_provider NOT NULL,
  provider_reference text,
  amount numeric NOT NULL CHECK (amount >= 0),
  status payment_status DEFAULT 'pending',
  phone_number text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())
    )
  );

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_name text,
  courier_phone text,
  tracking_number text,
  cost numeric DEFAULT 0 CHECK (cost >= 0),
  eta_minutes int,
  status shipment_status DEFAULT 'pending',
  pickup_address text,
  delivery_address text,
  pickup_lat numeric,
  pickup_lon numeric,
  delivery_lat numeric,
  delivery_lon numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())
    )
  );

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(buyer_id, seller_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view"
  ON conversations FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text text,
  attachments text[] DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES seller_profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_type review_type DEFAULT 'seller',
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, reviewer_id, review_type)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid())
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  raised_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  evidence text[] DEFAULT '{}',
  status dispute_status DEFAULT 'open',
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view disputes"
  ON disputes FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Order participants can create disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    raised_by = auth.uid() AND
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_lat, location_lon);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_slug ON seller_profiles(store_slug);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_escrows_order_id ON escrows(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);

-- Insert default categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Electronics', 'electronics', 'Smartphone', 1),
  ('Fashion & Clothing', 'fashion-clothing', 'Shirt', 2),
  ('Home & Garden', 'home-garden', 'Home', 3),
  ('Beauty & Health', 'beauty-health', 'Sparkles', 4),
  ('Sports & Outdoors', 'sports-outdoors', 'Dumbbell', 5),
  ('Automotive', 'automotive', 'Car', 6),
  ('Books & Media', 'books-media', 'Book', 7),
  ('Toys & Games', 'toys-games', 'Gamepad2', 8),
  ('Food & Groceries', 'food-groceries', 'ShoppingBasket', 9),
  ('Services', 'services', 'Briefcase', 10)
ON CONFLICT (slug) DO NOTHING;