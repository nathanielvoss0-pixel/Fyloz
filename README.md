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
- Caps output dimensions at 12,000 px per side and 20 million pixels total to reduce browser-memory risk.

### 3. Convert image
- URL: `/convert-image/`
- Converts between JPG, PNG, and WebP locally in the browser.
- Includes an adjustable quality control for JPG and WebP.
- Preserves transparency in PNG and WebP; fills transparent areas with white for JPG.
- Limits conversion output to 20 million pixels to reduce browser-memory risk.

### 4. Rotate and flip image
- URL: `/edit-image/`
- Rotate left or right in 90-degree steps and flip horizontally or vertically.
- Preview changes and export a new JPG, PNG, or WebP copy.
- Keeps the original file unchanged and caps input/output at 20 million pixels.

### 5. Add text watermark
- URL: `/watermark-image/`
- Add custom text with adjustable color, opacity, size, and one of five positions.
- Preview and export JPG, PNG, or WebP locally in the browser.
- Limits images to 12,000 px per side and 20 million pixels total.

### 6. PDF tools
- URL: `/pdf-tools/`
- Merge multiple PDFs, extract pages, delete pages, split by page ranges, reorder pages, rotate pages, add page numbers or text watermarks, extract selectable text to TXT, re-save a PDF, convert images to PDF, and export PDF pages as PNG/JPG/WebP.
- Uses PDF-Lib and PDF.js loaded from public CDNs; selected document files are processed in the browser.
- PDF re-saving does not guarantee a smaller file. Page rendering is limited to 100 pages per run.

## Static deployment

The site is served by BusyBox `httpd` inside Docker. Deplexo builds from the repository's `Dockerfile` and serves port 8080. Keep the `COPY` entries in the Dockerfile aligned with public pages and SEO files.

## Files

- `index.html`, `styles.css`, `app.js`: homepage and image compression tool.
- `resize-image/index.html`, `resize-image/resize.js`: image resize tool.
- `convert-image/index.html`, `convert-image/convert.js`: image format converter.
- `edit-image/index.html`, `edit-image/edit.js`: rotate and flip tool.
- `watermark-image/index.html`, `watermark-image/watermark.js`: text watermark tool.
- `privacy.html`, `terms.html`, `contact.html`: policy and contact pages.
- `sitemap.xml`, `robots.txt`: crawl configuration.
- `favicon.svg`: lightweight browser tab icon.
- Public pages include canonical URLs and social sharing metadata; tool pages also include structured data.

## Before public launch

- Test all six tool pages, including the PDF toolkit in desktop and mobile browsers with JPG, PNG transparency, WebP, very large images, malformed files, unsupported formats, and extreme dimensions.
- Verify that downloaded files open and that the resize tool preserves aspect ratio when selected.
- Check keyboard navigation, status messages, and small-screen layout.
- Confirm the final production domain before using canonical URLs or submitting the sitemap.
- Review privacy and terms before adding analytics or advertising.
- Measure actual impressions, clicks, and successful tool usage before forecasting revenue.

## Product direction

The goal is to add tools gradually using a shared visual style and reusable patterns. New tools should only be added after their output is tested and their target search intent has been researched. Avoid mass-producing pages that merely swap a number in the title; every indexed page should solve a distinct task and provide genuinely useful information.
