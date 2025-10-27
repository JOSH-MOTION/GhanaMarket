export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'buyer' | 'seller' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ProductStatus = 'draft' | 'active' | 'sold' | 'archived';
export type OrderStatus = 'created' | 'paid_in_escrow' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'refunded' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'courier';
export type EscrowStatus = 'holding' | 'released' | 'refunded';
export type PaymentMethod = 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money' | 'card';
export type PaymentProvider = 'paystack' | 'flutterwave' | 'direct';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';
export type ShipmentStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
export type ReviewType = 'seller' | 'delivery';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string;
          phone_verified_at: string | null;
          avatar_url: string | null;
          location_lat: number | null;
          location_lon: number | null;
          city: string | null;
          region: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone: string;
          phone_verified_at?: string | null;
          avatar_url?: string | null;
          location_lat?: number | null;
          location_lon?: number | null;
          city?: string | null;
          region?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string;
          phone_verified_at?: string | null;
          avatar_url?: string | null;
          location_lat?: number | null;
          location_lon?: number | null;
          city?: string | null;
          region?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      seller_profiles: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          store_slug: string;
          logo_url: string | null;
          bio: string | null;
          business_doc_url: string | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          rating_avg: number;
          rating_count: number;
          total_sales: number;
          followers_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          store_slug: string;
          logo_url?: string | null;
          bio?: string | null;
          business_doc_url?: string | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          rating_avg?: number;
          rating_count?: number;
          total_sales?: number;
          followers_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_name?: string;
          store_slug?: string;
          logo_url?: string | null;
          bio?: string | null;
          business_doc_url?: string | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          rating_avg?: number;
          rating_count?: number;
          total_sales?: number;
          followers_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          parent_id: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          parent_id?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          parent_id?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          images: string[];
          video_url: string | null;
          category_id: string | null;
          stock_count: number;
          condition: ProductCondition;
          tags: string[];
          status: ProductStatus;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          currency?: string;
          images?: string[];
          video_url?: string | null;
          category_id?: string | null;
          stock_count?: number;
          condition?: ProductCondition;
          tags?: string[];
          status?: ProductStatus;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          price?: number;
          currency?: string;
          images?: string[];
          video_url?: string | null;
          category_id?: string | null;
          stock_count?: number;
          condition?: ProductCondition;
          tags?: string[];
          status?: ProductStatus;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          seller_id: string;
          total_amount: number;
          currency: string;
          status: OrderStatus;
          delivery_method: DeliveryMethod;
          delivery_address: string | null;
          delivery_cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          buyer_id: string;
          seller_id: string;
          total_amount: number;
          currency?: string;
          status?: OrderStatus;
          delivery_method?: DeliveryMethod;
          delivery_address?: string | null;
          delivery_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          buyer_id?: string;
          seller_id?: string;
          total_amount?: number;
          currency?: string;
          status?: OrderStatus;
          delivery_method?: DeliveryMethod;
          delivery_address?: string | null;
          delivery_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          product_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          product_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          product_snapshot?: Json | null;
          created_at?: string;
        };
      };
      escrows: {
        Row: {
          id: string;
          order_id: string;
          amount: number;
          status: EscrowStatus;
          hold_until: string | null;
          released_at: string | null;
          release_reference: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount: number;
          status?: EscrowStatus;
          hold_until?: string | null;
          released_at?: string | null;
          release_reference?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          amount?: number;
          status?: EscrowStatus;
          hold_until?: string | null;
          released_at?: string | null;
          release_reference?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          method: PaymentMethod;
          provider: PaymentProvider;
          provider_reference: string | null;
          amount: number;
          status: PaymentStatus;
          phone_number: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method: PaymentMethod;
          provider: PaymentProvider;
          provider_reference?: string | null;
          amount: number;
          status?: PaymentStatus;
          phone_number?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          method?: PaymentMethod;
          provider?: PaymentProvider;
          provider_reference?: string | null;
          amount?: number;
          status?: PaymentStatus;
          phone_number?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      shipments: {
        Row: {
          id: string;
          order_id: string;
          courier_name: string | null;
          courier_phone: string | null;
          tracking_number: string | null;
          cost: number;
          eta_minutes: number | null;
          status: ShipmentStatus;
          pickup_address: string | null;
          delivery_address: string | null;
          pickup_lat: number | null;
          pickup_lon: number | null;
          delivery_lat: number | null;
          delivery_lon: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          courier_name?: string | null;
          courier_phone?: string | null;
          tracking_number?: string | null;
          cost?: number;
          eta_minutes?: number | null;
          status?: ShipmentStatus;
          pickup_address?: string | null;
          delivery_address?: string | null;
          pickup_lat?: number | null;
          pickup_lon?: number | null;
          delivery_lat?: number | null;
          delivery_lon?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          courier_name?: string | null;
          courier_phone?: string | null;
          tracking_number?: string | null;
          cost?: number;
          eta_minutes?: number | null;
          status?: ShipmentStatus;
          pickup_address?: string | null;
          delivery_address?: string | null;
          pickup_lat?: number | null;
          pickup_lon?: number | null;
          delivery_lat?: number | null;
          delivery_lon?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          order_id: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          order_id?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          order_id?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message_text: string | null;
          attachments: string[];
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message_text?: string | null;
          attachments?: string[];
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          message_text?: string | null;
          attachments?: string[];
          read_at?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          reviewer_id: string;
          seller_id: string | null;
          rating: number;
          review_text: string | null;
          review_type: ReviewType;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          reviewer_id: string;
          seller_id?: string | null;
          rating: number;
          review_text?: string | null;
          review_type?: ReviewType;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          reviewer_id?: string;
          seller_id?: string | null;
          rating?: number;
          review_text?: string | null;
          review_type?: ReviewType;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Json;
          read_at?: string | null;
          created_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          order_id: string;
          raised_by: string;
          reason: string;
          evidence: string[];
          status: DisputeStatus;
          resolution: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          raised_by: string;
          reason: string;
          evidence?: string[];
          status?: DisputeStatus;
          resolution?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          raised_by?: string;
          reason?: string;
          evidence?: string[];
          status?: DisputeStatus;
          resolution?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
