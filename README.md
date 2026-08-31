# Robert Evan's Plumbing & Electrician — Django API + React PWA

A split-stack rebuild of the site: **Django REST Framework** as a pure JSON
API backend, and a **React (Vite) Progressive Web App** frontend that talks
to it. Because it's a PWA, a visitor can install it straight from the
browser — "Add to Home Screen" on mobile, or the install icon in the address
bar on desktop Chrome/Edge — and it opens like a native app icon from then
on, with push notifications working the same way.

```
plumbing_platform/
  backend/     Django + DRF + SimpleJWT — the API, port 8000
  frontend/    React + Vite + a hand-written service worker — port 5173
```

## Quick start (development)

**1. Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # this account = Robert / staff = the admin inbox
python manage.py runserver
```

This serves the API at `http://localhost:8000/api/...` and the Django admin
at `http://localhost:8000/admin/`.

**2. Frontend** (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies every `/api/*`
request to Django (see `vite.config.js`), so the browser only ever talks to
one origin — no CORS setup needed for local dev.

- Register a normal account → lands on `/dashboard` (the customer thread).
- Log in with the superuser account → lands on `/admin` (Robert's inbox),
  since any `is_staff=True` account is treated as staff.

## Installing it as an app

Once `npm run dev` (or a production build) is running:
- **Desktop Chrome/Edge**: an install icon appears in the address bar —
  clicking it installs the app in its own window, with its own icon.
- **Android Chrome**: "Add to Home Screen" from the browser menu.
- **iOS Safari**: Share → "Add to Home Screen" (iOS only supports push
  notifications for Home Screen–installed PWAs, iOS 16.4+).

This works because of `frontend/public/manifest.json` (name, icons, "standalone"
display mode) plus the registered service worker (`frontend/public/sw.js`) —
both are required by browsers before they'll offer the install prompt.

## Push notifications

Same mechanism as before: a real, working VAPID key pair is already
generated and committed (`backend/vapid_private_key.pem`, matching public
key in `backend/config/settings.py`), so push works immediately in dev.

- The frontend calls `enablePushNotifications()` (see `src/registerPush.js`)
  from the "Enable alerts" banner on the customer dashboard — it asks for
  notification permission, subscribes via the service worker, and posts the
  subscription to `/api/push/subscribe/`.
- When a customer messages, the backend notifies every staff account; when
  staff reply, it notifies that customer — see `backend/messaging/push.py`
  and the two dashboard views that call `notify_user()`.
- Browsers don't allow a site to supply a custom notification sound — but
  since notifications aren't marked `silent`, the OS plays its normal
  notification sound automatically, same as a native app.
- For production: generate your own key pair, keep the private key off of
  version control, and serve over HTTPS (push requires it — `localhost` is
  exempt, which is why dev works without it).
  ```bash
  openssl ecparam -genkey -name prime256v1 -noout -out vapid_private_key.pem
  openssl ec -in vapid_private_key.pem -pubout -outform DER | tail -c 65 | base64 | tr -d '=' | tr '/+' '_-'
  ```
  Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY_PATH`, and `VAPID_CLAIMS_EMAIL`
  as environment variables.

## Authentication

JWT via `djangorestframework-simplejwt`: `/api/auth/register/` and
`/api/auth/login/` both return `{access, refresh, user}`. The frontend
stores both tokens in `localStorage` (see `src/api.js`) and silently
refreshes the access token on a 401. This is the common, straightforward
approach for an SPA; for extra hardening in production, consider moving to
an httpOnly-cookie-based refresh flow instead, since anything in
`localStorage` is reachable by injected JavaScript (XSS) — Django's default
templating/CSP protections don't apply the same way to a separately-hosted
SPA, so keep that in mind for anything handling sensitive data.

## API summary

| Method | Path | Who | What |
|---|---|---|---|
| POST | `/api/auth/register/` | anyone | create account, returns tokens + user |
| POST | `/api/auth/login/` | anyone | returns `{access, refresh}` |
| POST | `/api/auth/refresh/` | anyone with a refresh token | new access token |
| GET | `/api/auth/me/` | logged in | current user (incl. `is_staff`) |
| GET | `/api/business/` | anyone | marketing copy: services, steps, reviews, FAQs |
| GET/POST | `/api/conversations/me/` | customer | fetch / start their own thread |
| POST | `/api/conversations/me/messages/` | customer | reply in their own thread |
| GET | `/api/conversations/` | staff | inbox list, `?q=` search |
| GET/POST | `/api/conversations/<id>/` | staff | read / reply to any thread |
| POST | `/api/push/subscribe/` | logged in | register a device for push |
| POST | `/api/push/unsubscribe/` | logged in | remove a device |
| GET | `/api/push/vapid-public-key/` | anyone | the public key the frontend subscribes with |

## What I could and couldn't verify

I don't have network access in the environment I built this in, so I
couldn't run `pip install`, `npm install`, `vite build`, or `python manage.py
runserver` to click through it myself. What I *could* do, and did:

- Every backend `.py` file passes `python -m py_compile` (syntax-valid).
- Every frontend `.jsx`/`.js` file passes an `esbuild --jsx=automatic`
  parse (catches JSX/JS syntax errors, though not type or import mistakes).
- Cross-checked that every field name the React pages read
  (`conversation.topic_display`, `c.unread_count`, etc.) matches what the
  DRF serializers actually output.
- The VAPID key pair is real and verified — I decoded the public key and
  confirmed it mathematically matches the private key on file.

What this *doesn't* catch: dependency-resolution issues, version
mismatches between packages, or runtime bugs that only show up once real
data flows through the app. Please run through `npm install && npm run dev`
and `pip install -r requirements.txt && python manage.py runserver`
locally, end to end, before relying on this — a from-scratch full-stack
build like this genuinely needs that pass.

## Deploying (brief notes)

- `cd frontend && npm run build` produces static files in `frontend/dist/`.
  Serve them from any static host (Netlify, Vercel, S3+CloudFront, or
  Django + WhiteNoise) — just make sure `manifest.json`, `sw.js`, and the
  `icons/` folder are served from the site root, not nested under `/static/`.
  Push and PWA installability both require the whole thing served over HTTPS.
- Point `VITE_API_URL` (build-time) at your deployed API origin, and add
  that frontend origin to `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`.
- Swap SQLite for Postgres via `DATABASES` in `backend/config/settings.py`
  for anything beyond local development.
