# Production handover checklist

- [ ] Replace the temporary logo with official PCFS logo files.
- [ ] Replace all generated church, event, teaching and branch photography with authorised PCFS assets.
- [ ] Add approved leader portraits and biographies; no likenesses were fabricated.
- [ ] Confirm branch locations, service times, telephone numbers and map links.
- [ ] Confirm official email addresses and social network URLs.
- [ ] Confirm RFMC 2026 dates, times, registration URL, venue and speaker naming.
- [ ] Resolve the source document’s “Mpintsin/Mptsin” inconsistency; seeded content uses **Mpintsin**.
- [ ] Have privacy and website terms reviewed for the production jurisdiction.
- [ ] Configure production Turnstile, SMTP, HTTPS origins, access secrets and MinIO credentials.
- [ ] Apply a private-write/public-read or signed-URL bucket policy appropriate to the deployment.
- [ ] Run all lint, type-check, test and build commands in all three applications.
- [ ] Complete the Docker smoke test and one backup/restore rehearsal.
- [ ] Review `design-qa.md` and repeat visual QA after official assets are inserted.
