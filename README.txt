BoatWorks Pro — Fast, Reusable Production Build

Structure:
- index.html
- styles.css
- assets/
  - app-icon.png
  - responsive WebP screenshot assets at 480px and 900px widths

Performance changes:
- Images are no longer embedded as base64 inside HTML.
- WebP dramatically reduces screenshot size.
- Responsive srcset lets phones download smaller 480px files.
- Lower-page images use loading="lazy".
- Hero images are preloaded/eager for fast first paint.
- Browser/CDN can cache styles.css and each image independently across visits.

Official support email:
crew@boatworks-pro.com

Remaining launch item:
- Replace the “Coming to the App Store” elements with the live App Store link at launch.

Current public endpoints:
- Support currently uses the official crew@boatworks-pro.com email address.
- Privacy is published at privacy.html.
