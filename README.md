# ShopSwift 🛒

A full-stack e-commerce platform built with Node.js, Express, Prisma, PostgreSQL, and Next.js 14. Features real Stripe payments, JWT authentication with refresh token rotation, product search and filtering, Cloudinary image management, and an admin dashboard with live revenue charts.

---

## Test Accounts *(after seeding)*

| Role | Email | Password |
|---|---|---|
| Customer | customer@test.com | Password1! |
| Admin | admin@test.com | Password1! |

> To make a user an admin, run this in pgAdmin:
> ```sql
> UPDATE "User" SET role = 'Admin' WHERE email = 'your@email.com';
> ```

### Test Card (Stripe)

```
Card number:  4242 4242 4242 4242
Expiry:       Any future date
CVC:          Any 3 digits
```

---

## Tech Stack

**Backend**
- Runtime: Node.js 20 LTS
- Framework: Express.js + TypeScript
- ORM: Prisma 5
- Database: PostgreSQL 16
- Auth: JWT (access: 15 min) + refresh tokens (7 days, stored as SHA-256 hashes)
- Payments: Stripe PaymentIntents + Webhooks
- Images: Cloudinary
- Deployment: Railway

**Frontend**
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- State: Zustand
- Charts: Recharts
- Deployment: Vercel

---

## Features

- **Auth** — Register, login, logout with JWT access/refresh token rotation
- **Products** — Browse, search, filter by category and price range, sort
- **Cart** — Add, update, remove items; real-time stock validation
- **Checkout** — Stripe PaymentElement for secure card collection; webhook-driven order creation
- **Orders** — View order history with status tracking
- **Admin Panel** — Revenue charts (last 30 days), category breakdown, product CRUD, order status management, Cloudinary image upload

---

## Project Structure

```
shopswift/
├── shopswift-api/          # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── cart.controller.ts
│       │   ├── dashboard.controller.ts
│       │   ├── orders.controller.ts
│       │   ├── products.controller.ts
│       │   └── webhook.controller.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── cart.routes.ts
│       │   ├── categories.routes.ts
│       │   ├── dashboard.routes.ts
│       │   ├── orders.routes.ts
│       │   ├── products.routes.ts
│       │   └── webhook.routes.ts
│       ├── types/index.ts
│       ├── utils/
│       │   ├── jwt.ts
│       │   └── prisma.ts
│       └── index.ts
│
└── shopswift-frontend/     # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (admin)/admin/
        │   │   ├── dashboard/page.tsx
        │   │   ├── orders/page.tsx
        │   │   └── products/page.tsx
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── (store)/
        │       ├── checkout/
        │       ├── orders/
        │       └── products/
        ├── components/
        │   ├── AddToCartButton.tsx
        │   ├── AuthInitializer.tsx
        │   ├── CartDrawer.tsx
        │   ├── Navbar.tsx
        │   ├── ProductCard.tsx
        │   └── ProductFilters.tsx
        ├── lib/api.ts
        ├── store/
        │   ├── authStore.ts
        │   └── cartStore.ts
        └── types/index.ts
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns token pair |
| POST | `/api/auth/refresh` | — | Rotate refresh token |
| POST | `/api/auth/logout` | Bearer | Revoke refresh token |
| GET | `/api/auth/me` | Bearer | Get current user |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List with search, filter, pagination |
| GET | `/api/products/featured` | — | Up to 8 featured products |
| GET | `/api/products/:id` | — | Single product |
| GET | `/api/categories` | — | All categories with product counts |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |
| POST | `/api/products/:id/image` | Admin | Upload image to Cloudinary |

### Cart *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item (stock validated) |
| PATCH | `/api/cart/items/:id` | Update quantity |
| DELETE | `/api/cart/items/:id` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/create-payment-intent` | Bearer | Create Stripe PaymentIntent |
| GET | `/api/orders` | Bearer | My order history |
| GET | `/api/orders/:id` | Bearer | Single order |
| GET | `/api/orders/admin/all` | Admin | All orders (paginated) |
| PATCH | `/api/orders/admin/:id/status` | Admin | Update order status |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Revenue stats + recent orders |

### Webhooks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhooks/stripe` | Stripe `payment_intent.succeeded` handler |

**Query params for `GET /api/products`:**
`search`, `categoryId`, `minPrice`, `maxPrice`, `sort` (`newest` / `price_asc` / `price_desc` / `name_asc`), `page`, `pageSize`

---

## Database Schema

```
User ──< Order ──< OrderItem >── Product
User ──  Cart  ──< CartItem  >── Product
Product >── Category
User ──< RefreshToken
```

Key design decisions:
- `CartItem.priceAtAdding` and `OrderItem.unitPrice` snapshot the price at time of purchase so historical order totals are always accurate.
- Products are soft-deleted (`isActive: false`) to preserve order history referential integrity.
- Refresh tokens are stored as SHA-256 hashes — the raw token is never persisted.

---

## Stripe Payment Flow

```
1. User fills shipping form
2. Frontend → POST /api/orders/create-payment-intent
3. Backend validates cart stock, calls Stripe SDK, returns clientSecret
4. Stripe PaymentElement (iframe) collects card — your server never sees card data
5. User clicks Pay → Stripe processes the charge
6. Stripe → POST /api/webhooks/stripe (payment_intent.succeeded)
7. Backend verifies Stripe-Signature header
8. Prisma transaction:
   a. Create Order record
   b. Create OrderItem snapshots
   c. Decrement stock for each product
   d. Clear cart
```

---

## Local Setup

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 16 (running locally)
- Stripe CLI (for webhook testing)

### Backend

```bash
git clone https://github.com/YOUR_USERNAME/shopswift-api.git
cd shopswift-api
npm install
```

Create `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopswift?schema=public"
JWT_SECRET="your-super-secret-key-minimum-32-characters"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

```bash
# Create the database in pgAdmin, then:
npx prisma migrate dev
npm run db:seed      # Seeds 5 categories + 20 products
npm run dev          # http://localhost:5000
```

To test Stripe webhooks locally:
```bash
stripe login
stripe listen --forward-to http://localhost:5000/api/webhooks/stripe
# Copy the whsec_ secret into .env STRIPE_WEBHOOK_SECRET
```

### Frontend

```bash
git clone https://github.com/YOUR_USERNAME/shopswift-frontend.git
cd shopswift-frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

```bash
npm run dev    # http://localhost:3000
```

---

## Deployment

### Backend → Railway
1. Push repo to GitHub
2. Railway → New Project → Deploy from GitHub repo
3. Add a PostgreSQL database service in the Railway project
4. Set all environment variables in the Railway dashboard (see table below)
5. Run migrations: `railway run npx prisma migrate deploy`
6. Run seed: `railway run npx ts-node prisma/seed.ts`

### Frontend → Vercel
1. Push repo to GitHub
2. Vercel → New Project → Import repo
3. Set `NEXT_PUBLIC_API_URL` (your Railway API URL) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Stripe Webhook (production)
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://YOUR-API.railway.app/api/webhooks/stripe`
3. Event to listen for: `payment_intent.succeeded`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Railway

---

## Scripts

```bash
# Backend
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm run start        # Run compiled output
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio (localhost:5555)
npm run db:seed      # Seed categories and products

# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32 chars, keep secret |
| `JWT_EXPIRES_IN` | ✅ | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | ✅ | e.g. `7d` |
| `STRIPE_SECRET_KEY` | ✅ | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_...` from Stripe dashboard |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From Cloudinary dashboard |
| `FRONTEND_URL` | ✅ | CORS origin e.g. `https://yourapp.vercel.app` |
| `PORT` | — | Defaults to `5000` |
| `NODE_ENV` | — | `development` or `production` |

---

## License

MIT
