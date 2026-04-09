export const INDUSTRIES = [
  "Information Technology",
  "Software SaaS",
  "IT Services & Consulting",
  "Banking",
  "Financial Services",
  "Insurance",
  "FinTech",
  "Healthcare",
  "Hospitals & Clinics",
  "Pharmaceuticals",
  "Biotechnology",
  "Medical Devices",
  "Education",
  "EdTech",
  "E-learning",
  "Government Public Sector",
  "Defense",
  "Telecommunications",
  "E-commerce",
  "Retail",
  "Wholesale & Distribution",
  "FMCG",
  "Food & Beverages",
  "Hospitality",
  "Travel & Tourism",
  "Aviation",
  "Transportation",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Automobile",
  "Auto Components",
  "Electronics",
  "Electricals",
  "Consumer Durables",
  "Construction",
  "Real Estate",
  "Infrastructure",
  "Energy",
  "Power",
  "Oil & Gas",
  "Renewable Energy",
  "Mining",
  "Chemicals",
  "Textiles",
  "Garments / Apparel",
  "Agriculture",
  "AgriTech",
  "Dairy",
  "Media & Entertainment",
  "Advertising & Marketing",
  "Gaming",
  "Sports",
  "Legal Services",
  "Accounting / Audit",
  "HR / Staffing",
  "Recruitment",
  "BPO / Call Center",
  "KPO",
  "Security Services",
  "NGO / Non-Profit",
  "Beauty & Wellness",
  "Fitness",
  "Luxury Goods",
  "Startups",
  "Other",
] as const;


export const JOB_CATEGORIES = [
  // --- Delivery / Logistics ---
  "Delivery Boy",
  "Courier Executive",
  "E-commerce Delivery Executive",
  "Warehouse Associate",
  "Picker / Packer",
  "Loader / Unloader",
  "Inventory Executive",
  "Store Keeper",
  "Logistics Coordinator",

  // --- Driving / Transport ---
  "Driver",
  "Cab Driver",
  "Truck Driver",
  "Bus Driver",
  "Tempo Driver",
  "Auto Driver",
  "Delivery Driver",
  "Driver + Helper",

  // --- Sales / Business ---
  "Field Sales Executive",
  "Sales Executive",
  "Inside Sales Executive",
  "Retail / Counter Sales",
  "B2B Sales Executive",
  "Business Development Executive (BDE)",
  "Relationship Manager",
  "Marketing Executive",
  "Promoter",

  // --- Calling / Support ---
  "Telecaller",
  "Customer Support Executive",
  "Call Center Executive",
  "Chat Support Executive",
  "Back Office Executive",
  "Data Entry Operator",

  // --- Office / Admin ---
  "Receptionist",
  "Front Office Executive",
  "Office Boy",
  "Office Assistant",
  "Admin Executive",
  "HR Executive",
  "HR Recruiter",

  // --- Finance ---
  "Accountant",
  "Accounts Executive",
  "Billing Executive",
  "Cashier",

  // --- Housekeeping / Facility ---
  "Housekeeping",
  "Housekeeping Supervisor",
  "Cleaner",
  "Office Cleaner",

  // --- Security ---
  "Security Guard",
  "Bouncer",
  "Watchman",

  // --- Hotel / Restaurant ---
  "Waiter",
  "Captain",
  "Kitchen Helper",
  "Cook",
  "Chef",
  "Barista",
  "Dish Washer",
  "Restaurant Manager",

  // --- Manufacturing / Labour ---
  "Helper / Labour",
  "Factory Worker",
  "Machine Operator",
  "Technician",
  "Supervisor",
  "Quality Checker",
  "Welder",
  "Electrician",
  "Plumber",
  "Carpenter",

  // --- Construction ---
  "Construction Worker",
  "Mason",
  "Painter",
  "Tile Fitter",
  "Steel Fixer",

  // --- Healthcare ---
  "Nurse",
  "Ward Boy",
  "Pharmacist",
  "Lab Technician",
  "Receptionist (Hospital)",

  // --- Education ---
  "Teacher",
  "Tutor",
  "Office Staff (School)",

  // --- IT / Digital ---
  "Computer Operator",
  "IT Support",
  "Web Developer",
  "Graphic Designer",
  "Digital Marketing Executive",

  // --- Beauty / Salon ---
  "Beautician",
  "Hair Stylist",
  "Salon Manager",

  // --- Others ---
  "Other",
] as const;



export const EXPERIENCE_OPTIONS = ["Any Fresher", "Only Fresher", "Only Experienced", "0-1 Year", "1-3 Years", "3+ Years"] as const;

export const GENDER_PREFERENCE = ["Any", "Male Only", "Female Only"] as const;

export const ENGLISH_REQUIRED = ["Not Required", "Basic English", "Good English"] as const;

export const TIMINGS = ["Day Shift", "Night Shift", "Rotational Shift", "Flexible Timing"] as const;

export const URGENCY = ["Immediately (1-7 days)", "Within 1-2 weeks", "Can wait (1 month+)", "Urgent - Today/Tomorrow"] as const;


export type JobCategories = (typeof JOB_CATEGORIES)[number];
export type EXPERIENCE_OPTIONS = (typeof EXPERIENCE_OPTIONS)[number];
export type ENGLISH_REQUIRED = (typeof ENGLISH_REQUIRED)[number];
export type TIMINGS = (typeof TIMINGS)[number];
export type URGENCY = (typeof URGENCY)[number];



export type IndustryType = (typeof INDUSTRIES)[number];
