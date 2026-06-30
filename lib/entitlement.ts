export type Entitlement =
  | "free"
  | "self_serve"
  | "done_with_you"
  | "legacy_imported"
  | "comped"
  | "expired";

export const entitlementValues: Entitlement[] = [
  "free",
  "self_serve",
  "done_with_you",
  "legacy_imported",
  "comped",
  "expired",
];
