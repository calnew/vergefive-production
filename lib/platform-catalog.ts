export type CatalogTone = "ready" | "review" | "locked";

export type FixPlaybook = {
  key: string;
  phase: string;
  module: string;
  title: string;
  shortTitle: string;
  route: string;
  scanFinding: string;
  whatToFix: string[];
  doFirst: string[];
  setupOptions: string[];
  proof: string[];
  unlocks: string[];
  training: string;
};

export type FixModule = {
  phase: string;
  module: string;
  summary: string;
  keys: string[];
};

export type AccountCatalogItem = {
  name: string;
  group: string;
  type: string;
  requirements: string[];
  recommended: string[];
  fixKeys: string[];
  timing: string;
  why: string;
  applyHref: string;
  gradient: string;
};

export const canonicalFixOrder = ["phones", "address", "website", "email", "llc", "ein", "bank", "bank-rating", "criteria", "net30"];

// The member-facing fix list groups the eleven fixes into three phases.
// The "website" row carries the "email" issue key (one website + domain-email
// signal); the seven-module, five-phase view lives in programModules below.
export type FixListItem = { key: string; title: string; tagline: string; defaultSeverity: "high" | "med" | "low" };
export type FixListPhase = { phase: string; title: string; items: FixListItem[] };

export const fixListPhases: FixListPhase[] = [
  {
    phase: "Phase 1",
    title: "Foundation",
    items: [
      { key: "nap", title: "NAP Consistency Overview", tagline: "Name, address, and phone â€” one exact identity everywhere.", defaultSeverity: "med" },
      { key: "phones", title: "Phone & 411 Fix", tagline: "Business line, caller ID, and public 411 listing.", defaultSeverity: "high" },
      { key: "address", title: "Business Address Fix", tagline: "One address format across records, website, and bank.", defaultSeverity: "high" },
      { key: "website", title: "Website & Domain Email Fix", tagline: "Live domain, matching site details, and domain email.", defaultSeverity: "high" },
    ],
  },
  {
    phase: "Phase 2",
    title: "Legal & Banking",
    items: [
      { key: "llc", title: "Entity Type & Legal Name", tagline: "Entity type, legal name, and state record match.", defaultSeverity: "high" },
      { key: "sos", title: "State Record Check", tagline: "State record active and consistent with public identity.", defaultSeverity: "med" },
      { key: "ein", title: "EIN Identity Match", tagline: "EIN tied to the same legal business identity.", defaultSeverity: "high" },
      { key: "bank", title: "Business Bank Account", tagline: "Business checking that matches the company identity.", defaultSeverity: "high" },
      { key: "bank-rating", title: "Bank Rating", tagline: "Balance pattern and banking habits before applications.", defaultSeverity: "med" },
    ],
  },
  {
    phase: "Phase 3",
    title: "Credit Readiness",
    items: [
      { key: "criteria", title: "12-Point Readiness Criteria", tagline: "The full readiness check before broader applications.", defaultSeverity: "med" },
      { key: "net30", title: "Starter Vendor Readiness", tagline: "Starter vendor selection once the foundation is ready.", defaultSeverity: "med" },
    ],
  },
];

export const fixModules: FixModule[] = [
  {
    phase: "Phase 1",
    module: "Business Identity",
    summary: "Phone, 411, address, website, and domain email signals vendors compare first.",
    keys: ["phones", "address", "website", "email"],
  },
  {
    phase: "Phase 2",
    module: "Legal Setup",
    summary: "Entity type, legal name, state records, EIN, and IRS proof alignment.",
    keys: ["llc", "ein"],
  },
  {
    phase: "Phase 3",
    module: "Banking Foundation",
    summary: "Business bank account setup, profile consistency, and bank-rating habits.",
    keys: ["bank", "bank-rating"],
  },
  {
    phase: "Phase 4",
    module: "Approval Readiness",
    summary: "Business credit criteria, bureau/profile checks, and application timing.",
    keys: ["criteria"],
  },
  {
    phase: "Phase 5",
    module: "Starter Vendor Credit",
    summary: "Net 30 readiness and vendor category selection before applications.",
    keys: ["net30"],
  },
];

export const fixPlaybooks: Record<string, FixPlaybook> = {
  phones: {
    key: "phones",
    phase: "Phase 1",
    module: "Business Identity",
    title: "Phone & 411 Fix",
    shortTitle: "Phone signal",
    route: "/phones-and-411/",
    scanFinding: "The business phone signal must look like a real business line and be consistent across public records before account applications.",
    whatToFix: ["Dedicated business phone number", "Caller ID/business name match", "Public 411 or business directory listing", "Same number on website, bank, and applications"],
    doFirst: ["Pick the primary business number.", "Set the caller ID to the public business name.", "Add or verify a public business listing.", "Update every application/profile with the same number."],
    setupOptions: ["TurnCom360", "RingCentral", "Grasshopper"],
    proof: ["Phone account screenshot", "Caller ID/business name screenshot", "Directory/411 listing screenshot", "Website contact page with matching phone"],
    unlocks: ["Starter Net 30 vendors", "Fleet/fuel account readiness", "Higher-trust vendor verification", "Cleaner business identity review"],
    training: "Compact lesson: why phone type, caller ID, and directory consistency matter before vendor applications.",
  },
  address: {
    key: "address",
    phase: "Phase 1",
    module: "Business Identity",
    title: "Business Address Fix",
    shortTitle: "Address consistency",
    route: "/business-address/",
    scanFinding: "The business address should match across website, public records, bank records, and account applications.",
    whatToFix: ["One exact address format", "Commercial/business-appropriate address use", "Website and directory consistency", "Bank and vendor application consistency"],
    doFirst: ["Choose the exact address format.", "Update the website/contact profile.", "Match state, bank, and vendor profiles.", "Save proof before applying."],
    setupOptions: ["Regus", "Davinci", "Alliance Virtual Offices"],
    proof: ["Website contact screenshot", "State/business profile record", "Bank profile or application screenshot", "Directory listing screenshot"],
    unlocks: ["Grainger-style vendor reviews", "Home improvement/project accounts", "Business bank and bureau profile consistency"],
    training: "Compact lesson: why mailbox, home, and inconsistent address signals can slow underwriting.",
  },
  website: {
    key: "website",
    phase: "Phase 1",
    module: "Business Identity",
    title: "Website & Domain Fix",
    shortTitle: "Website/domain",
    route: "/website-domain-email/",
    scanFinding: "The business needs a credible website/domain signal that matches the company identity.",
    whatToFix: ["Active business domain", "Website with matching name, address, and phone", "Contact page", "Professional public presence"],
    doFirst: ["Confirm the domain is active.", "Add business identity details to the site.", "Make the contact page match records.", "Keep the site live before applications."],
    setupOptions: ["TurnCom360", "Wix", "Webflow"],
    proof: ["Homepage screenshot", "Contact page screenshot", "Domain/DNS screenshot", "Business profile screenshot"],
    unlocks: ["Quill and Staples-style reviews", "Technology vendors", "Credit card readiness checks"],
    training: "Compact lesson: how a real web presence supports automated verification.",
  },
  email: {
    key: "email",
    phase: "Phase 1",
    module: "Business Identity",
    title: "Domain Email Fix",
    shortTitle: "Domain email",
    route: "/website-domain-email/",
    scanFinding: "The primary contact email should use the business domain instead of a free mailbox.",
    whatToFix: ["Domain email address", "Email shown on website/contact profiles", "Application contact email consistency", "Free email kept only as backup"],
    doFirst: ["Create a domain email account.", "Put it on the website contact page.", "Update vendor/bank profiles.", "Save proof before applying."],
    setupOptions: ["TurnCom360", "Google Workspace", "Microsoft 365"],
    proof: ["Domain email inbox screenshot", "Website contact page screenshot", "Updated business profile screenshot"],
    unlocks: ["Website/domain-dependent vendors", "Card path review", "Professional identity confidence"],
    training: "Compact lesson: why domain email is different from simply having any email address.",
  },
  llc: {
    key: "llc",
    phase: "Phase 2",
    module: "Legal Setup",
    title: "Entity Type & State Record Review",
    shortTitle: "Legal entity",
    route: "/llc-vs-corporation/",
    scanFinding: "Legal setup should match the name, entity type, and state record used everywhere else.",
    whatToFix: ["Entity type review", "State filing check", "Legal/public name match", "Ownership/contact consistency"],
    doFirst: ["Confirm the legal entity type.", "Check the state record.", "Match the public business name.", "Save the state record proof."],
    setupOptions: ["CorpNet", "Bizee", "BizFilings"],
    proof: ["State entity record", "Articles/formation document", "Business name match screenshot"],
    unlocks: ["EIN alignment", "Business bank setup", "Most vendor/category applications"],
    training: "Compact lesson: entity consistency before EIN, bank, and vendor records.",
  },
  ein: {
    key: "ein",
    phase: "Phase 2",
    module: "Legal Setup",
    title: "EIN Identity Match",
    shortTitle: "EIN",
    route: "/ein/",
    scanFinding: "The EIN should connect to the same legal business identity used on records and applications.",
    whatToFix: ["EIN confirmation", "IRS letter saved", "Legal name match", "Bank/vendor identity match"],
    doFirst: ["Locate or request the EIN letter.", "Compare legal name formatting.", "Save proof.", "Use the same identity on bank/vendor profiles."],
    setupOptions: ["IRS EIN application", "Done-for-you EIN help"],
    proof: ["IRS EIN letter", "State record", "Bank profile using matching name"],
    unlocks: ["Starter Net 30 vendors", "Business bank profile", "Credit bureau/profile tools"],
    training: "Compact lesson: why EIN proof matters before applications.",
  },
  bank: {
    key: "bank",
    phase: "Phase 3",
    module: "Banking Foundation",
    title: "Business Bank Account Fix",
    shortTitle: "Bank account",
    route: "/bank-account/",
    scanFinding: "A business bank account should be open and match the same company identity used publicly.",
    whatToFix: ["Business checking account", "Bank profile name/address match", "Operating deposits", "Account proof saved"],
    doFirst: ["Open or confirm the business checking account.", "Match the company identity.", "Use it consistently.", "Save proof before card/funding applications."],
    setupOptions: ["FDIC BankFind", "Credit Union Locator", "SBA Lender Match"],
    proof: ["Bank welcome/profile screen", "Business bank statement", "Profile details showing matching business identity"],
    unlocks: ["Bank-rating work", "Credit card readiness", "Funding path review"],
    training: "Compact lesson: banking as a stability signal, not just a place for deposits.",
  },
  "bank-rating": {
    key: "bank-rating",
    phase: "Phase 3",
    module: "Banking Foundation",
    title: "Bank Rating Fix",
    shortTitle: "Bank rating",
    route: "/bank-rating/",
    scanFinding: "The bank relationship and average balance signal should be stronger before higher-value account applications.",
    whatToFix: ["Average balance target", "90-day banking pattern", "Statement proof", "Application timing"],
    doFirst: ["Pick a realistic average-balance target.", "Track balances over time.", "Avoid applying during weak balance periods.", "Save statements/proof."],
    setupOptions: [],
    proof: ["Recent business bank statement", "Balance tracker", "Application timing note"],
    unlocks: ["Capital One Spark", "Chase Ink", "American Express Business", "Bank funding conversations"],
    training: "Compact lesson: how bank activity affects readiness without guaranteeing funding.",
  },
  criteria: {
    key: "criteria",
    phase: "Phase 4",
    module: "Approval Readiness",
    title: "12-Point Business Credit Criteria",
    shortTitle: "Readiness criteria",
    route: "/business-credit-criteria/",
    scanFinding: "The business should pass the core identity, banking, profile, and timing checks before broader applications.",
    whatToFix: ["Identity consistency", "Bureau/profile checks", "Business website/email", "Bank and vendor history", "Application timing"],
    doFirst: ["Review all readiness criteria.", "Fix mismatched records first.", "Delay applications until blockers are cleared.", "Save proof for every completed item."],
    setupOptions: ["D-U-N-S Number", "NAV.com", "Done-for-you readiness review"],
    proof: ["Criteria checklist", "Profile screenshots", "Saved fix proof", "Application readiness notes"],
    unlocks: ["Traditional business cards", "Corporate/no-PG review", "Funding readiness paths"],
    training: "Compact lesson: how readiness criteria protects against wasted applications.",
  },
  net30: {
    key: "net30",
    phase: "Phase 5",
    module: "Starter Vendor Credit",
    title: "Net 30 Vendor Readiness",
    shortTitle: "Net 30",
    route: "/about-net-30/",
    scanFinding: "Starter vendors should be selected after identity, EIN, address, website/email, and bank signals are ready enough for review.",
    whatToFix: ["Vendor category selection", "Requirements check", "Application timing", "Reporting expectations"],
    doFirst: ["Choose a vendor category that matches the business.", "Check required signals.", "Apply only when identity records match.", "Track payment history and reporting."],
    setupOptions: ["Account Matches", "Done-for-you tradeline help"],
    proof: ["Vendor approval/terms screenshot", "Invoice/payment proof", "Reporting or account status screenshot"],
    unlocks: ["Starter Net 30 vendors", "Retail/wholesale vendors", "Fleet and fuel cards", "Credit card readiness"],
    training: "Compact lesson: use vendor accounts to build clean payment history, not random applications.",
  },
};

export const accountCatalog: AccountCatalogItem[] = [
  ...[
    "Crown Office Supplies",
    "Uline",
    "Quill",
    "Grainger",
    "Nav Prime / Business Boost",
    "eCredable Business",
    "CreditStrong Business",
    "NAMYNOT",
    "Creative Analytics",
    "Branded Apparel Club",
  ].map((name, index) => ({
    name,
    group: "Starter Net 30 vendors",
    type: index < 4 ? "Starter vendor account" : "Credit profile / builder tool",
    requirements: ["Legal entity", "EIN", "Phone/address consistency", "Business bank account"],
    recommended: ["Website", "Domain email", "90+ days in records"],
    fixKeys: index < 2 ? ["ein", "phones", "address"] : ["ein", "phones", "address", "website"],
    timing: "Use after the foundation is clean enough for starter vendor review.",
    why: "Starter path for building controlled payment history when the profile is consistent.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#0E1A2B,#2563EB)" : "linear-gradient(135deg,#0E1A2B,#15803D)",
  })),
  ...[
    "Coast to Coast Office Supply",
    "Nine to Five Essentials",
    "GoodNeon",
    "Office Garner",
    "The CEO Creative",
    "Wise Business Plans",
    "JJ Gold International",
    "Summa Office Supplies",
    "Maverick Office Supplies",
    "Ohana Office Products",
  ].map((name, index) => ({
    name,
    group: "Office supply vendors",
    type: "Office / operating vendor",
    requirements: ["EIN", "Business address", "Phone signal", "Website or domain email"],
    recommended: ["Bank account", "Starter vendor history"],
    fixKeys: ["ein", "address", "phones", index > 4 ? "website" : "email"],
    timing: "Use for routine purchasing history after identity records line up.",
    why: "Office vendors should support real business operations and clean payment behavior.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#1E3A8A,#38BDF8)" : "linear-gradient(135deg,#111827,#64748B)",
  })),
  ...[
    "HD Supply",
    "Home Depot Pro / SupplyWorks",
    "Strategic Network Solutions",
    "Gempler's",
    "Home Depot Commercial Account",
    "Lowe's Pro",
    "United Rentals",
  ].map((name, index) => ({
    name,
    group: "Industrial/building vendors",
    type: "Building / industrial account",
    requirements: ["EIN", "Address consistency", "Business bank account", "Website"],
    recommended: ["90+ days", "Vendor history", "Project/business use"],
    fixKeys: ["ein", "address", "bank", "website"],
    timing: "Use when the business activity supports project, trade, or operational purchases.",
    why: "Industrial accounts often expect a more complete operating profile.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#713F12,#B45309)" : "linear-gradient(135deg,#0F172A,#334155)",
  })),
  ...[
    "Amazon Business Pay by Invoice",
    "Staples Business",
    "Office Depot Business",
    "Wayfair Professional",
    "Costco Business",
    "Sam's Club Business",
    "BJ's Business",
    "Shirtsy",
    "Business T-Shirt Club",
    "Red Spectrum",
    "Shogun Roasting",
  ].map((name, index) => ({
    name,
    group: "Retail/wholesale vendors",
    type: "Retail / wholesale account",
    requirements: ["EIN", "Phone", "Address", "Website"],
    recommended: ["Bank account", "Domain email", "Operational need"],
    fixKeys: ["ein", "phones", "address", "website"],
    timing: "Use after the core identity signals are consistent and the account fits the business.",
    why: "Retail and wholesale accounts should support inventory or operating needs, not random applications.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#172554,#2563EB)" : "linear-gradient(135deg,#0E1A2B,#0F766E)",
  })),
  ...[
    "BP Business Solutions",
    "Shell Fleet",
    "WEX",
    "Fleet One",
    "Universal Premium FleetCard",
    "Chevron Texaco Business Card",
    "Valero Fleet Plus",
    "76 Business Fleet Card",
    "ARCO Business Solutions",
    "Ford Pro",
  ].map((name, index) => ({
    name,
    group: "Fleet and fuel cards",
    type: "Fleet / fuel account",
    requirements: ["Entity", "EIN", "Phone", "Address", "Bank account"],
    recommended: ["90+ days", "Vehicle/business use", "Website"],
    fixKeys: ["llc", "ein", "phones", "address", "bank"],
    timing: "Use when the company has real driving, fleet, delivery, or service vehicle needs.",
    why: "Fleet accounts work best when the business use case is clear and identity records match.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#7F1D1D,#DC2626)" : "linear-gradient(135deg,#111827,#F59E0B)",
  })),
  ...[
    "Apple Business",
    "Dell Business",
    "Best Buy Business",
    "Lenovo Pro",
    "NeweggBusiness",
  ].map((name, index) => ({
    name,
    group: "Technology vendors",
    type: "Technology / equipment account",
    requirements: ["EIN", "Website", "Domain email", "Readiness criteria"],
    recommended: ["Bank account", "Vendor history", "Business use"],
    fixKeys: ["ein", "website", "email", "criteria"],
    timing: "Use when website/email and business purpose are credible.",
    why: "Technology vendors often expect a cleaner business presence and stronger verification signals.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#312E81,#7C3AED)" : "linear-gradient(135deg,#0F172A,#2563EB)",
  })),
  ...[
    "Bank of America Business Advantage Secured",
    "Bank of America Business Advantage Secured Credit Line",
    "First National Bank Business Edition Secured Mastercard",
    "Valley Visa Secured Business Credit Card",
  ].map((name, index) => ({
    name,
    group: "Secured business credit cards",
    type: "Secured card / secured line",
    requirements: ["Business bank account", "Deposit available", "Identity consistency"],
    recommended: ["Domain email", "90+ days", "Clean bank profile"],
    fixKeys: ["bank", "address", "phones"],
    timing: "Use when a deposit-backed bridge is safer than unsecured applications.",
    why: "Secured cards can fit earlier if the business profile is consistent and cash deposit is available.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#0E1A2B,#64748B)" : "linear-gradient(135deg,#0E1A2B,#15803D)",
  })),
  ...[
    "Capital One Spark Classic for Business",
    "Capital One Spark Cash Select",
    "Chase Ink Business Cash",
    "Chase Ink Business Unlimited",
    "American Express Blue Business Cash",
    "American Express Business Gold",
    "U.S. Bank Business Triple Cash Rewards",
    "Wells Fargo Signify Business Cash",
    "CitiBusiness AAdvantage",
    "Capital on Tap Business Credit Card",
  ].map((name, index) => ({
    name,
    group: "Traditional business credit cards",
    type: "Business credit card",
    requirements: ["Business bank account", "Bank rating", "Readiness criteria", "Clean identity signals"],
    recommended: ["Net 30 history", "Good owner credit", "90+ days in records"],
    fixKeys: ["bank", "bank-rating", "criteria", "phones", "address"],
    timing: "Use only after profile, bank, and criteria checks are strong enough for review.",
    why: "Traditional cards are better saved until the business can support underwriting checks.",
    applyHref: "/account-matches/",
    gradient: index % 2 ? "linear-gradient(135deg,#1E1B4B,#2563EB)" : "linear-gradient(135deg,#111827,#B45309)",
  })),
  ...[
    "Ramp Card",
    "Brex Card",
    "BILL Divvy Corporate Card",
    "Rho Corporate Card",
    "Mercury IO Mastercard",
  ].map((name, index) => ({
    name,
    group: "Corporate/no-PG cards",
    type: "Corporate / no-PG review",
    requirements: ["Revenue/cash flow", "Bank activity", "Website", "Domain email", "Readiness criteria"],
    recommended: ["Operating history", "Clean identity profile"],
    fixKeys: ["bank", "website", "email", "criteria"],
    timing: "Use only when bank activity and operating signals support the platform review.",
    why: "No-PG/corporate platforms usually review cash flow and real operating presence.",
    applyHref: "/revolving-business-credit-cards/",
    gradient: index % 2 ? "linear-gradient(135deg,#020617,#334155)" : "linear-gradient(135deg,#0F172A,#0891B2)",
  })),
  ...[
    "Amazon Business American Express",
    "Sam's Club Business Mastercard",
    "Costco Anywhere Visa Business",
    "Home Depot Commercial Account",
    "Lowe's Business Advantage",
    "Dell Business Credit",
    "NeweggBusiness Net Terms",
    "Shell Small Business Card",
    "WEX Fleet Card",
    "BP Business Solutions Fuel Card",
    "Chevron Texaco Business Card",
  ].map((name, index) => ({
    name,
    group: "Store/project/fleet cards",
    type: "Store, project, or fleet card",
    requirements: ["EIN", "Address", "Bank account", "Business purpose"],
    recommended: ["Website", "Vendor history", "Bank rating"],
    fixKeys: ["ein", "address", "bank", index > 4 ? "bank-rating" : "website"],
    timing: "Use when the card supports real purchasing, project, or travel needs.",
    why: "These accounts should match the business activity and current readiness stage.",
    applyHref: "/revolving-business-credit-cards/",
    gradient: index % 2 ? "linear-gradient(135deg,#0E1A2B,#DC2626)" : "linear-gradient(135deg,#0E1A2B,#2563EB)",
  })),
  ...[
    "Bank of America Business Advantage Credit Line Cash Secured",
    "Bank of America Secured Business Loan",
    "Bank of America Secured Business Line of Credit",
    "Chase Business Line of Credit",
    "Chase SBA Express / SBA-backed line",
    "Local bank CD-secured business loan",
    "Credit union share-secured business loan",
    "SBA Lender Match",
    "SBA 7(a) loan discussion with bank",
    "SBA 504 fixed asset financing",
    "Accion Opportunity Fund",
    "CDFI / community lender search",
    "Equipment financing through current bank",
    "Bank relationship term loan",
    "Business checking relationship review",
    "Deposit-backed starter funding plan",
    "Merchant cash advance warning review",
    "Invoice factoring readiness check",
    "Business grant search as non-debt option",
    "SCORE funding mentor session",
  ].map((name, index) => ({
    name,
    group: "Funding and secured-loan paths",
    type: index < 7 ? "Secured / bank funding path" : index < 14 ? "SBA / community lender path" : "Funding advisory path",
    requirements: ["Business bank account", "Bank relationship", "Statements", "Funding purpose", "Readiness criteria"],
    recommended: ["Revenue/cash flow", "Tax returns", "Collateral or reserve", "No recent negatives"],
    fixKeys: ["bank", "bank-rating", "criteria"],
    timing: "Review after identity, banking, statements, and purpose are ready. Funding is never guaranteed.",
    why: "Funding paths require documentation and timing discipline; use this as a readiness guide, not an approval promise.",
    applyHref: "/cd-business-loans/",
    gradient: index % 2 ? "linear-gradient(135deg,#064E3B,#15803D)" : "linear-gradient(135deg,#0E1A2B,#475569)",
  })),
];

// The Full Buildout page's seven-module, five-phase map. Section keys resolve to /fix/[key]/
// unless an explicit href points elsewhere (report card, account matches).
export type BuildoutSection = { key: string; title: string; purpose: string; fixKeys: string[]; href?: string };
export type BuildoutModule = { module: string; title: string; subtitle: string; sections: BuildoutSection[] };

export const buildoutModules: BuildoutModule[] = [
  {
    module: "Module 1",
    title: "Business Identity",
    subtitle: "Make your business findable and consistent.",
    sections: [
      { key: "nap", title: "NAP overview", purpose: "One exact name, address, and phone before touching individual records.", fixKeys: ["nap"] },
      { key: "phones", title: "Phone & 411", purpose: "A real business line with caller ID and a public listing.", fixKeys: ["phones"] },
      { key: "address", title: "Business address", purpose: "One address format across every public and banking record.", fixKeys: ["address"] },
      { key: "website", title: "Website & domain email", purpose: "A live domain with matching details and domain email.", fixKeys: ["website", "email"] },
    ],
  },
  {
    module: "Module 2",
    title: "Legal Setup",
    subtitle: "Lock in the legal foundation.",
    sections: [
      { key: "llc", title: "LLC vs corporation", purpose: "Confirm the entity type and exact legal name.", fixKeys: ["llc"] },
      { key: "sos", title: "Secretary of State record", purpose: "Verify the state record is active and consistent.", fixKeys: ["sos"] },
      { key: "ein", title: "EIN from IRS", purpose: "Tie the EIN to the same legal identity everywhere.", fixKeys: ["ein"] },
    ],
  },
  {
    module: "Module 3",
    title: "Banking Foundation",
    subtitle: "Build a credible banking profile.",
    sections: [
      { key: "bank", title: "Business bank account", purpose: "Open and match the business checking account.", fixKeys: ["bank"] },
      { key: "bank-rating", title: "Bank rating + tracker", purpose: "Build the balance pattern lenders look for.", fixKeys: ["bank-rating"] },
    ],
  },
  {
    module: "Module 4",
    title: "Business Planning",
    subtitle: "Document the business and preserve a progress record.",
    sections: [
      { key: "business-plan", title: "Business plan", purpose: "A practical plan that supports credit and funding conversations.", fixKeys: ["business-plan"] },
      { key: "report", title: "Progress report", purpose: "Save a member-safe record of what's done and what's next.", fixKeys: [], href: "/report-card/" },
    ],
  },
  {
    module: "Module 5",
    title: "Credit Profile + Readiness",
    subtitle: "Review bureau profiles and the full readiness criteria.",
    sections: [
      { key: "bureaus", title: "Business credit bureaus", purpose: "Understand bureau profiles before expecting reporting.", fixKeys: ["bureaus"] },
      { key: "comparable-credit", title: "Comparable credit", purpose: "Use realistic account sequencing before moving into stronger accounts.", fixKeys: ["criteria"] },
      { key: "criteria", title: "12-point criteria", purpose: "The full readiness check before broader applications.", fixKeys: ["criteria"] },
    ],
  },
  {
    module: "Module 6",
    title: "Starter Vendor Credit",
    subtitle: "Build reporting history in the right order.",
    sections: [
      { key: "net30", title: "Starter vendor credit", purpose: "Pick starter vendors that fit the business and report.", fixKeys: ["net30"] },
    ],
  },
  {
    module: "Module 7",
    title: "Cards + Funding",
    subtitle: "Review cards and funding only when the foundation supports them.",
    sections: [
      { key: "cards", title: "Business cards", purpose: "Review secured, traditional, and corporate card paths only when the signals support them.", fixKeys: [], href: "/fix/cards/" },
      { key: "funding", title: "Funding readiness", purpose: "Match documentation, banking, revenue, and timing before funding conversations.", fixKeys: [], href: "/fix/funding/" },
    ],
  },
];

export const accountGroups = Array.from(new Set(accountCatalog.map((item) => item.group)));

export function accountStatus(item: AccountCatalogItem, openIssueKeys: Set<string>, completedKeys: Set<string>): { tone: CatalogTone; label: string; blockers: string[] } {
  const blockers = item.fixKeys.filter((key) => openIssueKeys.has(key) && !completedKeys.has(key));
  if (blockers.length) return { tone: "locked", label: "Fix first", blockers };
  if (item.group.includes("Funding") || item.group.includes("Corporate") || item.group.includes("Traditional")) return { tone: "review", label: "Guided review", blockers: [] };
  return { tone: "ready", label: "Ready to review", blockers: [] };
}

export type ProgramLesson = {
  key: string;
  label: string;
  route: string;
  issueKeys?: string[];
};

export type ProgramModulePath = {
  phase: string;
  module: string;
  summary: string;
  sections: ProgramLesson[];
};

export type LessonVideo = {
  title: string;
  src: string;
  poster: string;
};

export type LessonResource = {
  label: string;
  href: string;
};

export type LessonModuleOptionIntro = {
  kicker: string;
  title: string;
  sub: string;
};

export type LessonModuleOption = {
  name: string;
  kind: "provider" | "diy" | "help";
  badgeText: string;
  description: string;
  bestFor: string;
  href?: string;
  openLabel?: string;
  price?: string;
  note?: string;
  brandColor?: string;
};

export type LessonSection = {
  key: string;
  phase: string;
  module: string;
  route: string;
  tags: string[];
  title: string;
  description: string;
  videos: LessonVideo[];
  why: string[];
  warningTitle: string;
  warning: string;
  guideTitle: string;
  guide: string;
  checklist: string[];
  proof: string[];
  resources: LessonResource[];
  optionIntro?: LessonModuleOptionIntro;
  moduleOptions?: LessonModuleOption[];
  accountPath?: "vendor" | "cards" | "funding";
  matcherSignals?: string[];
};

export type AccountPathCard = {
  key: "vendor" | "cards" | "funding";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  examples: string[];
  readiness: string[];
};

export type AccountBucket = {
  key: string;
  title: string;
  description: string;
  path: "vendor" | "cards" | "funding";
  groups: string[];
};

export const proofHelperText = "Save proof before you continue. Proof can be a screenshot, confirmation email, PDF, bank letter, invoice, listing page, or saved record that shows this step is complete. Checked items save to your member account automatically.";

export const beforeYouLeaveText = "Finish the checklist items on this page. The platform sequence depends on completing each foundation item in order.";

export const programModules: ProgramModulePath[] = [
  { phase: "Phase 1", module: "Business Identity", summary: "Phone, 411, address, website, and domain-email records must match before applications.", sections: [
    { key: "nap", label: "NAP overview", route: "/nap-overview/" },
    { key: "phones", label: "Phone + 411", route: "/phones-and-411/" },
    { key: "address", label: "Business address", route: "/business-address/" },
    { key: "website", label: "Website + domain", route: "/website-domain-email/", issueKeys: ["email"] },
  ] },
  { phase: "Phase 2", module: "Legal Setup", summary: "Legal entity, state record, EIN, and tax identity records stay aligned.", sections: [
    { key: "llc", label: "Entity type", route: "/llc-vs-corporation/" },
    { key: "sos", label: "State record", route: "/contact-list/", issueKeys: ["llc"] },
    { key: "ein", label: "EIN identity", route: "/ein/" },
  ] },
  { phase: "Phase 3", module: "Banking Foundation", summary: "Business banking, bank rating, and basic operating records support stronger account review.", sections: [
    { key: "bank", label: "Business bank account", route: "/bank-account/" },
    { key: "bank-rating", label: "Bank rating", route: "/bank-rating/" },
  ] },
  { phase: "Phase 4", module: "Business Planning", summary: "A practical business plan and saved progress record support stronger credit and funding conversations.", sections: [
    { key: "business-plan", label: "Business plan", route: "/business-plan/" },
  ] },
  { phase: "Phase 4", module: "Credit Profile + Approval Readiness", summary: "Bureau/profile checks, comparable credit, and application timing come before broader applications.", sections: [
    { key: "bureaus", label: "Business profile", route: "/equifax-business/" },
    { key: "comparable-credit", label: "Comparable credit", route: "/comparable-credit/" },
    { key: "criteria", label: "Readiness criteria", route: "/business-credit-criteria/" },
  ] },
  { phase: "Phase 5", module: "Starter Vendor Credit", summary: "Net 30 paths are reviewed only after the foundation supports the account category.", sections: [
    { key: "net30", label: "Starter vendors", route: "/about-net-30/" },
  ] },
  { phase: "Phase 5", module: "Cards + Funding", summary: "Cards and funding paths are reviewed only after the foundation supports the account category.", sections: [
    { key: "cards", label: "Business cards", route: "/revolving-business-credit-cards/" },
    { key: "funding", label: "Funding readiness", route: "/cd-business-loans/" },
  ] },
];
const defaultTags = ["Member lesson", "7-module path", "Checklist"];

function lesson(input: Omit<LessonSection, "tags" | "why" | "warningTitle" | "warning" | "guideTitle" | "guide" | "checklist" | "proof" | "resources"> & Partial<Pick<LessonSection, "tags" | "why" | "warningTitle" | "warning" | "guideTitle" | "guide" | "checklist" | "proof" | "resources">>): LessonSection {
  return {
    tags: defaultTags,
    why: [
      "Vendors, card issuers, lenders, and bureaus compare this signal before trusting an application.",
      "Mismatched records make a real business look unfinished or risky.",
      "This section should be completed before moving to the next account category.",
    ],
    warningTitle: "Do not skip this foundation step",
    warning: "If this record is incomplete or inconsistent, applying can create avoidable denials, manual reviews, or stale profile data.",
    guideTitle: "Guide",
    guide: "Use one exact business identity, save proof, and update every profile that uses this information.",
    checklist: ["Review the current record.", "Update the record to match the business identity.", "Save proof before moving forward.", "Use the same information on applications."],
    proof: ["Screenshot or saved record", "Confirmation email or PDF", "Profile page showing the corrected information"],
    resources: [{ label: "Get help with this section", href: "/support?topic=fix" }],
    ...input,
  };
}

const lessonBase: Record<string, LessonSection> = {
  nap: lesson({ key: "nap", phase: "Phase 1", module: "Business Identity", route: "/nap-overview/", title: "NAP consistency overview", description: "Start here before fixing individual records. Name, address, and phone consistency is the thread that ties the platform together.", videos: [{ title: "Start here: NAP overview", src: "/uploads/start-here-nap-overview.webm?v=a831a29", poster: "/posters/nap.png?v=a831a29" }], checklist: ["Write down the exact legal/public business name.", "Choose the exact address format.", "Choose the primary business phone number.", "Choose the website and domain email to use on applications."] }),
  phones: lesson({ key: "phones", phase: "Phase 1", module: "Business Identity", route: "/phones-and-411/", title: "Phone & 411 listing", description: "Make the business phone signal look like a real business line and keep it consistent everywhere.", videos: [{ title: "Business phone setup", src: "/uploads/phones-and-411-phone-recreated.webm?v=a831a29", poster: "/posters/phones-a.jpg?v=a831a29" }, { title: "411 and public listing", src: "/uploads/phones-and-411-411-recreated.webm?v=a831a29", poster: "/posters/phones-b.jpg?v=a831a29" }], checklist: ["Choose the primary business number.", "Set caller ID or business name display.", "Add or verify a public 411/business listing.", "Update the website, bank profile, and applications with the same number."], proof: ["Phone account screenshot", "Caller ID/business name screenshot", "Directory or 411 listing screenshot"] }),
  address: lesson({ key: "address", phase: "Phase 1", module: "Business Identity", route: "/business-address/", title: "Business address", description: "Use one business-appropriate address format across records so vendors see a stable operating profile.", videos: [{ title: "Business address rules", src: "/uploads/business-address-recreated.webm?v=a831a29", poster: "/posters/address.png?v=a831a29" }], checklist: ["Choose the exact business address format.", "Update the website contact page.", "Check state or public records.", "Match bank and vendor application profiles."] }),
  website: lesson({ key: "website", phase: "Phase 1", module: "Business Identity", route: "/website-domain-email/", title: "Website + domain email", description: "The website and domain email should support the same business identity shown in records and applications.", videos: [{ title: "Website and domain email", src: "/uploads/newpage87229491-recreated.webm?v=a831a29", poster: "/posters/website.png?v=a831a29" }], checklist: ["Confirm the domain is active.", "Add matching name, address, and phone to the site.", "Create or confirm a domain email address.", "Use the same email on account applications."] }),
  llc: lesson({ key: "llc", phase: "Phase 2", module: "Legal Setup", route: "/llc-vs-corporation/", title: "LLC vs corporation", description: "Confirm the entity structure and legal name before matching EIN, banking, and account applications.", videos: [{ title: "Legal entity setup", src: "/uploads/newpagea5b34995-lesson.webm?v=a831a29", poster: "/posters/llc.png?v=a831a29" }], checklist: ["Confirm the legal business name.", "Confirm entity type and state.", "Check active/good-standing status.", "Save the formation or state-record proof."] }),
  sos: lesson({ key: "sos", phase: "Phase 2", module: "Legal Setup", route: "/contact-list/", title: "Secretary of State contact list", description: "Use the state record to confirm the business is active and that public details support the identity used elsewhere.", videos: [{ title: "Secretary of State contact list", src: "/uploads/contact-list-lesson.webm?v=a831a29", poster: "/posters/sos.png?v=a831a29" }], checklist: ["Find the state business lookup page.", "Search the exact legal business name.", "Confirm status is active or in good standing.", "Save the state record proof."] }),
  ein: lesson({ key: "ein", phase: "Phase 2", module: "Legal Setup", route: "/ein/", title: "EIN from IRS", description: "Make sure the EIN belongs to the same legal business identity used on records, banking, and applications.", videos: [{ title: "EIN identity match", src: "/uploads/ein-recreated.webm?v=a831a29", poster: "/posters/ein.jpg?v=a831a29" }], checklist: ["Locate or request the EIN confirmation.", "Compare legal name to state records.", "Save the EIN letter.", "Use the same identity on bank and vendor profiles."] }),
  bank: lesson({ key: "bank", phase: "Phase 3", module: "Banking Foundation", route: "/bank-account/", title: "Business bank account", description: "Open or verify a business bank account that matches the company identity and supports operating activity.", videos: [{ title: "Business bank account", src: "/uploads/bank-account-recreated.webm?v=a831a29", poster: "/posters/bank.jpg?v=a831a29" }], checklist: ["Open or confirm the business checking account.", "Match the legal business identity.", "Confirm address and phone in the bank profile.", "Save account proof or a statement."] }),
  "bank-rating": lesson({ key: "bank-rating", phase: "Phase 3", module: "Banking Foundation", route: "/bank-rating/", title: "Bank rating", description: "Use consistent banking activity and average-balance discipline before higher-value account applications.", videos: [{ title: "Bank rating lesson", src: "/uploads/bank-rating-lesson.webm?v=a831a29", poster: "/posters/bankrating.png?v=a831a29" }, { title: "Your bank rating", src: "/uploads/your-bank-rating-lesson.webm?v=a831a29", poster: "/posters/bankrating.png?v=a831a29" }], checklist: ["Choose a realistic average-balance target.", "Track banking activity over time.", "Save recent business statements.", "Delay applications during weak periods."] }),
  "business-plan": lesson({ key: "business-plan", phase: "Phase 4", module: "Approval Readiness", route: "/business-plan/", title: "Business plan", description: "Build a practical business plan that supports credit, vendor, and funding conversations.", videos: [{ title: "Business plan", src: "/uploads/business-plan-recreated.webm?v=a831a29", poster: "/posters/businessplan.png?v=a831a29" }], checklist: ["Describe the business and customer.", "Write the product/service offer.", "List operating needs and expenses.", "Define credit or funding purpose."] }),
  "business-plan-report": lesson({ key: "business-plan-report", phase: "Phase 4", module: "Approval Readiness", route: "/business-plan-report/", title: "Progress report", description: "Save a record of what has been completed, what is still open, and what the business is ready to pursue next.", videos: [{ title: "Progress report", src: "/uploads/newpage7c157847-lesson.webm?v=a831a29", poster: "/posters/businessplan.png?v=a831a29" }], checklist: ["Record completed sections.", "Attach or note saved proof.", "List remaining blockers.", "Choose the next account category."] }),
  bureaus: lesson({ key: "bureaus", phase: "Phase 5", module: "Approval Readiness", route: "/equifax-business/", title: "Business bureaus", description: "Understand business bureau/profile checks before assuming an account will report or approve.", videos: [{ title: "Business bureaus", src: "/uploads/equifax-business-lesson.webm?v=a831a29", poster: "/posters/bureaus.png?v=a831a29" }], checklist: ["Check business profile/bureau presence.", "Compare name, address, phone, and EIN details.", "Record any mismatches.", "Choose vendors that fit the reporting goal."] }),
  "comparable-credit": lesson({ key: "comparable-credit", phase: "Phase 5", module: "Approval Readiness", route: "/comparable-credit/", title: "Comparable credit", description: "Use starter history and realistic account sequencing before jumping into stronger accounts.", videos: [{ title: "Comparable credit", src: "/uploads/comparable-credit-lesson.webm?v=a831a29", poster: "/posters/criteria.png?v=a831a29" }], checklist: ["Review current account history.", "Choose starter vendors that fit the business.", "Track payment proof.", "Move to cards only when readiness improves."] }),
  criteria: lesson({ key: "criteria", phase: "Phase 5", module: "Approval Readiness", route: "/business-credit-criteria/", title: "12-point business credit criteria", description: "Use the full readiness checklist to decide whether to apply now, fix first, or build more proof.", videos: [{ title: "Business credit criteria", src: "/uploads/newpage7c157847-lesson.webm?v=a831a29", poster: "/posters/criteria.png?v=a831a29" }], checklist: ["Review identity consistency.", "Review legal and EIN proof.", "Review bank and website/email proof.", "Review bureau/profile and application timing."] }),
  net30: lesson({ key: "net30", phase: "Phase 5", module: "Starter Vendor Credit", route: "/about-net-30/", title: "Starter vendor credit readiness", description: "Choose Net 30 and starter vendors by category after the foundation is ready enough for review.", videos: [{ title: "Starter Net 30 vendors", src: "/uploads/about-net-30-recreated.webm?v=a831a29", poster: "/posters/net30.jpg?v=a831a29" }], accountPath: "vendor", matcherSignals: ["Legal entity active", "EIN saved", "Business phone listed", "Address matches", "Website live", "Domain email ready", "Business bank account", "Application timing clean", "Operational use case", "Proof folder ready", "No random applications", "Payment tracking plan"] }),
  cards: lesson({ key: "cards", phase: "Phase 5", module: "Starter Vendor Credit", route: "/revolving-business-credit-cards/", title: "Revolving business credit cards", description: "Move into secured, store, fleet, traditional, or corporate card paths only when the profile supports that category.", videos: [{ title: "Revolving business credit cards", src: "/uploads/revolving-business-credit-cards-recreated.webm?v=a831a29", poster: "/posters/criteria.png?v=a831a29" }], accountPath: "cards", matcherSignals: ["Business bank account", "Bank rating pattern", "Domain email", "Website live", "Identity records match", "Starter history", "Card purpose clear", "Application timing clean", "Owner/personal-credit risk reviewed", "No recent denials", "Proof folder ready", "Statements available", "Category selected", "Next step documented"] }),
  funding: lesson({ key: "funding", phase: "Phase 5", module: "Starter Vendor Credit", route: "/cd-business-loans/", title: "CD-secured business loans", description: "Review secured loan and funding paths after identity, banking, statements, and purpose are documented.", videos: [{ title: "CD-secured business loans", src: "/uploads/cd-business-loans-lesson.webm?v=a831a29", poster: "/posters/bankrating.png?v=a831a29" }], accountPath: "funding", matcherSignals: ["Business bank account", "Bank rating reviewed", "Statements available", "Funding purpose clear", "Business plan saved", "Revenue/cash-flow proof", "Collateral/deposit option reviewed", "Identity records match", "Tax/documentation path known", "No unrealistic approval promise", "Bank relationship noted", "Application timing clean", "Use of funds written", "Proof folder ready", "Fallback path selected", "Next conversation planned"] }),
};

export const lessonOptionContent: Record<string, { optionIntro: LessonModuleOptionIntro; moduleOptions: LessonModuleOption[] }> = {
  nap: {
    optionIntro: { kicker: "Optional awareness", title: "Listing consistency tools you may see", sub: "You do not have to buy a listing service to continue. These are tools people use to check or sync business listings across directories." },
    moduleOptions: [
      { name: "Yext", brandColor: "#0F1B2D", kind: "diy", badgeText: "Listing sync", href: "https://www.yext.com/", openLabel: "Open Yext", description: "Sync business details across maps, directories, and discovery platforms.", note: "Awareness only - not required to continue.", bestFor: "Many listings to manage" },
      { name: "BrightLocal", brandColor: "#0B6EB5", kind: "diy", badgeText: "Citation audit", href: "https://www.brightlocal.com/", openLabel: "Open BrightLocal", description: "Build, audit, and clean up local business citations and directory records.", note: "Awareness only - not required to continue.", bestFor: "Auditing citations" },
      { name: "Moz Local", brandColor: "#1f4e79", kind: "diy", badgeText: "Listing accuracy", href: "https://moz.com/products/local", openLabel: "Open Moz Local", description: "Manage business listing accuracy across directories and local search.", note: "Awareness only - not required to continue.", bestFor: "Local search accuracy" },
    ],
  },
  phones: {
    optionIntro: { kicker: "Choose your phone setup", title: "Business phone options", sub: "Compare the monthly cost and how much setup work you want to handle yourself." },
    moduleOptions: [
      { name: "TurnCom360", brandColor: "#0F1B2D", kind: "provider", badgeText: "Done for you", price: "$35/month flat rate", href: "https://www.turncom360.com/", openLabel: "Open TurnCom360", description: "Complete business phone system with a mobile app, professional calling features, and the business presence that helps the company look established.", note: "Done for you: they set up the system, greetings, routing, and voicemail.", bestFor: "Want it set up for you" },
      { name: "RingCentral", brandColor: "#0B6EB5", kind: "diy", badgeText: "DIY setup", price: "$30-$80/month", href: "https://www.ringcentral.com/", openLabel: "Open RingCentral", description: "Business phone system with calling features appropriate for a professional presence.", note: "You have to configure the greetings, routing, voicemail, and call flow yourself.", bestFor: "Doing it yourself" },
      { name: "Grasshopper", brandColor: "#00A36C", kind: "diy", badgeText: "DIY setup", price: "$30-$80/month", href: "https://grasshopper.com/", openLabel: "Open Grasshopper", description: "Virtual phone option for separating business calls from personal calls.", note: "You have to configure the greetings, extensions, voicemail, and call handling yourself.", bestFor: "Solo / mobile-first" },
    ],
  },
  address: {
    optionIntro: { kicker: "Choose your resource", title: "Recommended address options", sub: "Google each address first. Confirm it is a real commercial building with office, coworking, or meeting-room access." },
    moduleOptions: [
      { name: "Regus", brandColor: "#0F1B2D", kind: "provider", badgeText: "Workspace access", price: "From about $2/day", href: "https://www.regus.com/", openLabel: "Open Regus", description: "Office and virtual office option for a professional business address.", note: "Before using the address, confirm the exact building on Google Maps and verify office, coworking, or meeting-room access is available.", bestFor: "Want workspace access" },
      { name: "Davinci", brandColor: "#D6263A", kind: "provider", badgeText: "Meeting rooms", price: "From about $50/month", href: "https://www.davincivirtual.com/", openLabel: "Open Davinci", description: "Virtual office and business address resource with meeting room options.", note: "Before using the address, Google the exact location and make sure it is a commercial building, not a post office, postal store, or mailbox-only location.", bestFor: "Need meeting rooms" },
      { name: "Alliance Virtual Offices", brandColor: "#1f4e79", kind: "provider", badgeText: "Office access", price: "From about $40/month", href: "https://www.alliancevirtualoffices.com/", openLabel: "Open Alliance Virtual Offices", description: "Commercial virtual office address with mail handling and access to meeting rooms or office space.", note: "Before using the address, confirm the exact location on Google Maps and verify it is a staffed business center with workspace access.", bestFor: "Want a staffed center" },
    ],
  },
  website: {
    optionIntro: { kicker: "Choose your website path", title: "Website and email options", sub: "TurnCom360 is the done-for-you path. Wix and Webflow are DIY paths, so the owner must handle domain, email, SSL, content, and page setup." },
    moduleOptions: [
      { name: "TurnCom360", brandColor: "#0F1B2D", kind: "provider", badgeText: "Done for you", price: "Website + domain + email", href: "https://www.turncom360.com/", openLabel: "Open TurnCom360", description: "Professional website setup for business owners who want everything handled for them.", note: "TurnCom360 builds the site, adds the content, sets up the domain, business email, SSL, core pages, and gives the finished site a professional look and feel.", bestFor: "Want it handled for you" },
      { name: "Wix", brandColor: "#0F1B2D", kind: "diy", badgeText: "DIY builder", price: "Website platform", href: "https://www.wix.com/", openLabel: "Open Wix", description: "Website builder option for creating a business site yourself.", note: "You have to build the website, write or add the content, connect the domain, set up SSL, create business email, and make every page look professional yourself.", bestFor: "Doing it yourself" },
      { name: "Webflow", brandColor: "#1f4e79", kind: "diy", badgeText: "DIY or designer", price: "Polished site", href: "https://webflow.com/", openLabel: "Open Webflow", description: "Website platform option for a more polished business web presence.", note: "You or your designer still have to build the pages, add content, connect the domain, set up SSL, business email, service pages, Privacy Policy, and Terms of Service.", bestFor: "Want a polished site" },
    ],
  },
  llc: {
    optionIntro: { kicker: "Choose your filing resource", title: "Entity filing options", sub: "Use a filing service if you want help preparing documents, but verify the final approved record with the Secretary of State." },
    moduleOptions: [
      { name: "CorpNet", brandColor: "#0F1B2D", kind: "provider", badgeText: "Filing support", href: "https://www.corpnet.com/", openLabel: "Open CorpNet", description: "Business filing service for forming or maintaining an entity.", note: "Useful when you want filing help, compliance reminders, and support with state paperwork.", bestFor: "Want filing help" },
      { name: "Bizee", brandColor: "#0B6EB5", kind: "provider", badgeText: "Formation service", href: "https://bizee.com/", openLabel: "Open Bizee", description: "Online business formation service for LLCs, corporations, and registered-agent add-ons.", note: "Good for a guided filing path, but review add-ons carefully and save the final state-approved documents.", bestFor: "Guided filing path" },
      { name: "BizFilings", brandColor: "#1f4e79", kind: "provider", badgeText: "Wolters Kluwer", href: "https://www.wolterskluwer.com/en/solutions/bizfilings", openLabel: "Open BizFilings", description: "Entity filing service for LLC, corporation, registered agent, EIN, and compliance support.", note: "Useful if you want a more established filing provider with formation guidance.", bestFor: "Established provider" },
    ],
  },
  ein: {
    optionIntro: { kicker: "Get or verify your EIN with the IRS", title: "EIN stands for Employer Identification Number", sub: "Apply directly through the IRS. Do not pay a third-party site just to get an EIN unless you are intentionally using a filing service." },
    moduleOptions: [
      { name: "IRS - Apply for an EIN", brandColor: "#1f4e79", kind: "provider", badgeText: "Free official", href: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online", openLabel: "Open IRS EIN application", description: "Apply directly with the IRS at no cost, under your exact legal business name.", note: "Do not pay a third-party site just to get an EIN unless you are intentionally using a filing service.", bestFor: "No EIN yet" },
      { name: "Done-for-you EIN help", kind: "help", badgeText: "Done for you", description: "Request help and we guide getting or correcting your EIN under the exact legal name.", bestFor: "Want it handled" },
    ],
  },
  bank: {
    optionIntro: { kicker: "Choose your banking resource", title: "Business banking research options", sub: "Use these resources to find legitimate banks, credit unions, and lending paths. Pick the institution that fits your business and documentation." },
    moduleOptions: [
      { name: "FDIC BankFind", brandColor: "#1f4e79", kind: "diy", badgeText: "Find a bank", href: "https://banks.data.fdic.gov/bankfind-suite/bankfind", openLabel: "Open FDIC BankFind", description: "Look up FDIC-insured community and regional banks near you.", bestFor: "Finding local banks" },
      { name: "Credit Union Locator", brandColor: "#0B6EB5", kind: "diy", badgeText: "Credit unions", href: "https://mapping.ncua.gov/", openLabel: "Find credit unions", description: "Locate local credit unions with business banking support.", bestFor: "Member-owned options" },
      { name: "SBA Lender Match", brandColor: "#0F1B2D", kind: "diy", badgeText: "SBA lending", href: "https://www.sba.gov/funding-programs/loans/lender-match", openLabel: "Search SBA Lender Match", description: "Match with SBA-approved lenders for future financing.", bestFor: "Planning ahead for credit" },
    ],
  },
  bureaus: {
    optionIntro: { kicker: "Check what is reporting", title: "Business bureau and monitoring resources", sub: "Use these as checkpoints. The goal is to see whether the company is visible, whether records match, and whether trade activity is starting to appear." },
    moduleOptions: [
      { name: "Creditsafe", brandColor: "#0F1B2D", kind: "diy", badgeText: "Report resource", href: "https://www.creditsafe.com/", openLabel: "Open Creditsafe", description: "Business credit report resource for company visibility, risk indicators, payment data, and profile information.", note: "Use it to see whether the company is visible and whether details look consistent.", bestFor: "Visibility check" },
      { name: "Equifax Business", brandColor: "#0B6EB5", kind: "diy", badgeText: "Bureau", href: "https://www.equifax.com/business/", openLabel: "Open Equifax Business", description: "Business credit bureau resource for understanding reports, risk signals, and data used in commercial decisions.", note: "Use it to understand bureau reporting and identify records that may need correction.", bestFor: "Bureau reporting" },
      { name: "NAV.com", brandColor: "#D6263A", kind: "diy", badgeText: "Monitoring", href: "https://www.nav.com/", openLabel: "Open NAV.com", description: "Monitoring resource to review business credit info, track profile activity, and see selected bureau data by plan.", note: "Use it before and after building trade accounts so you can monitor what appears over time.", bestFor: "Ongoing monitoring" },
    ],
  },
  criteria: {
    optionIntro: { kicker: "Confirm readiness", title: "Business credit readiness resources", sub: "Use these to check visibility and avoid applying before the profile is ready." },
    moduleOptions: [
      { name: "D-U-N-S Number (Dun & Bradstreet)", brandColor: "#0F1B2D", kind: "provider", badgeText: "Bureau listing", href: "https://www.dnb.com/duns-number/get-a-duns.html", openLabel: "Get a D-U-N-S", description: "Get listed with D&B so vendors and lenders can find your business.", bestFor: "Not listed with bureaus" },
      { name: "NAV.com", brandColor: "#D6263A", kind: "provider", badgeText: "Monitoring", href: "https://www.nav.com/", openLabel: "Open NAV.com", description: "Monitor what appears on your business credit profile across bureaus.", bestFor: "Track visibility" },
      { name: "Done-for-you readiness review", kind: "help", badgeText: "Done for you", description: "Request help and we run the full 12-point check before you apply.", bestFor: "Want a second set of eyes" },
    ],
  },
  "business-plan": {
    optionIntro: { kicker: "Choose your planning resource", title: "Business plan options", sub: "Use a builder or template to prepare the plan. Review a sample first to understand the format." },
    moduleOptions: [
      { name: "LivePlan", brandColor: "#0F1B2D", kind: "diy", badgeText: "Plan builder", href: "https://www.liveplan.com/", openLabel: "Open LivePlan", description: "Guided business-plan software with prompts, forecasting, and review.", note: "Best if you want help building the full plan and numbers in one tool.", bestFor: "Build the whole plan" },
      { name: "Bplans", brandColor: "#0B6EB5", kind: "diy", badgeText: "Examples", href: "https://www.bplans.com/sample-business-plans/directory/", openLabel: "View examples", description: "Sample business plans and planning guidance by industry.", note: "Best for seeing how other plans are structured before writing your own.", bestFor: "See real examples" },
      { name: "SCORE template", brandColor: "#1f4e79", kind: "diy", badgeText: "Free template", href: "https://www.score.org/resource/business-planning-financial-statements-template-gallery", openLabel: "Open template", description: "Free startup plan template with marketing, operations, and financials.", note: "Best if you want a free worksheet and mentor-style structure.", bestFor: "Free worksheet" },
    ],
  },
  net30: {
    optionIntro: { kicker: "Match your readiness", title: "Find vendors you qualify for", sub: "Use the Account Match finder to see which reporting vendors you are ready for now." },
    moduleOptions: [
      { name: "Account Matches", brandColor: "#0B6EB5", kind: "provider", badgeText: "Vendor library", href: "/account-matches/", openLabel: "Open Account Matches", description: "Review the full vendor, card, and funding library only after the foundation signals are ready.", bestFor: "Choose account path" },
      { name: "Done-for-you tradeline help", kind: "help", badgeText: "Done for you", description: "Request help and we guide opening your first reporting accounts in the right order.", bestFor: "Want hands-on help" },
    ],
  },
};
export const lessonSections: Record<string, LessonSection> = {
  ...lessonBase,
  email: { ...lessonBase.website, ...lessonOptionContent.website, key: "email", title: "Domain email", description: "Use a domain email that matches the website and business identity before account applications." },
};

for (const [lessonKey, optionContent] of Object.entries(lessonOptionContent)) {
  if (lessonSections[lessonKey]) {
    lessonSections[lessonKey] = { ...lessonSections[lessonKey], ...optionContent };
  }
}

export const programLessons = programModules.flatMap((module) => module.sections.map((section) => ({ ...section, phase: module.phase, module: module.module })));
export const lessonProgressOrder = programLessons.map((section) => section.key);

export function findProgramLesson(key: string) {
  return programLessons.find((section) => section.key === key || section.issueKeys?.includes(key));
}

export function getLessonSection(key: string) {
  const programLesson = findProgramLesson(key);
  return lessonSections[key] ?? (programLesson ? lessonSections[programLesson.key] : undefined);
}

export function getLessonNavigation(key: string) {
  const programLesson = findProgramLesson(key);
  const normalizedKey = programLesson?.key ?? key;
  const index = lessonProgressOrder.indexOf(normalizedKey);
  const safeIndex = index >= 0 ? index : 0;
  const previousKey = lessonProgressOrder[safeIndex - 1];
  const nextKey = lessonProgressOrder[safeIndex + 1];
  return {
    index: safeIndex,
    total: lessonProgressOrder.length,
    percent: Math.round(((safeIndex + 1) / lessonProgressOrder.length) * 100),
    previous: previousKey ? lessonSections[previousKey] : undefined,
    next: nextKey ? lessonSections[nextKey] : undefined,
  };
}

export const accountPathCards: AccountPathCard[] = [
  { key: "vendor", eyebrow: "Phase 5 / Vendor path", title: "Vendor & Net 30 accounts", description: "Starter vendors, operating vendors, industrial suppliers, retail/wholesale, and fleet accounts.", href: "/account-matches/#vendors", examples: ["Uline", "Quill", "Grainger", "HD Supply", "Amazon Business", "BP Business Solutions"], readiness: ["Entity + EIN", "Phone/address match", "Website or domain email", "Business bank account"] },
  { key: "cards", eyebrow: "Phase 5 / Card path", title: "Business credit cards", description: "Secured cards, store/project cards, fleet cards, traditional business cards, and corporate/no-PG review paths.", href: "/account-matches/#cards", examples: ["Bank of America secured", "Chase Ink", "Capital One Spark", "Amex Business", "Ramp", "Brex"], readiness: ["Bank account", "Bank-rating pattern", "12-point criteria", "Comparable history"] },
  { key: "funding", eyebrow: "Phase 5 / Funding path", title: "Funding and secured-loan paths", description: "CD-secured loans, bank relationship conversations, SBA/community lender paths, and documentation readiness.", href: "/account-matches/#funding", examples: ["CD-secured loan", "SBA Lender Match", "CDFI lender", "Equipment financing", "Bank line review"], readiness: ["Statements", "Use of funds", "Business plan", "Collateral/deposit path"] },
];

export const accountBuckets: AccountBucket[] = [
  { key: "vendors", title: "Vendor and Net 30 options", description: "Start here when the business identity is clean enough for operating accounts and payment-history builders.", path: "vendor", groups: ["Starter Net 30 vendors", "Office supply vendors", "Industrial/building vendors", "Retail/wholesale vendors", "Fleet and fuel cards", "Technology vendors"] },
  { key: "cards", title: "Credit card and revolving options", description: "Use this section after banking, criteria, and comparable-credit signals support a card path.", path: "cards", groups: ["Secured business credit cards", "Traditional business credit cards", "Corporate/no-PG cards", "Store/project/fleet cards"] },
  { key: "funding", title: "Funding and secured-loan options", description: "Use this last, after the member has proof, statements, purpose, and a realistic lender conversation path.", path: "funding", groups: ["Funding and secured-loan paths"] },
];

