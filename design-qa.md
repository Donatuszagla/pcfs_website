# PCFS design QA

Approved source: `design/approved-homepage.png` — first homepage direction with the third direction’s white, airy header.

## Acceptance matrix

| Area | Desktop | Tablet | Mobile | Notes |
| --- | --- | --- | --- | --- |
| Header | passed | passed | passed | Third-direction white header, active state, contact action and accessible drawer verified |
| Hero | passed | passed | passed | Congregation image, royal-blue field, title hierarchy and paired actions match the selected direction |
| RFMC feature | passed | passed | passed | Badge, theme, date and event photography preserve the approved proportions |
| Mandate and pillars | passed | passed | passed | Two-column composition and five-icon row collapse cleanly without overflow |
| Preview cards | passed | passed | passed | Leadership, media and branch cards match the approved three-column structure |
| Closing invitation/footer | passed | passed | passed | Contrast, spacing, calls to action and footer hierarchy verified |
| Functional journeys | passed | passed | passed | Routes, drawer, media search, SSR metadata, structured data and 404 status verified |

## Difference log

The approved image and a 1440 px production-render capture were inspected together in `design/homepage-comparison.png`. No P0–P2 visual differences remain. The implementation intentionally adds the specified production footer below the closing invitation. Generated imagery, logo and unapproved real-world details remain explicitly temporary.

Browser checks also covered a 390 px mobile viewport, the responsive admin login, client-side route metadata, RFMC Event structured data, canonical URL changes, console output, and horizontal overflow. Console errors: none.

Follow-up hero QA: replaced the fixed-width blue overlay that produced a vertical seam with a continuous left-to-right photographic color falloff. Desktop and mobile captures are recorded in `design/hero-after-fix.png` and `design/hero-after-fix-mobile.png`; the mobile treatment remains an even overlay with no boundary.

final result: passed
