# Buzz Spot: confirmation emails

The website can't send email by itself: sending needs a secret key, and a key placed in a public page could be copied and abused. These two files add sending to the Cloudflare Worker from `availo-near-me.zip`. When the site runs on that Worker, every booking emails the student. The email includes the room, building, floor, date, time, room type, a **Confirm and check in** link and a **Cancel this reservation** link.

## Files

- `send-confirmation.mjs` handles `POST /api/send-confirmation` and sends the email through [Resend](https://resend.com).
- `build.mjs` is the zip's `scripts/build.mjs` with the email route added.

## Setup (about 15 minutes)

1. In the `availo-near-me` project:
   - copy `send-confirmation.mjs` into `worker/`
   - replace `scripts/build.mjs` with this `build.mjs`
   - copy this repo's `index.html` to `web/index.html`
2. Create a free Resend account and verify a sending domain you own. Resend only sends from verified domains.
3. Store the API key as a Worker secret. It never goes in the HTML or in git:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
4. Set the sender address as a Worker variable named `EMAIL_FROM`, for example `Buzz Spot <bookings@yourdomain.com>`. You can set it in the Cloudflare dashboard (Worker → Settings → Variables) or in `wrangler.toml`.
5. Build and deploy:
   ```bash
   npm run build
   ```
   ```bash
   npm run deploy
   ```

The page calls `api/send-confirmation` automatically whenever it's served over http(s). When the HTML is opened as a local file, or before the key is set, the page shows the email on screen instead and says that delivery isn't connected.

## Safety limits built in

- It only sends to `@gatech.edu` addresses.
- It only accepts requests coming from your own site.
- The server writes the email itself, so a caller can't inject their own HTML or links.
- All links point back to your site.

Before real launch, add sign-in on the server and per-user rate limits (for example with Cloudflare Rate Limiting). Otherwise anyone who finds the endpoint could trigger emails to GT addresses.

## Limit: bookings are stored per browser

Bookings are saved in the browser of the device where they were made, so check-in and cancel links only work on that same device. Shared bookings, and cancelling from any device, need a database on the server (for example Cloudflare D1).
