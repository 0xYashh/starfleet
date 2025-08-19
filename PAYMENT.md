# Dodo Payments – Production Checklist

> Keep this as the single source-of-truth before flipping the switch to **live mode**.

---

## 1. Environment
- Remove `environment: 'test_mode'` from `src/lib/dodopayments/client.ts`.
- Set **live** keys in `.env`:
  ```env
  DODO_PAYMENTS_API_KEY=sk_live_...
  DODO_WEBHOOK_SECRET=whsec_...
  ```

## 2. Auth guard in `/api/payments/create-link`
```ts
const { data:{ user } } = await createClient().auth.getUser();
if (!user) return NextResponse.json({ error:'unauthenticated'},{ status:401 });
```
Metadata already stores `user_id` + `shipData`.

## 3. Hard checks in `/api/payments/finalize`
```ts
if (payment.total_amount !== 200) return err('wrong-amount');
if (
  payment.product_cart?.length !== 1 ||
  payment.product_cart[0].product_id !== PAID_SPACESHIP_PRODUCT_ID
) return err('wrong-product');
```

## 4. Webhook security
- Keep webhook endpoint; verify with `DODO_WEBHOOK_SECRET`.
- Wrap logic in try/catch; always return 200 to avoid red spam in ngrok.
- (Optional) Move ship-deployment back into webhook for tamper-proof flow.

## 5. Supabase
- RLS: only row owner (`user_id`) can insert/see their ships.

## 6. Dashboard
- Product price set to **$2.00**.
- Return URL: `https://yourdomain.com/payment/success`.
- Webhook URL: `https://yourdomain.com/api/payments/webhook`.

---
*With these safeguards only a verified $2 payment for the correct product can create a spaceship for the authenticated user.*


