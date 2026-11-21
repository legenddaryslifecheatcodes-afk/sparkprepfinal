// "First 10 authors" offer (Trey, 2026-11-21): Stripe live promotion code FIRST10FREE (coupon QRCN1LX1,
// $9.99 off once, 10 redemptions, ends 2026-12-31 PT) makes the every-page Advanced Audit free; we ask for an
// honest review in return. Shown only until the code expires. Remove when Stripe shows 10 redemptions.
export const FIRST10_CODE = "FIRST10FREE";
export const first10Active = () => Date.now() < Date.parse("2027-01-01T08:00:00Z");
