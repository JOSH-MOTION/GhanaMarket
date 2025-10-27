# Ghana Marketplace Platform - API Specification

## Overview
Complete REST API specification for the Ghana marketplace platform, including authentication, product management, orders, payments, escrow, delivery, chat, and admin operations.

**Base URL:** `https://lcrjxbyuiousnpnveuue.supabase.co`

**Authentication:** Bearer token in Authorization header

---

## Authentication Endpoints

### POST /auth/v1/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+233501234567"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-10-27T10:00:00Z"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 3600
  }
}
```

### POST /auth/v1/token?grant_type=password
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600,
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

---

## Profile & Seller Management

### GET /rest/v1/profiles?id=eq.{user_id}
Get user profile by ID.

**Response:**
```json
{
  "id": "uuid",
  "role": "buyer",
  "full_name": "John Doe",
  "phone": "+233501234567",
  "location_lat": 5.6037,
  "location_lon": -0.1870,
  "city": "Accra",
  "region": "Greater Accra",
  "created_at": "2025-10-27T10:00:00Z"
}
```

### POST /rest/v1/seller_profiles
Create seller store.

**Request Body:**
```json
{
  "user_id": "uuid",
  "store_name": "Tech Hub Ghana",
  "store_slug": "tech-hub-ghana",
  "bio": "Your one-stop shop for electronics",
  "logo_url": "https://example.com/logo.png",
  "business_doc_url": "https://example.com/registration.pdf"
}
```

### GET /rest/v1/seller_profiles?store_slug=eq.{slug}
Get seller store by slug.

**Response:**
```json
{
  "id": "uuid",
  "store_name": "Tech Hub Ghana",
  "store_slug": "tech-hub-ghana",
  "rating_avg": 4.5,
  "rating_count": 120,
  "total_sales": 450,
  "verification_status": "verified"
}
```

---

## Product Management

### POST /rest/v1/products
Create new product.

**Request Body:**
```json
{
  "seller_id": "uuid",
  "title": "iPhone 13 Pro Max",
  "description": "Brand new, sealed in box",
  "price": 4500,
  "currency": "GHS",
  "images": ["url1", "url2", "url3"],
  "video_url": "https://example.com/video.mp4",
  "category_id": "uuid",
  "stock_count": 5,
  "condition": "new",
  "tags": ["smartphone", "apple", "iphone"],
  "status": "active"
}
```

### GET /rest/v1/products?status=eq.active&order=created_at.desc
Get active products.

**Query Parameters:**
- `category_id=eq.{uuid}` - Filter by category
- `seller_id=eq.{uuid}` - Filter by seller
- `title=ilike.%{query}%` - Search by title
- `price=gte.{min}&price=lte.{max}` - Price range
- `limit={n}` - Limit results

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "iPhone 13 Pro Max",
    "price": 4500,
    "images": ["url1", "url2"],
    "condition": "new",
    "stock_count": 5,
    "view_count": 150,
    "seller_profiles": {
      "store_name": "Tech Hub Ghana",
      "rating_avg": 4.5
    }
  }
]
```

### GET /rest/v1/products?id=eq.{product_id}
Get product details.

### PATCH /rest/v1/products?id=eq.{product_id}
Update product.

---

## Order Management

### POST /rest/v1/orders
Create new order.

**Request Body:**
```json
{
  "order_number": "GHM-2025-001234",
  "buyer_id": "uuid",
  "seller_id": "uuid",
  "total_amount": 4500,
  "currency": "GHS",
  "delivery_method": "courier",
  "delivery_address": "123 Main St, Accra",
  "delivery_cost": 50,
  "notes": "Please call on arrival"
}
```

### POST /rest/v1/order_items
Add items to order.

**Request Body:**
```json
{
  "order_id": "uuid",
  "product_id": "uuid",
  "quantity": 1,
  "unit_price": 4500,
  "total_price": 4500,
  "product_snapshot": {
    "title": "iPhone 13 Pro Max",
    "images": ["url1"]
  }
}
```

### GET /rest/v1/orders?buyer_id=eq.{user_id}
Get buyer's orders.

**Response:**
```json
[
  {
    "id": "uuid",
    "order_number": "GHM-2025-001234",
    "total_amount": 4550,
    "status": "paid_in_escrow",
    "delivery_method": "courier",
    "created_at": "2025-10-27T10:00:00Z"
  }
]
```

### PATCH /rest/v1/orders?id=eq.{order_id}
Update order status.

**Request Body:**
```json
{
  "status": "shipped"
}
```

---

## Payment & Escrow

### POST /functions/v1/payment-initiate
Initialize payment (Mobile Money or Card).

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "uuid",
  "amount": 4550,
  "method": "mtn_momo",
  "provider": "paystack",
  "phoneNumber": "+233501234567",
  "email": "buyer@example.com",
  "metadata": {
    "buyer_name": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "uuid",
  "reference": "GHM-1730025600-abc123",
  "authorizationUrl": "https://checkout.paystack.com/xyz",
  "instructions": "Complete payment using your MTN Mobile Money account"
}
```

### POST /functions/v1/payment-webhook
Payment provider webhook (Paystack/Flutterwave).

**Headers:**
- `x-paystack-signature` (for Paystack)
- `verif-hash` (for Flutterwave)

**Request Body (Paystack):**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "GHM-1730025600-abc123",
    "amount": 455000,
    "status": "success"
  }
}
```

### POST /functions/v1/escrow-release
Release escrow funds to seller (buyer confirms delivery).

**Request Headers:**
```
Authorization: Bearer {buyer_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Escrow released successfully",
  "reference": "REL-1730025600-xyz789"
}
```

### GET /rest/v1/escrows?order_id=eq.{order_id}
Get escrow details.

**Response:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "amount": 4550,
  "status": "holding",
  "hold_until": "2025-11-10T10:00:00Z",
  "created_at": "2025-10-27T10:00:00Z"
}
```

---

## Delivery & Shipment

### POST /rest/v1/shipments
Create shipment.

**Request Body:**
```json
{
  "order_id": "uuid",
  "courier_name": "Express Delivery Ghana",
  "courier_phone": "+233201234567",
  "tracking_number": "EXP-GH-123456",
  "cost": 50,
  "eta_minutes": 180,
  "status": "assigned",
  "pickup_address": "Tech Hub Store, Accra",
  "delivery_address": "123 Main St, Accra",
  "pickup_lat": 5.6037,
  "pickup_lon": -0.1870,
  "delivery_lat": 5.6147,
  "delivery_lon": -0.1980
}
```

### PATCH /rest/v1/shipments?order_id=eq.{order_id}
Update shipment status.

**Request Body:**
```json
{
  "status": "in_transit"
}
```

### GET /rest/v1/shipments?order_id=eq.{order_id}
Get shipment details.

---

## Chat & Messaging

### POST /rest/v1/conversations
Create or get conversation.

**Request Body:**
```json
{
  "buyer_id": "uuid",
  "seller_id": "uuid",
  "order_id": "uuid"
}
```

### GET /rest/v1/conversations?buyer_id=eq.{user_id}
Get user's conversations.

### POST /rest/v1/messages
Send message.

**Request Body:**
```json
{
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "message_text": "Is this still available?",
  "attachments": ["https://example.com/image.jpg"]
}
```

### GET /rest/v1/messages?conversation_id=eq.{conv_id}&order=created_at.desc
Get conversation messages.

---

## Reviews & Ratings

### POST /rest/v1/reviews
Submit review.

**Request Body:**
```json
{
  "order_id": "uuid",
  "reviewer_id": "uuid",
  "seller_id": "uuid",
  "rating": 5,
  "review_text": "Excellent service and fast delivery!",
  "review_type": "seller"
}
```

### GET /rest/v1/reviews?seller_id=eq.{seller_id}
Get seller reviews.

---

## Notifications

### GET /rest/v1/notifications?user_id=eq.{user_id}&order=created_at.desc
Get user notifications.

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "payment_success",
    "title": "Payment Successful",
    "message": "Your payment of GHS 4550 has been received",
    "data": { "order_id": "uuid" },
    "read_at": null,
    "created_at": "2025-10-27T10:00:00Z"
  }
]
```

### PATCH /rest/v1/notifications?id=eq.{notif_id}
Mark notification as read.

**Request Body:**
```json
{
  "read_at": "2025-10-27T10:05:00Z"
}
```

---

## Disputes

### POST /rest/v1/disputes
Create dispute.

**Request Body:**
```json
{
  "order_id": "uuid",
  "raised_by": "uuid",
  "reason": "Item not as described",
  "evidence": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
}
```

### GET /rest/v1/disputes?order_id=eq.{order_id}
Get order disputes.

---

## Categories

### GET /rest/v1/categories?is.parent_id.null&order=display_order
Get top-level categories.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "slug": "electronics",
    "icon": "Smartphone",
    "display_order": 1
  }
]
```

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "error": "Missing required fields",
  "details": "Field 'phone' is required"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Pagination

Use Supabase range headers for pagination:

**Request Headers:**
```
Range: 0-49
```

**Response Headers:**
```
Content-Range: 0-49/200
```

---

## Real-time Subscriptions

Use Supabase Realtime for live updates:

```javascript
// Subscribe to new messages
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

---

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user
- Webhooks are exempt from rate limiting

---

## Payment Methods

**Supported Methods:**
- `mtn_momo` - MTN Mobile Money
- `vodafone_cash` - Vodafone Cash
- `airteltigo_money` - AirtelTigo Money
- `card` - Debit/Credit Card

**Supported Providers:**
- `paystack` - Paystack (recommended)
- `flutterwave` - Flutterwave

---

## Order Status Flow

```
created → paid_in_escrow → shipped → delivered → completed
                                                ↓
                                           disputed
                                                ↓
                                         resolved/refunded
```

## Escrow Status Flow

```
holding → released (to seller)
       → refunded (to buyer)
```
