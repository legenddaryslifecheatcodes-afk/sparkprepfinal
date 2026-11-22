// 72-hour $10-off book offer (Trey, 2026-11-22, "All three" first-sale push): Stripe live promotion code
// BOOK10 (promo_1UeUstLjIYDPBBToVBFZt7RM on coupon xIZcbqqz, $10 off once, minimum $20 order so it only
// works on a book, never the $9.99 membership or the audits). Real deadline, same in Stripe and here:
// Tue Nov 24 2026, 11:59 PM Pacific. Book checkout only shows the code box when no audit credit is applied.
export const BOOK10_CODE = "BOOK10";
export const BOOK10_ENDS = Date.parse("2026-11-25T07:59:00Z");
export const BOOK10_ENDS_LABEL = "Tuesday, Nov 24 at 11:59 PM Pacific";
export const book10Active = (now = Date.now()) => now < BOOK10_ENDS;
export const BOOK10_OFF_CENTS = 1000;
