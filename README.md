# Image Hosting

A fast, minimal image hosting web app. Drop in an image, get direct, display and viewer links in seconds. Built with Next.js, React and Tailwind CSS, and powered by the [imgBB](https://api.imgbb.com/) upload API.

> **Heads up:** uploads are sent with `expiration=15552000`, so every image is **automatically deleted after 180 days**. See [Changing the expiry time](#changing-the-expiry-time) to change this.

---

## Table of contents

1. [Features](#features)
2. [Quick start](#quick-start)
3. [Configuration](#configuration)
4. [User guide](#user-guide)
5. [API reference](#api-reference)
6. [Project structure](#project-structure)
7. [Deployment](#deployment)
8. [Security notes](#security-notes)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Features

- Drag and drop, or pick a file from your device
- Instant preview before uploading
- Result card with a large preview, success badge, file size, resolution, upload time and expiry time
- One-click copy for the **direct**, **display**, **viewer** and **delete** links
- **Open image** button
- Recent uploads list, stored in your browser only
- Light and dark mode (follows your system, with a manual toggle)
- Responsive layout from 320px phones to 1440px desktops, with no horizontal scrolling
- Clear error messages for invalid files, network failures, timeouts and API errors
- Keyboard accessible, with visible focus and screen-reader friendly toasts
- The imgBB API key stays on the server and is never sent to the browser

## Quick start

**Requirements:** Node.js 20+ and [pnpm](https://pnpm.io/).

```bash
# 1. Install dependencies
pnpm install

# 2. Create your environment file
cp .env.example .env.local
#    then open .env.local and set IMGBB_API_KEY

# 3. Start the dev server
pnpm dev
```

Open <http://localhost:3000>.

For a production build:

```bash
pnpm build
pnpm start
```

## Configuration

All configuration is done with environment variables. Put them in `.env.local` for local development, or in your host's environment settings when deployed.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `IMGBB_API_KEY` | Yes | none | Your imgBB API key. Get one at <https://api.imgbb.com/>. |
| `IMGBB_EXPIRATION` | No | `600` | Seconds until an uploaded image is auto-deleted. imgBB accepts 60 to 15552000. |

`.env.local` is gitignored. Never commit your real key, and never put it in a component or a `NEXT_PUBLIC_` variable.

### Changing the expiry time

Set `IMGBB_EXPIRATION` to the number of seconds you want, then restart the server.

| Want | Value |
| --- | --- |
| 10 minutes (default) | `600` |
| 1 hour | `3600` |
| 1 day | `86400` |
| 1 week | `604800` |

The homepage text says "Links expire after 10 minutes". If you change the value, update that sentence in `app/page.tsx`.

## User guide

### Upload an image

1. Open the app.
2. Drag an image onto the drop zone, or click it (or press Enter/Space when it is focused) to browse your files.
3. Check the preview. Choose **Remove** if it is the wrong file.
4. Choose **Upload image**. A spinner shows while it uploads.
5. The result card appears with your links.

**Supported formats:** JPG, PNG, GIF, WEBP, BMP, AVIF
**Maximum size:** 10 MB per image

### Use the result card

| Item | What it is |
| --- | --- |
| Direct link | The raw image file URL. Use it in `<img>` tags, Markdown, forums or chat. |
| Display link | imgBB's display version of the image. |
| Viewer link | A web page on imgBB that shows the image. Good for sharing with people. |
| Copy delete link | Copies a private imgBB URL. Open it later to delete the image before it expires. Keep it secret. |
| Open image | Opens the direct link in a new tab. |
| Size, resolution, uploaded, expires | Details returned by imgBB. |

Tip: the copy buttons show a checkmark and a toast when the copy succeeds.

### Embed an image

```html
<img src="PASTE_DIRECT_LINK_HERE" alt="Description" />
```

```markdown
![Description](PASTE_DIRECT_LINK_HERE)
```

### Recent uploads

The **Recent uploads** section lists your last 50 uploads, with thumbnails, size, time, and quick **Copy** and **Open** actions.

- History is saved in your browser's local storage. It is not synced between devices and disappears if you clear site data.
- Removing an item (the X button) or choosing **Clear all** only removes it from this list. It does **not** delete the hosted image. Use the delete link for that.
- Items past their expiry time are marked **Expired** and their links are hidden.

### Dark mode

The app follows your system setting on first visit. Use the sun/moon button in the header to switch. Your choice is remembered.

## API reference

The app exposes one internal endpoint that the UI uses. You can also call it from your own scripts.

### `POST /api/upload`

Uploads one image to imgBB. The server adds the API key and expiration for you.

**Request:** `multipart/form-data` with one field, `image`.

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@/path/to/photo.jpg"
```

**Success (200):** the imgBB response, plus the applied `expiration` in seconds.

```json
{
  "data": {
    "id": "2ndCYJK",
    "title": "photo",
    "url_viewer": "https://ibb.co/2ndCYJK",
    "url": "https://i.ibb.co/.../photo.jpg",
    "display_url": "https://i.ibb.co/.../photo.jpg",
    "width": 1920,
    "height": 1080,
    "size": 245812,
    "time": "1727510000",
    "delete_url": "https://ibb.co/2ndCYJK/...",
    "image": { "filename": "photo.jpg", "url": "https://i.ibb.co/.../photo.jpg" }
  },
  "success": true,
  "status": 200,
  "expiration": 600
}
```

**Errors:** `{ "success": false, "error": "message" }`

| Status | Meaning |
| --- | --- |
| 400 | Missing, empty, unsupported or too-large file (over 10 MB) |
| 503 | `IMGBB_API_KEY` is not set on the server |
| 4xx | imgBB rejected the request (message passed through) |
| 502 | imgBB returned an unexpected error |
| 504 | Timed out (45 seconds) or could not reach imgBB |

### Underlying imgBB call

```bash
curl --location --request POST "https://api.imgbb.com/1/upload?expiration=600&key=YOUR_API_KEY" \
  --form "image=@file"
```

## Project structure

```
app/
  api/upload/route.ts   Server route that proxies uploads to imgBB
  layout.tsx            Fonts, metadata, theme bootstrap script
  page.tsx              Main page
  globals.css           Design tokens (light/dark), buttons, utilities
components/
  uploader.tsx          Drop zone, file picker, preview, upload logic
  result-card.tsx       Post-upload result card
  copy-field.tsx        Copy-to-clipboard field and hook (with fallback)
  history.tsx           Recent uploads list
  toast.tsx             Toast provider (aria-live)
  theme-toggle.tsx      Light/dark switch
hooks/
  use-history.ts        localStorage-backed upload history
lib/
  image.ts              Types, validation, formatting, imgBB response mapping
public/
  icon.svg              Favicon
```

### Customizing

- **Colors and theme:** edit the CSS variables at the top of `app/globals.css`.
- **App name:** change `APP_NAME` in `lib/image.ts` and the strings in `app/layout.tsx`.
- **File limits or formats:** edit `MAX_SIZE` and `ACCEPTED_TYPES` in `lib/image.ts`. They are used by both the browser and the server. imgBB's own limit is 32 MB.

## Deployment

### Vercel

1. Push the project to a Git repository and import it in Vercel.
2. In **Project Settings, Environment Variables**, add `IMGBB_API_KEY` (and optionally `IMGBB_EXPIRATION`).
3. Deploy.

Note: hosts with small request-body limits (for example, serverless plans capped at 4.5 MB) will reject larger images before they reach the route. If you need the full 10 MB, use a plan or host that allows it, or lower `MAX_SIZE`.

### Any Node host

```bash
pnpm build
IMGBB_API_KEY=your_key pnpm start
```

## Security notes

- The API key is only read on the server, in `app/api/upload/route.ts`.
- Do not commit `.env.local`. If a key is ever shared or leaked, generate a new one at <https://api.imgbb.com/> and update your environment.
- The upload endpoint has no login or rate limiting. If you deploy publicly, consider adding rate limiting (for example, at your host or with a middleware) so others can't use up your imgBB quota.
- Delete links let anyone who has them delete the image. Treat them like passwords.
- Uploaded images are hosted by imgBB, subject to their terms. Do not upload content you don't have the right to share.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Uploads are not configured" | `IMGBB_API_KEY` is missing. Add it to `.env.local` and restart `pnpm dev`. |
| imgBB says the key is invalid | Check for typos or extra spaces. Generate a new key if needed. |
| "Unsupported file" | Use JPG, PNG, GIF, WEBP, BMP or AVIF. SVG is not supported by imgBB. |
| "File is too large" | The limit is 10 MB. Compress or resize the image. |
| "Network error" | Check your internet connection and try again. |
| "The upload timed out" | The connection is slow or imgBB is busy. Try again or use a smaller file. |
| Image link stopped working | It expired. Raise `IMGBB_EXPIRATION` for longer-lived links. |
| Copy button does nothing | Some browsers block clipboard access on non-HTTPS pages. Use HTTPS or `localhost`. |
| Recent uploads disappeared | Browser data was cleared, or you are on another browser or device. |
| Form field not picking the same file twice | Fixed in this version. Pull the latest code if you still see it. |

## FAQ

**Do I need an account?**
No account is needed to use the app. You only need an imgBB API key to run your own copy.

**Where are my images stored?**
On imgBB's servers. This app does not store image files.

**Can I keep images forever?**
imgBB supports images with no expiration. To do this, remove the `expiration` parameter in `app/api/upload/route.ts` and update the notice text on the homepage.

**Can I delete an image early?**
Yes. Use **Copy delete link** on the result card and open that link in your browser.

**Is my upload history private?**
It lives only in your browser's local storage. Anyone with access to your browser profile can see it.

**Can I upload several images at once?**
Not yet. The uploader handles one image at a time.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, lucide-react icons, Manrope font, imgBB API.
