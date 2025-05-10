export const APP_NAME = "Bank CSP Portal";

export const USER_ROLES = {
  ADMIN: "admin",
  CSP: "csp",
  FI: "fi",
  AUDITOR: "auditor",
  BANK: "bank"
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.CSP]: "CSP Agent",
  [USER_ROLES.FI]: "FI Agent",
  [USER_ROLES.AUDITOR]: "Auditor",
  [USER_ROLES.BANK]: "Bank Officer"
};

export const DASHBOARD_PATHS = {
  [USER_ROLES.ADMIN]: "/dashboard/admin",
  [USER_ROLES.CSP]: "/dashboard/csp",
  [USER_ROLES.FI]: "/dashboard/fi",
  [USER_ROLES.AUDITOR]: "/dashboard/auditor",
  [USER_ROLES.BANK]: "/dashboard/bank"
};

export const TRANSACTION_TYPES = [
  { value: "deposit", label: "Cash Deposit" },
  { value: "withdrawal", label: "Cash Withdrawal" },
  { value: "transfer", label: "Money Transfer" },
  { value: "bill_payment", label: "Bill Payment" },
  { value: "account_opening", label: "Account Opening" }
];

export const ALERT_TYPES = [
  { value: "fraud", label: "Fraud Alert" },
  { value: "compliance", label: "Compliance Issue" },
  { value: "system", label: "System Alert" }
];

export const ALERT_SEVERITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" }
];

export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" }
];

export const EDUCATION_OPTIONS = [
  { value: "10th", label: "10th Standard" },
  { value: "12th", label: "12th Standard" },
  { value: "graduate", label: "Graduate" },
  { value: "postgraduate", label: "Post Graduate" }
];

export const INDIAN_STATES = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" }
];

export const EXPORT_TYPES = [
  { value: "csps", label: "CSP Data" },
  { value: "transactions", label: "Transactions" },
  { value: "audits", label: "Audit Reports" },
  { value: "alerts", label: "Alert Records" },
  { value: "applications", label: "CSP Applications" },
  { value: "users", label: "System Users" } // Admin only
];

export const AUDIT_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" }
];

export const APPLICATION_STATUS_OPTIONS = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];

export const ALERT_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
  { value: "false_positive", label: "False Positive" }
];

export const MAP_CENTER = { lat: 20.5937, lng: 78.9629 }; // Center of India
export const DEFAULT_ZOOM = 5;
