# Fyloz

Fyloz is a browser-first image compression tool for people who need to meet a file-size limit, such as 100 KB, before uploading a photo to a form.

## Current features

- Select JPG, PNG, or WebP images up to 20 MB.
- Choose a maximum output size in KB, with quick presets for 50, 100, 200, and 500 KB.
- Compress locally in the browser by adjusting JPEG quality and, when needed, image dimensions.
- Preview the output, inspect the before/after file sizes, and download the JPEG.
- No account required; the selected image is not uploaded by the compression tool.
- Responsive layout and basic privacy, terms, and contact pages.

## Important behavior

- Output format is JPEG. Transparent areas in PNG or WebP inputs are filled with white.
- Compression can reduce visual quality and resolution. Users should inspect the preview before using the result.
- Very small target sizes may not be achievable for every image. The tool should report failure rather than claim a file is within the limit when it is not.
- The current deployment uses a lightweight BusyBox HTTP server in a Docker container.

## Before public launch

- Test target-size guarantees across different images and browsers, including tiny targets, large dimensions, transparency, and malformed files.
- Verify mobile layout, keyboard navigation, screen-reader status updates, and download behavior.
- Confirm the final production domain before adding canonical URLs, robots directives, and sitemap entries.
- Review privacy and terms pages before adding analytics or advertising.
- Measure real impressions, clicks, and successful tool use before making revenue forecasts.

## Product direction

The broad “compress image to 100 KB” niche is crowded. Fyloz should differentiate through reliable output-size reporting, clear handling of transparency, accessibility, and verified real-world upload requirements. Future tools such as exact pixel dimensions or country-specific photo specifications should only be added when the requirements can be verified from authoritative sources.

## SEO principle

Each indexed landing page should solve a distinct user task with a working tool and genuinely useful information. Avoid mass-produced pages that merely swap a number in the title.

## References

- Google Search Central — [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Competitive examples: [PhotoToKB](https://phototokb.com/) and [KBSize](https://kbsize.com/compress-image-to-100kb/)
