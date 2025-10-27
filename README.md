# Ghana Marketplace Platform - MVP

A mobile-first marketplace platform for Ghana with escrow payments, location-based discovery, and integrated delivery tracking.

## 🎯 MVP Features

### Core Features
- ✅ User authentication with role-based access (Buyer/Seller/Admin)
- ✅ Seller store creation and management
- ✅ Product listing with images and videos
- ✅ Location-based product discovery
- ✅ Secure escrow payment system
- ✅ Mobile Money integration (MTN, Vodafone, AirtelTigo)
- ✅ Card payments via Paystack/Flutterwave
- ✅ Delivery tracking and management
- ✅ Real-time chat with file sharing
- ✅ Rating and review system
- ✅ Admin dashboard
- ✅ Real-time notifications

## 🗓️ 6-Week Sprint Plan

### Sprint 1 (Week 1-2): Foundation & Authentication
**Completed:**
- Database schema with 14 tables
- Row-Level Security (RLS) policies
- User authentication (email/password)
- Role-based registration (Buyer/Seller)
- Profile management

### Sprint 2 (Week 2-3): Seller Experience & Products
**To Do:**
- Seller onboarding flow
- KYC document upload
- Product CRUD with media upload
- Inventory management dashboard
- Category management

### Sprint 3 (Week 3-4): Discovery & Search
**Completed:**
- Location-based product search
- Category filtering
- Product detail page
- Seller store page
- Search functionality

### Sprint 4 (Week 4-5): Checkout & Escrow
**Completed:**
- Payment integration (Paystack/Flutterwave)
- Mobile Money support
- Escrow management system
- Payment webhooks
- Order creation

**To Do:**
- Shopping cart UI
- Checkout flow UI
- Payment method selection

### Sprint 5 (Week 5-6): Delivery & Fulfillment
**To Do:**
- Google Maps integration
- Courier assignment
- Real-time tracking
- Delivery confirmation
- Escrow release on confirmation

### Sprint 6 (Week 6): Chat, Reviews & Admin
**To Do:**
- Real-time chat implementation
- File/image sharing in chat
- Review submission form
- Admin dashboard UI
- Dispute management UI

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **Payments:** Paystack & Flutterwave
- **Maps:** Google Maps API (for location/routing)
- **File Storage:** Supabase Storage
- **Deployment:** Vercel (frontend) + Supabase (backend)

### Database Schema

#### Core Tables
1. **profiles** - User profiles with location
2. **seller_profiles** - Seller stores and verification
3. **categories** - Product categories
4. **products** - Product listings
5. **orders** - Order transactions
6. **order_items** - Order line items
7. **escrows** - Escrow holdings
8. **payments** - Payment records
9. **shipments** - Delivery tracking
10. **conversations** - Chat conversations
11. **messages** - Chat messages
12. **reviews** - Ratings and reviews
13. **notifications** - User notifications
14. **disputes** - Order disputes

See [API_SPEC.md](./API_SPEC.md) for complete API documentation.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are pre-configured in `.env`:
```
VITE_SUPABASE_URL=https://lcrjxbyuiousnpnveuue.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📱 Payment Integration

### Supported Payment Methods
- **MTN Mobile Money** (`mtn_momo`)
- **Vodafone Cash** (`vodafone_cash`)
- **AirtelTigo Money** (`airteltigo_money`)
- **Debit/Credit Cards** (`card`)

### Providers
- **Paystack** (Primary)
- **Flutterwave** (Secondary)

### Escrow Flow
1. Buyer places order
2. Buyer pays (funds held in escrow)
3. Seller ships product
4. Buyer confirms delivery
5. Funds released to seller

See implementation in:
- `src/lib/payment.ts` - Client-side payment utilities
- Edge Functions:
  - `payment-initiate` - Initialize payment
  - `payment-webhook` - Process payment callbacks
  - `escrow-release` - Release funds to seller

## 🗺️ Location Features

The platform uses browser geolocation for:
- Finding nearby products
- Distance-based filtering
- Delivery cost calculation
- Map-based product browsing

Default location (if permission denied): Accra, Ghana (5.6037, -0.1870)

## 💬 Real-time Features

### Chat System
- One-on-one buyer-seller messaging
- Image and file attachments
- Read receipts
- Order context

### Notifications
- Payment confirmations
- Order status updates
- New messages
- Delivery updates

## 🔐 Security

### Authentication
- JWT-based authentication
- Refresh token rotation
- Secure session management

### Row-Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access their own data
- Sellers can only manage their products
- Buyers can only view their orders
- Public data (products, stores) is accessible to all

### Payment Security
- Funds held in escrow
- Webhook signature verification
- Encrypted sensitive data
- PCI-compliant payment providers

## 📊 Admin Dashboard

Admins can:
- View all users, orders, and transactions
- Manage seller verifications
- Handle disputes
- Generate reports
- Freeze/unfreeze accounts
- View payment reconciliation

## 🧪 Testing

### Test Scenarios

1. **Registration & Onboarding**
   - Sign up as buyer
   - Sign up as seller
   - Complete profile

2. **Product Listing**
   - Create product with images
   - Update product details
   - Manage inventory

3. **Order Flow**
   - Search products
   - Add to cart
   - Checkout with Mobile Money
   - Track delivery
   - Confirm receipt

4. **Escrow & Payments**
   - Payment initiation
   - Webhook processing
   - Escrow holding
   - Fund release

5. **Chat & Reviews**
   - Message seller
   - Submit review
   - View ratings

## 🌍 Localization

Current: Ghana (GHS currency)

Ready for expansion:
- Nigeria (NGN)
- Kenya (KES)
- South Africa (ZAR)

## 📈 Performance Optimizations

- Image lazy loading
- Virtual scrolling for long lists
- Debounced search
- Optimistic UI updates
- Cached category data
- Indexed database queries

## 🐛 Known Limitations

1. **MVP Scope:**
   - No social feed (deferred to Phase 2)
   - Basic admin dashboard
   - Limited analytics
   - No multi-language support yet

2. **Payment:**
   - Test mode available for development
   - Production requires Paystack/Flutterwave account setup

3. **Maps:**
   - Requires Google Maps API key for production
   - Using basic location for MVP

## 🔮 Future Enhancements (Post-MVP)

### Phase 2
- Social feed with product videos
- In-app VoIP calls
- Advanced search filters
- Seller analytics dashboard
- Bulk product upload
- Multi-currency support

### Phase 3
- AI-powered product recommendations
- Chatbot support
- Dynamic pricing
- Logistics partner integration
- Buyer protection insurance
- Seller financing options

## 📞 Support & Contact

For technical issues or questions, refer to:
- [API Documentation](./API_SPEC.md)
- Database migrations in Supabase dashboard
- Edge Functions logs

## 📄 License

MIT License - See LICENSE file for details

---

## 🎨 Design System

### Colors
- Primary: Blue (#2563EB)
- Secondary: Gray (#6B7280)
- Accent: Amber (#F59E0B)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font Family: System fonts (Tailwind default)
- Headings: 120% line height
- Body: 150% line height

### Spacing
- 8px base unit
- Consistent padding/margins

### Components
- Rounded corners (0.5rem default)
- Subtle shadows
- Smooth transitions (200ms)
- Mobile-first responsive design

---

**Built with ❤️ for Ghana and Africa**
