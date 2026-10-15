# Fyloz

Fyloz is a lightweight, browser-based collection of image tools. Image processing happens locally in the visitor's browser; the tools do not upload selected image files to a Fyloz application server.

## Current tools

### 1. Compress image
- Accepts JPG, PNG, and WebP images up to 20 MB through the file picker or drag and drop.
- Lets the user set a target output size in KB, with presets for 50, 100, 200, and 500 KB.
- Tries lower JPEG quality and, when needed, smaller dimensions.
- Shows a preview, original/output sizes, and a download link.
- Exports JPEG; transparent areas are filled with white.

### 2. Resize image
- URL: `/resize-image/`
- Accepts JPG, PNG, and WebP images up to 20 MB.
- Sets exact width and height in pixels, with an option to preserve aspect ratio.
- Supports drag-and-drop file selection.
- Exports JPG, PNG, or WebP and provides a preview and download.
- Caps output dimensions at 12,000 px per side and 40 million pixels total to reduce browser-memory risk.

## Static deployment

The site is served by BusyBox `httpd` inside Docker. Deplexo builds from the repository's `Dockerfile` and serves port 8080. Keep the `COPY` entries in the Dockerfile aligned with public pages and SEO files.

## Files

- `index.html`, `styles.css`, `app.js`: homepage and image compression tool.
- `resize-image/index.html`, `resize-image/resize.js`: image resize tool.
- `privacy.html`, `terms.html`, `contact.html`: policy and contact pages.
- `sitemap.xml`, `robots.txt`: crawl configuration.
- `favicon.svg`: lightweight browser tab icon.
- Public pages include canonical URLs and social sharing metadata; tool pages also include structured data.

## Before public launch

- Test both tools in desktop and mobile browsers with JPG, PNG transparency, WebP, very large images, malformed files, unsupported formats, and extreme dimensions.
- Verify that downloaded files open and that the resize tool preserves aspect ratio when selected.
- Check keyboard navigation, status messages, and small-screen layout.
- Confirm the final production domain before using canonical URLs or submitting the sitemap.
- Review privacy and terms before adding analytics or advertising.
- Measure actual impressions, clicks, and successful tool usage before forecasting revenue.

## Product direction

The goal is to add tools gradually using a shared visual style and reusable patterns. New tools should only be added after their output is tested and their target search intent has been researched. Avoid mass-producing pages that merely swap a number in the title; every indexed page should solve a distinct task and provide genuinely useful information.
