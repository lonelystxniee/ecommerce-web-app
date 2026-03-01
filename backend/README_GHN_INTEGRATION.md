# GHN Integration - Backend Guide

This document explains how to configure, run, test and verify the GHN shipping integration added to this project.

1) Required env variables

- `GHN_API_BASE` - GHN base URL (default example: `https://dev-online-gateway.ghn.vn/shiip/public-api`)
- `GHN_TOKEN` - GHN token for API auth
- `GHN_SHOP_ID` - GHN shop id (used for fee/create calls)
- `GHN_ENV` - optional (development/production)
- Optional shop origin (used when server builds payload automatically):
  - `GHN_SHOP_DISTRICT_ID`
  - `GHN_SHOP_WARD_CODE`
  - `GHN_FROM_ADDRESS`

Also standard app env:
- `PORT`, `MONGO_URI` etc.

2) Install & run

```bash
cd backend
npm install
cp .env.example .env   # edit .env with real values
npm run dev
```

3) Endpoints added

- `GET /api/locations/provinces` - list provinces
- `GET /api/locations/districts?provinceId=` - list districts
- `GET /api/locations/wards?districtId=` - list wards
- `POST /api/shipping/calculate` - body: `{ to_district_id, to_ward_code, weight, length?, width?, height? }` - returns fee
- `POST /api/orders/create` - existing order create; can include `shippingInfo` to auto-calc fee
- `POST /api/shipping/create` - create GHN order. Accepts `{ ghnBody }` OR `{ orderId }` (server will build payload from Order and env).
- `GET /api/shipping/detail?order_code=...` - GHN detail proxy
- `POST /api/shipping/webhook` - webhook receiver (updates `Order.shipping.shippingStatus` and events)
- `GET /api/orders/:id` - get single order
- `GET /api/orders` - list orders (admin)

4) Testing the flow

- Create an order from frontend `/checkout` (ensure shippingInfo selected), or POST to `/api/orders/create`.
- Visit `/admin/orders` in frontend and click "Gửi GHN" to call `/api/shipping/create` for that order.
- Inspect the order with `GET /api/orders/:id` to see `shipping.ghnOrderCode` and `shipping.shippingFee`.
- Alternatively, call `/api/shipping/create` with a manual `ghnBody` matching GHN docs.

5) Webhook

- Expose `POST /api/shipping/webhook` publicly and set as GHN webhook URL in GHN admin panel.
- The webhook handler currently looks for `order_code` in payload and updates order by `shipping.ghnOrderCode`.
- For production, enable verification by checking GHN headers or a secret.

6) Tests

- A minimal Jest scaffold exists. Run `npm test` in `backend` to run the basic test that asserts `ghnService` methods exist.
- To add integration tests, mock GHN calls with `nock` or `jest-fetch-mock` and assert controller behavior.

7) Next improvements

- Harden webhook verification and mapping of GHN status codes -> app statuses.
- Add retry/backoff and persistent logging (winston) for production.
- Add label printing and cancellation endpoints integration.
- Add unit/integration tests covering `shippingController` and `orderController`.

If you want, I can: add webhook verification, create richer tests (mocking GHN), or add label printing support next.
