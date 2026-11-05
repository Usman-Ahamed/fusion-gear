# Deploying reviews.fusiongear.lk

The reviews site runs on **Vercel**, the same project that serves `fusion-gear.vercel.app` today. The main store (`fusiongear.lk`) and the order tracker (`track.fusiongear.lk`) stay on A2 Hosting. You only add one DNS record there.

Why Vercel and not A2 Hosting: the site has a server part (admin login, review uploads, database). Vercel runs it with free SSL, global caching and no server maintenance. On A2 Hosting it would need a Node.js app, which you would have to keep running and updating yourself.

Plan for about 30 minutes. DNS can take up to a few hours to reach everyone, but usually takes under 15 minutes.

---

## 1. Change the admin password (do this first)

The old password was visible in the public GitHub repo, so treat it as known to anyone.

1. Open `.env.local` on your computer and set:
   ```
   ADMIN_EMAIL=fusiongear.lk@gmail.com
   ADMIN_PASSWORD=<a new password, 12+ characters, not used anywhere else>
   ```
2. In the project folder, run:
   ```
   npm run seed
   ```
   It prints `Password reset for ... All sessions signed out.`
3. Delete the `ADMIN_PASSWORD=` line from `.env.local` again.
4. Change that old password anywhere else you used it (email, hosting, etc.).

## 2. Set environment variables in Vercel

Vercel → your project → **Settings → Environment Variables**. Add these for **Production** (and Preview if you use it). `.env.example` lists every variable.

| Name | Value |
|---|---|
| `MONGODB_URI` | Same as now |
| `JWT_SECRET` | Same as now (32+ characters). To sign everyone out, generate a new one: `openssl rand -base64 48` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Same as now |
| `NEXT_PUBLIC_SITE_URL` | `https://reviews.fusiongear.lk` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | e.g. `94771234567` (no + or spaces) |
| `NEXT_PUBLIC_GOOGLE_REVIEWS_URL` | Optional. Link to your Google reviews, makes "4.8 Google rating" clickable |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Optional, recommended. See step 6 |
| `REDIRECT_VERCEL_DOMAIN` | `false` for now. Step 5 turns it on |

You can delete `NEXT_PUBLIC_APP_URL`. It is no longer used.

## 3. Deploy

Merge the `rebuild` branch into `main` and push. Vercel deploys automatically. Then check that `https://fusion-gear.vercel.app/reviews` loads and that you can log in at `/admin/login`.

## 4. Connect reviews.fusiongear.lk

**In Vercel:**
1. Project → **Settings → Domains → Add** → type `reviews.fusiongear.lk` → Add.
2. Vercel shows a **CNAME** record to create. Copy the exact value it gives you. It looks like `cname.vercel-dns.com` or `xxxxxxxx.vercel-dns-017.com`.

**In A2 Hosting (cPanel):**
1. Log in to cPanel → **Domains → Zone Editor**.
2. Next to `fusiongear.lk`, click **+ CNAME Record**.
3. Fill in:
   - **Name:** `reviews` (cPanel may show it as `reviews.fusiongear.lk.`, which is fine)
   - **Record / Target:** the value Vercel showed you
   - **TTL:** leave the default
4. Save.

> ⚠️ Do **not** create `reviews` under cPanel → *Domains → Create a New Domain / Subdomains*. That adds an A record pointing at A2 Hosting, which would conflict with the CNAME. Don't touch the existing records for `fusiongear.lk`, `www` or `track`.

**Back in Vercel:** the domain changes to **Valid Configuration** within a few minutes, and Vercel issues the SSL certificate automatically. Open `https://reviews.fusiongear.lk` and you should see the padlock.

To check from a terminal: `dig +short CNAME reviews.fusiongear.lk` should print the Vercel value.

## 5. Forward old links (bio links, stories, QR codes)

Do this only after step 4 works.

1. Vercel → Settings → Environment Variables → set `REDIRECT_VERCEL_DOMAIN` to `true`.
2. Vercel → Deployments → latest → **⋯ → Redeploy**.

Now every `fusion-gear.vercel.app/...` link permanently forwards to the same page on `reviews.fusiongear.lk`. For example, `/reviews` goes to `https://reviews.fusiongear.lk/reviews`. Old `/products` links go to the shop on fusiongear.lk.

Then update your Instagram, TikTok and Facebook bio links to `https://reviews.fusiongear.lk`.

## 6. Spam protection with Cloudflare Turnstile (recommended, free)

1. Create a free account at <https://dash.cloudflare.com> → **Turnstile → Add widget**.
2. Hostname: `reviews.fusiongear.lk` (add `localhost` too if you want it working locally). Mode: **Managed**.
3. Copy the **Site key** into `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret key** into `TURNSTILE_SECRET_KEY` in Vercel, then redeploy.

Without these keys, the form still has a hidden honeypot field and a limit of 3 reviews per day per connection.

## 7. Google

1. Go to <https://search.google.com/search-console> → **Add property** → *URL prefix* → `https://reviews.fusiongear.lk`. Verify with the **HTML tag** method: send me the tag, or add it to `metadata.verification` in `src/app/layout.js`.
2. **Sitemaps** → submit `sitemap.xml`.
3. Optional: link to `https://reviews.fusiongear.lk` from the fusiongear.lk footer or menu ("Customer reviews"). That's the best way to get it found.

---

## Everyday admin

- **Admin:** `https://reviews.fusiongear.lk/admin/login`. It isn't linked anywhere on the site, so bookmark it. Sessions last 12 hours. Five wrong passwords lock the login for 15 minutes.
- **New customer reviews** land under **Reviews → Pending**. Nothing goes live until you click Approve.
- **Verified buyer:** if a customer entered an Order ID, the review shows it with a link to the tracker. Check it on track.fusiongear.lk, then tick **Verified buyer**.
- **Screenshots of customer messages:** use **Bulk Upload**. They go live straight away, without star ratings.
- **Changing numbers** (Google rating, jerseys delivered, tagline): edit `src/config/site.js`, commit and push.
- **Locked out / forgot the password:** repeat step 1.

## Rollback

Vercel → Deployments → choose the previous working deployment → **⋯ → Promote to Production**. It takes effect instantly. DNS doesn't need to change.
