export const adminStats = [
  { label: "Total members", value: "1,284", detail: "All accounts across free, paid, and legacy imports", tone: "info" },
  { label: "Paid members", value: "438", detail: "Self-serve, done-with-you, and legacy paid", tone: "ready" },
  { label: "Free scan users", value: "706", detail: "Users with scan access but no paid entitlement", tone: "unlock" },
  { label: "Imported legacy users", value: "312", detail: "Previous Verge Five users pending final mapping", tone: "info" },
  { label: "New purchases", value: "24", detail: "Placeholder count for the last 7 days", tone: "ready" },
  { label: "Failed payments", value: "9", detail: "Needs Stripe webhook review after wiring", tone: "flagged" },
  { label: "Recent scans", value: "87", detail: "Business Visibility Scans run or rerun", tone: "info" },
  { label: "Open support requests", value: "16", detail: "New and pending help requests", tone: "unlock" },
  { label: "Emails sent", value: "1,952", detail: "Template and access emails after migration", tone: "ready" },
  { label: "System alerts", value: "3", detail: "Missing bindings and migration checkpoints", tone: "flagged" },
];

export const memberRows = [
  { name: "Maria Johnson", email: "maria@example.com", business: "Riverside Hauling LLC", access: "self_serve", billing: "active_subscription", source: "New platform", lastSeen: "Today" },
  { name: "Legacy Owner", email: "legacy@example.com", business: "Legacy Supply Co", access: "legacy_imported", billing: "legacy_imported", source: "Imported", lastSeen: "Pending invite" },
  { name: "Free Scan User", email: "scan-user@example.com", business: "Bright Start Cleaning", access: "free", billing: "none", source: "Free scan", lastSeen: "Yesterday" },
];

export const purchaseRows = [
  { customer: "Maria Johnson", product: "Self-Serve yearly", amount: "$297", status: "paid", provider: "Stripe test", date: "Jun 28, 2026" },
  { customer: "Andre Miles", product: "Done-With-You", amount: "$997", status: "pending review", provider: "Stripe test", date: "Jun 27, 2026" },
  { customer: "Free Scan User", product: "Self-Serve monthly", amount: "$29", status: "failed", provider: "Stripe test", date: "Jun 26, 2026" },
];

export const scanRows = [
  { business: "Riverside Hauling LLC", score: "56/100", label: "Fair", source: "public-search", generated: "12 minutes ago" },
  { business: "Legacy Supply Co", score: "72/100", label: "Good", source: "saved audit", generated: "2 days ago" },
  { business: "Bright Start Cleaning", score: "48/100", label: "Needs work", source: "entered-signals", generated: "5 days ago" },
];

export const supportRows = [
  { member: "Maria Johnson", type: "Get help", severity: "Normal", status: "open", age: "2h" },
  { member: "Legacy Owner", type: "Access issue", severity: "High", status: "pending", age: "1d" },
  { member: "Free Scan User", type: "Report a problem", severity: "Normal", status: "new", age: "3d" },
];

export const emailRows = [
  { name: "Welcome email", category: "onboarding", status: "draft", lastUpdated: "Needs migration" },
  { name: "Access invite", category: "membership", status: "active placeholder", lastUpdated: "From old backend" },
  { name: "Legacy test drive", category: "campaign", status: "active placeholder", lastUpdated: "From legacy campaigns" },
  { name: "Billing failed", category: "billing", status: "draft", lastUpdated: "Needs Stripe trigger" },
];

export const catalogRows = [
  { name: "Crown Office Supplies", category: "vendor_net30", tier: "ready", unlock: "Starter profile" },
  { name: "Capital One Spark", category: "credit_card", tier: "unlock_next", unlock: "Phone and bank-rating fixes" },
  { name: "Funding readiness path", category: "funding", tier: "unlock_next", unlock: "Business plan and bank signal" },
];

export const systemRows = [
  { item: "Admin shell", status: "layout created", detail: "Separate from member platform shell" },
  { item: "Imported users", status: "not wired", detail: "Waiting for data migration prompt" },
  { item: "Stripe", status: "test mode only", detail: "No live payment actions on layout pass" },
  { item: "Email provider", status: "not wired", detail: "Resend/env setup pending" },
  { item: "Scan providers", status: "not wired here", detail: "Existing endpoint inventory complete" },
];
