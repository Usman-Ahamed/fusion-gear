# Fusion Gear Reviews

Customer reviews site for [Fusion Gear](https://fusiongear.lk), live at **https://reviews.fusiongear.lk**.

Next.js 16 (App Router) · MongoDB Atlas · Cloudinary · Tailwind CSS 4 · hosted on Vercel.

## Run locally

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
npm run seed                 # create the admin / reset its password (see DEPLOY.md)
```

## Where things live

| Path | What |
|---|---|
| `src/config/site.js` | Public numbers (Google rating, jerseys delivered), links, review categories |
| `src/lib/reviews.js` | All public review queries (cached; refreshed when an admin changes a review) |
| `src/app/reviews/page.js` | Reviews page, server-rendered, with filters in the URL |
| `src/app/submit-review/` | Review form |
| `src/app/api/reviews/` | Submission, moderation and bulk-upload APIs |
| `src/lib/auth.js`, `src/proxy.js` | Admin sessions and the `/admin` gate |
| `src/lib/images.js` | Upload checks, re-encoding (strips EXIF/GPS), Cloudinary upload |

Deployment and domain setup: see [DEPLOY.md](DEPLOY.md).
