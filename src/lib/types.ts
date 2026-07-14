export type ContactRank = 1 | 2 | 3 | 4 | 5;

export type FollowUpStatus = "scheduled" | "due_today" | "overdue" | "completed";

export type ActivityType =
  | "exchange"
  | "call"
  | "line"
  | "visit"
  | "proposal"
  | "quote"
  | "contract";

export type Activity = {
  id: string;
  date: string;
  type: ActivityType;
  title: string;
  detail: string;
  nextAction?: string;
};

export type SalesRecord = {
  projectName: string;
  amount: number;
  orderDate: string;
  status: "hearing" | "quoted" | "ordered" | "invoiced";
};

export type Contact = {
  id: string;
  companyName: string;
  personName: string;
  department: string;
  position: string;
  postalCode: string;
  address: string;
  email: string;
  phone: string;
  mobilePhone: string;
  fax: string;
  websiteUrl: string;
  instagramUrl: string;
  lineUrl: string;
  facebookUrl: string;
  memo: string;
  aiSummary: string[];
  tags: string[];
  customerRank: ContactRank;
  referrer: string;
  businessCategory: string;
  firstRegisteredAt: string;
  updatedAt: string;
  nextFollowUpDate: string;
  nextFollowUpType: string;
  followUpStatus: FollowUpStatus;
  exchangedAt: string;
  eventName: string;
  frontImageLabel: string;
  backImageLabel: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  ocrWarnings: { field: string; value: string; confidence: number }[];
  activities: Activity[];
  salesRecords: SalesRecord[];
};

export type DashboardMetrics = {
  totalCards: number;
  todayRegistered: number;
  monthRegistered: number;
  needFollowUp: number;
  nextVisits: number;
  dueToday: number;
  unreadThanks: number;
  ocrPending: number;
};

export type TagSummary = {
  name: string;
  count: number;
};
