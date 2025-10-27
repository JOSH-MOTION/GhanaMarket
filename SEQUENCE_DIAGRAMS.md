# Sequence Diagrams - Key Flows

## 1. User Registration & Onboarding

```
Buyer/Seller          Frontend              Supabase Auth        Database
    |                    |                        |                  |
    |--[Fill signup]--->|                        |                  |
    |                    |--[signUp(email)]--->  |                  |
    |                    |                        |--[Create user]-->|
    |                    |                        |<--[User ID]------|
    |                    |<--[Success + token]---|                  |
    |                    |                                           |
    |                    |--[Create profile]----------------------->|
    |                    |   {id, role, name, phone}                |
    |                    |<--[Profile created]----------------------|
    |                    |                                           |
    |<--[Redirect to    |                                           |
    |    home/dashboard]|                                           |
```

---

## 2. Seller Store Creation

```
Seller              Frontend            Database          Storage
  |                    |                   |                |
  |--[Store details]-->|                   |                |
  |   {name, bio}      |                   |                |
  |                    |                   |                |
  |--[Upload logo]---->|                   |                |
  |                    |--[Upload file]------------------>|
  |                    |<--[File URL]---------------------|
  |                    |                                   |
  |--[Business doc]--->|                   |                |
  |                    |--[Upload file]------------------>|
  |                    |<--[File URL]---------------------|
  |                    |                                   |
  |                    |--[Create store]->|                |
  |                    |   {user_id,      |                |
  |                    |    store_name,   |                |
  |                    |    logo_url,     |                |
  |                    |    doc_url}      |                |
  |                    |<--[Store ID]-----|                |
  |                    |                                   |
  |<--[Store created]--|                                   |
  |   verification:    |                                   |
  |   pending          |                                   |
```

---

## 3. Product Creation & Listing

```
Seller          Frontend         Storage         Database
  |                |                |                |
  |--[Product     |                |                |
  |   details]--->|                |                |
  |               |                |                |
  |--[Upload      |                |                |
  |   images]---->|--[Upload]---->|                |
  |               |<--[URLs]------|                |
  |               |                |                |
  |--[Upload      |                |                |
  |   video]----->|--[Upload]---->|                |
  |               |<--[URL]-------|                |
  |               |                                 |
  |               |--[Create product]------------->|
  |               |   {seller_id, title,           |
  |               |    price, images[],            |
  |               |    video_url, category}        |
  |               |<--[Product ID]-----------------|
  |               |                                 |
  |<--[Product    |                                 |
  |   listed]-----|                                 |
```

---

## 4. Location-Based Product Discovery

```
Buyer           Frontend         Geolocation       Database
  |                |                  |                |
  |--[Open app]--->|                  |                |
  |                |--[Get location]->|                |
  |                |<--[Lat, Lon]-----|                |
  |                |                                    |
  |                |--[Query products]---------------->|
  |                |   WHERE status='active'           |
  |                |   ORDER BY distance               |
  |                |<--[Products near you]-------------|
  |                |                                    |
  |--[Filter by   |                                    |
  |   category]-->|                                    |
  |                |--[Query products]---------------->|
  |                |   WHERE category_id=X             |
  |                |<--[Filtered products]-------------|
  |                |                                    |
  |<--[Display    |                                    |
  |   results]----|                                    |
```

---

## 5. Complete Checkout with Escrow Flow

```
Buyer         Frontend    Order API   Payment API   Escrow API   Seller
  |              |            |            |            |           |
  |--[Checkout]->|            |            |            |           |
  |              |--[Create]->|            |            |           |
  |              |   order    |            |            |           |
  |              |<--[Order]--|            |            |           |
  |              |   ID       |            |            |           |
  |              |                         |            |           |
  |--[Select     |                         |            |           |
  |   MTN MoMo]->|                         |            |           |
  |              |--[Initiate]------------>|            |           |
  |              |   payment               |            |           |
  |              |<--[Auth URL]------------|            |           |
  |              |   + reference           |            |           |
  |              |                         |            |           |
  |<--[Redirect  |                         |            |           |
  |   to MoMo]---|                         |            |           |
  |              |                         |            |           |
  |--[Complete   |                         |            |           |
  |   payment]---|------[Webhook]--------->|            |           |
  |              |      from Paystack      |            |           |
  |              |                         |            |           |
  |              |                         |--[Update]->|           |
  |              |                         |  payment   |           |
  |              |                         |  status    |           |
  |              |                         |            |           |
  |              |                         |--[Create]->|           |
  |              |                         |  escrow    |           |
  |              |                         |  holding   |           |
  |              |                         |            |           |
  |              |                         |--[Update   |           |
  |              |                         |   order]-->|           |
  |              |                         | paid_in    |           |
  |              |                         | _escrow    |           |
  |              |                         |            |           |
  |              |<--[Notification:        |            |           |
  |                  Payment successful]   |            |           |
  |              |                         |            |           |
  |              |-----[Notification: New order]------->|           |
  |              |                         |            |---------->|
```

---

## 6. Delivery & Shipment Tracking

```
Seller        Frontend    Shipment API   Maps API    Buyer
  |              |             |            |          |
  |--[Mark as   |             |            |          |
  |   shipped]->|             |            |          |
  |              |--[Create]-->|            |          |
  |              |  shipment   |            |          |
  |              |<--[Ship ID]-|            |          |
  |              |                          |          |
  |              |--[Get route]------------>|          |
  |              |  {pickup, delivery}      |          |
  |              |<--[Route + ETA]----------|          |
  |              |                          |          |
  |              |-----[Notification: Order shipped]-->|
  |              |                          |          |
  |              |                                     |
  |              |<--[Track shipment]------------------|
  |              |                                     |
  |              |--[Get status]-->|                   |
  |              |<--[In transit]--|                   |
  |              |                                     |
  |              |-----[Real-time location updates]--->|
  |              |                                     |
  |              |<--[Confirm delivery]----------------|
  |              |                                     |
  |              |--[Update]----->|                    |
  |              |  status:       |                    |
  |              |  delivered     |                    |
```

---

## 7. Escrow Release on Delivery Confirmation

```
Buyer        Frontend    Escrow API   Payment Provider   Seller
  |             |            |                |             |
  |--[Confirm  |            |                |             |
  |   delivery]|            |                |             |
  |----------->|            |                |             |
  |            |            |                |             |
  |            |--[Verify   |                |             |
  |            |   order    |                |             |
  |            |   status]->|                |             |
  |            |<--[OK:     |                |             |
  |            |   delivered]                |             |
  |            |            |                |             |
  |            |--[Release  |                |             |
  |            |   escrow]->|                |             |
  |            |            |                |             |
  |            |            |--[Transfer]--->|             |
  |            |            |   funds to     |             |
  |            |            |   seller       |             |
  |            |            |<--[Ref #]------|             |
  |            |            |                |             |
  |            |            |--[Update       |             |
  |            |            |   escrow:      |             |
  |            |            |   released]    |             |
  |            |            |                |             |
  |            |            |--[Update order:|             |
  |            |            |   completed]   |             |
  |            |            |                |             |
  |            |<--[Success]|                |             |
  |            |   + ref    |                |             |
  |            |                                           |
  |            |-----[Notification: Funds released]------>|
  |            |                                           |
  |<--[Order   |                                           |
  |   complete]|                                           |
```

---

## 8. Real-time Chat Flow

```
Buyer          Frontend      Supabase Realtime    Database    Seller
  |               |                  |                |           |
  |--[Open chat]->|                  |                |           |
  |               |--[Subscribe]---->|                |           |
  |               |   to messages    |                |           |
  |               |                  |                |           |
  |--[Send msg]-->|                  |                |           |
  |               |--[Insert]--------|--------------->|           |
  |               |   message        |                |           |
  |               |                  |                |           |
  |               |                  |<--[Broadcast]--|           |
  |               |                  |   new message  |           |
  |               |<--[Real-time]----|                |           |
  |               |   update         |                |           |
  |               |                                               |
  |               |-----[Push notification: New message]--------->|
  |               |                                               |
  |               |                  |<--[Seller subscribes]------|
  |               |                  |                            |
  |               |<--[Seller reply]----------[Insert]------------|
  |               |                  |   message                  |
  |               |                  |                            |
  |<--[Display    |<--[Real-time]----|                            |
  |   reply]------|   update         |                            |
```

---

## 9. Dispute & Resolution Flow

```
Buyer       Frontend    Dispute API   Admin Dashboard   Escrow API
  |            |             |                |              |
  |--[Raise   |             |                |              |
  |   dispute]|             |                |              |
  |---------->|             |                |              |
  |           |--[Create]-->|                |              |
  |           |  dispute    |                |              |
  |           |  {order_id, |                |              |
  |           |   reason,   |                |              |
  |           |   evidence} |                |              |
  |           |<--[Dispute]-|                |              |
  |           |   ID        |                |              |
  |           |                              |              |
  |           |-------[Notification]-------->|              |
  |           |       to Admin               |              |
  |           |                              |              |
  |           |                              |--[Review     |
  |           |                              |   evidence]  |
  |           |                              |              |
  |           |                              |--[Decision:  |
  |           |                              |   refund]    |
  |           |                              |              |
  |           |                              |--[Refund]--->|
  |           |                              |   escrow     |
  |           |                              |<--[Success]--|
  |           |                              |              |
  |           |<--[Notification: Dispute resolved]          |
  |<--[Refund |   + refund                  |              |
  |   issued]-|                              |              |
```

---

## 10. Admin Verification Flow

```
Admin        Dashboard    Seller API    Notification API   Seller
  |              |            |                |              |
  |--[Review    |            |                |              |
  |   pending   |            |                |              |
  |   sellers]->|            |                |              |
  |             |--[Get]---->|                |              |
  |             |   pending  |                |              |
  |             |<--[List]---|                |              |
  |             |                             |              |
  |--[Verify   |                             |              |
  |   document]|                             |              |
  |----------->|                             |              |
  |            |                             |              |
  |--[Approve  |                             |              |
  |   seller]->|                             |              |
  |            |--[Update]->|                |              |
  |            | verification                |              |
  |            | status:     |                |              |
  |            | verified    |                |              |
  |            |<--[Success]                 |              |
  |            |                             |              |
  |            |-----[Send notification]---->|              |
  |            |                             |------------->|
  |            |                             |   "Store     |
  |            |                             |   verified"  |
```

---

## Payment Provider Integration Details

### Paystack Mobile Money Flow
```
1. Frontend → payment-initiate Edge Function
2. Edge Function → Paystack API (initialize transaction)
3. Paystack → Return authorization URL
4. Frontend → Redirect user to Paystack
5. User → Complete MoMo payment
6. Paystack → Webhook to payment-webhook Edge Function
7. Edge Function → Verify signature
8. Edge Function → Update payment & create escrow
9. Edge Function → Send notifications
```

### Flutterwave Mobile Money Flow
```
1. Frontend → payment-initiate Edge Function
2. Edge Function → Flutterwave API (initialize payment)
3. Flutterwave → Return payment link
4. Frontend → Redirect user to Flutterwave
5. User → Complete MoMo payment
6. Flutterwave → Webhook to payment-webhook Edge Function
7. Edge Function → Verify hash
8. Edge Function → Update payment & create escrow
9. Edge Function → Send notifications
```

---

## Database Transaction Patterns

### Order Creation with Items
```sql
BEGIN;
  -- Create order
  INSERT INTO orders (...) RETURNING id;

  -- Create order items
  INSERT INTO order_items (...);

  -- Update product stock
  UPDATE products SET stock_count = stock_count - quantity;
COMMIT;
```

### Escrow Release
```sql
BEGIN;
  -- Update escrow status
  UPDATE escrows SET status = 'released', released_at = NOW();

  -- Update order status
  UPDATE orders SET status = 'completed';

  -- Update seller stats
  UPDATE seller_profiles SET total_sales = total_sales + 1;

  -- Create notifications
  INSERT INTO notifications (...);
COMMIT;
```

---

## Real-time Event Subscriptions

### Frontend Subscriptions
```javascript
// New messages
supabase.channel('messages')
  .on('postgres_changes',
    { event: 'INSERT', table: 'messages' },
    handleNewMessage
  )
  .subscribe();

// Order updates
supabase.channel('orders')
  .on('postgres_changes',
    { event: 'UPDATE', table: 'orders', filter: `buyer_id=eq.${userId}` },
    handleOrderUpdate
  )
  .subscribe();

// Notifications
supabase.channel('notifications')
  .on('postgres_changes',
    { event: 'INSERT', table: 'notifications', filter: `user_id=eq.${userId}` },
    handleNotification
  )
  .subscribe();
```
