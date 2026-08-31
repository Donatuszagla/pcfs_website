# PCFS administrator guide

## Login and access

Open the administration URL and sign in with an account created by a Super Administrator. Never share accounts. The available sections depend on the role assigned to the account.

- Super Administrator: all content, settings, enquiries and user management.
- Content Administrator: pages, branches, leaders, ministries and enquiries.
- Media Manager: media items, categories, galleries and assets.
- Event Manager: events, registration links, speakers and event assets.

## Editing and publishing

1. Choose a content section in the left navigation.
2. Select an existing record or choose **Create new**.
3. Edit the structured record data and choose **Save draft**.
4. Review the public result before choosing **Publish**.
5. Choose **Archive** to remove a record from public queries without permanently deleting it.

Slugs form public URLs and must be unique. Do not change a published slug without planning redirects. Rich-text page sections use allowlisted structured JSON; scripts and arbitrary markup are not accepted.

## Events

Maintain the title, slug, theme, description, start/end timestamps, venue, speaker list, registration URL, image, SEO data and featured setting. Verify that external registration links use HTTPS and belong to an approved provider.

## Media

Choose the correct media type and category, add the approved speaker and description, and provide an approved external provider URL. Upload a real thumbnail with meaningful alt text. Do not upload copyrighted material without permission.

## Branches and leaders

Confirm branch service times, telephone number, map/directions link and location with church leadership before publishing. Leader portraits and biographies require explicit approval; the seeded system intentionally uses no fabricated likenesses.

## Enquiries

Contact submissions appear under **Enquiries** after server validation and CAPTCHA verification. The record is saved before email is sent. When notification status is **FAILED**, open the record and use **Retry email** after the SMTP issue is resolved. Do not expose private enquiry data outside authorised church administration.

## Assets

Uploaded images must be JPEG, PNG or WebP, no larger than 10 MB, and include alt text. The backend creates responsive WebP variants automatically. Archive outdated assets only after confirming they are no longer referenced.
