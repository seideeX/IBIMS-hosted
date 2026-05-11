import { Mars, Venus, VenusAndMars } from "lucide-react";

export const RESIDENT_CIVIL_STATUS_TEXT = {
    single: "Single",
    married: "Married",
    widowed: "Widowed",
    separated: "Separated",
    divorced: "Divorced",
    annulled: "Annulled",
};

export const RESIDENT_EMPLOYMENT_STATUS_TEXT = {
    employed: "Employed",
    unemployed: "Unemployed",
    student: "Student",
    child: "Child",
    retired: "Retired",
    homemaker: "Homemaker",
    not_applicable: "Not Applicable",
};

export const RESIDENT_GENDER_TEXT = {
    male: (
        <>
            <Mars className="inline-block mr-1 w-4 h-4" />
            Male
        </>
    ),
    female: (
        <>
            <Venus className="inline-block mr-1 w-4 h-4" />
            Female
        </>
    ),
    LGBTQ: (
        <>
            <VenusAndMars className="inline-block mr-1 w-4 h-4" />
            LGBTQA+
        </>
    ),
};

export const RESIDENT_GENDER_TEXT2 = {
    male: "Male",
    female: "Female",
    LGBTQ: "LGBTQ",
};

export const RESIDENT_GENDER_COLOR_CLASS = {
    male: "p-1 bg-blue-200 text-blue-800 rounded-lg",
    female: "p-1 bg-red-100 text-red-800 rounded-lg",
    LGBTQ: "bg-gradient-to-r from-pink-300 via-yellow-300 to-blue-300 text-black-400",
};

export const RESIDENT_ROLE_TEXT = {
    barangay_officer: "Barangay Officer",
    resident: "Resident",
    admin: "Administrator",
    super_admin: "Super Administrator",
};

export const RESIDENT_REGISTER_VOTER_TEXT = {
    0: "Not Eligible",
    1: "Eligible",
};
export const RESIDENT_REGISTER_VOTER_CLASS = {
    0: "p-1 bg-red-100 text-red-800 rounded-lg",
    1: "p-1 bg-green-200 text-green-800 rounded-lg",
};

export const RESIDENT_RECIDENCY_TYPE_TEXT = {
    permanent: "Permanent",
    temporary: "Temporary",
    immigrant: "Imigrant",
};
export const RESIDENT_4PS_TEXT = {
    0: "No",
    1: "Yes",
};

export const RESIDENT_SOLO_PARENT_TEXT = {
    0: "No",
    1: "Yes",
};

export const RESIDENT_REGISTER_VOTER_TEXT2 = {
    0: "No",
    1: "Yes",
};

export const RESIDENT_VOTING_STATUS_TEXT = {
    active: "Active",
    inactive: "Inactive",
    disqualified: "Disqualified",
    medical: "Medical",
    overseas: "Overseas",
    detained: "Detained",
    deceased: "Deceased",
};

export const SENIOR_LIVING_ALONE_TEXT = {
    0: "No",
    1: "Yes",
};

export const SENIOR_PESIONER_TEXT = {
    yes: "Yes",
    no: "No",
    pendeing: "Pending",
};

export const VEHICLE_OWNERSHIP_TEXT = {
    1: "Yes",
    0: "No",
};

export const VEHICLE_CLASS_TEXT = {
    private: "Private",
    public: "Public",
};

export const VEHICLE_USAGE_TEXT = {
    personal: "Personal",
    public_transport: "Public Transport",
    business_use: "Business Use",
};

export const VEHICLE_IS_REGISTERED_TEXT = {
    1: "Yes",
    0: "No",
};

export const VEHICLE_USAGE_STYLES = {
    personal: "bg-blue-100 text-blue-700",
    business_use: "bg-yellow-100 text-yellow-700",
    public_transport: "bg-green-100 text-green-700",
};

export const HOUSEHOLD_POSITION_TEXT = {
    primary: "Primary",
    extended: "Extended",
    boarder: "Boarder",
};

export const HOUSEHOLD_BATH_WASH_TEXT = {
    with_own_sink_and_bath: "With own sink and bath",
    with_own_sink_only: "With own sink only",
    with_own_bath_only: "With own bath only",
    shared_or_communal: "Shared or communa",
    none: "None",
};

export const HOUSEHOLD_TOILET_TYPE_TEXT = {
    water_sealed: "Water Sealed",
    compost_pit_toilet: "Compost pit toilet",
    shared_communal_public_toilet: "Shared communal public toilet",
    shared_or_communal: "Shared or communal",
    no_latrine: "No latrine",
};

export const HOUSEHOLD_ELECTRICITY_TYPE = {
    distribution_company_iselco_ii: "ISELCO II",
    generator: "Generator",
    solar_renewable_energy_source: "Solar / Renewable Energy Source",
    battery: "Battery",
    none: "None",
};

export const HOUSEHOLD_WATER_SOURCE_TEXT = {
    level_ii_water_system: "Level II Water System",
    level_iii_water_system: "Level III Water System",
    deep_well_level_i: "Deep Well Level I",
    artesian_well_level_i: "Artesian Well Level I",
    shallow_well_level_i: "Shallow Well Level I",
    commercial_water_refill_source: "Commercial Water Refill Source",
    none: "None",
};

export const HOUSEHOLD_WASTE_DISPOSAL_TEXT = {
    open_dump_site: "Open Dump Site",
    sanitary_landfill: "Sanitary Landfill",
    compost_pits: "Compost Pits",
    material_recovery_facility: "Material Recovery Facility",
    garbage_is_collected: "Garbage is Collected",
    none: "None",
};

export const HOUSEHOLD_INTERNET_TYPE_TEXT = {
    mobile_data: "Mobile Data",
    wireless_fidelity: "Wi-Fi",
    none: "None",
};

export const FAMILY_TYPE_TEXT = {
    nuclear: "Nuclear",
    single_parent: "Single-parent",
    extended: "Extended",
    stepfamilies: "Stepfamilies",
    grandparent: "Grandparent",
    childless: "Childless",
    cohabiting_partners: "Cohabiting Partners",
    one_person_household: "One-person Household",
    roommates: "Roommates",
    other: "Other",
};

export const RELATIONSHIP_TO_HEAD_TEXT = {
    self: "Self",
    spouse: "Spouse",
    child: "Child",
    sibling: "Sibling",
    parent: "Parent",
    grandparent: "Grandparent",
    other: "Other",
};

export const HOUSEHOLD_OWNERSHIP_TEXT = {
    owned: "Owned",
    rented: "Rented",
    shared: "Shared",
    government_provided: "Goverment-Provided",
    inherited: "Inherited",
    others: "Others",
};

export const HOUSEHOLD_STRUCTURE_TEXT = {
    concrete: "Concrete",
    semi_concrete: "Semi-concrete",
    wood: "Wood",
    makeshift: "Makeshift",
};

export const HOUSEHOLD_CONDITION_TEXT = {
    good: "Good",
    needs_repair: "Needs Repair",
    dilapidated: "Dilapidated",
};

export const HOUSING_CONDITION_COLOR = {
    good: "bg-green-100 text-green-800",
    dilapidated: "bg-red-100 text-red-800",
    needs_repair: "bg-yellow-100 text-yellow-800", // fallback or neutral option
};

export const PETS_PURPOSE_TEXT = {
    personal_consumption: "Personal Consumption",
    commercial: "Commercial",
    both: "Both",
};

export const PETS_VACCINE_TEXT = {
    0: "No",
    1: "Yes",
};

export const MEDICAL_SMOKE_TEXT = {
    0: "No",
    1: "Yes",
};

export const MEDICAL_ALCOHOL_TEXT = {
    0: "No",
    1: "Yes",
};

export const MEDICAL_PWD_TEXT = {
    0: "No",
    1: "Yes",
};

export const MEDICAL_PHILHEALTH_TEXT = {
    0: "No",
    1: "Yes",
};

export const EDUCATION_SCHOOL_TYPE = {
    public: "Public",
    private: "Private",
};

export const EDUCATION_LEVEL_TEXT = {
    no_formal_education: "No Formal Education",
    no_education_yet: "No Education Yet",
    prep_school: "Prep School",
    kindergarten: "Kindergarten",
    tesda: "TESDA",
    junior_high_school: "Junior High School",
    senior_high_school: "Senior High School",
    elementary: "Elementary",
    high_school: "High School",
    college: "College",
    post_graduate: "Post Graduate",
    vocational: "Vocational",
    als: "ALS (Alternative Learning System)",
};

export const EDUCATION_STATUS_TEXT = {
    graduated: "Graduated",
    enrolled: "Currently Enrolled",
    incomplete: "Incomplete",
    dropped_out: "Dropped Out",
};

export const EDUCATION_OSY_TEXT = {
    0: "No",
    1: "Yes",
};

export const EDUCATION_OSC_TEXT = {
    0: "No",
    1: "Yes",
};

export const EMPLOYMENT_TYPE_TEXT = {
    full_time: "Full Time",
    part_time: "Part Time",
    seasonal: "Seasonal",
    contractual: "Contractual",
    self_employed: "Self Employed",
};

export const OCCUPATION_STATUS_TEXT = {
    active: "Active",
    inactive: "Inactive",
    ended: "Ended",
    retired: "Retired",
};

export const OCCUPATION_IS_OFW_TEXT = {
    0: "No",
    1: "Yes",
};

export const OCCUPATION_IS_MAIN_SOURCE_TEXT = {
    0: "No",
    1: "Yes",
};

export const WORK_ARRANGEMENT_TEXT = {
    remote: "Remote",
    on_site: "Onsite",
    hybrid: "Hybrid",
};

export const INSTITUTION_STATUS_TEXT = {
    active: "Active",
    inactive: "Inactive",
    dissolved: "Dissolved",
};
export const INSTITUTION_TYPE_TEXT = {
    youth_org: "Youth Organization",
    coop: "Cooperative",
    religious: "Religious Group",
    farmers: "Farmers Association",
    transport: "Transport Group",
};

export const INCOME_CATEGORY_TEXT = {
    survival: "Survival",
    poor: "Poor",
    low_income: "Low Income",
    lower_middle_income: "Lower Middle Income",
    middle_income: "Middle Income",
    upper_middle_income: "Upper Middle Income",
    high_income: "High Income",
};

export const INCOME_BRACKET_TEXT = {
    poor: "Below ₱12,030",
    low_income_non_poor: "₱12,030 – ₱24,060",
    lower_middle_income: "₱24,061 – ₱48,120",
    middle_middle_income: "₱48,121 – ₱84,210",
    upper_middle_income: "₱84,211 – ₱144,360",
    upper_income: "₱144,361 – ₱240,600",
    rich: "₱240,601 and above",
};

export const INCOME_BRACKETS = {
    poor: {
        label: "Poor",
        className: "bg-red-100 text-red-700",
    },
    low_income_non_poor: {
        label: "Low Income (Non-Poor)",
        className: "bg-orange-100 text-orange-700",
    },
    lower_middle_income: {
        label: "Lower Middle Income",
        className: "bg-yellow-100 text-yellow-700",
    },
    middle_middle_income: {
        label: "Middle Income",
        className: "bg-lime-100 text-lime-700",
    },
    upper_middle_income: {
        label: "Upper Middle Income",
        className: "bg-green-100 text-green-700",
    },
    upper_income: {
        label: "Upper Income",
        className: "bg-emerald-100 text-emerald-700",
    },
    rich: {
        label: "Rich",
        className: "bg-blue-100 text-blue-700",
    },
};

export const CERTIFICATE_REQUEST_STATUS_TEXT = {
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
    issued: "Issued",
};

export const CERTIFICATE_REQUEST_STATUS_CLASS = {
    pending: "bg-yellow-100 p-1 rounded-lg text-yellow-800",
    approved: "bg-blue-100 p-1 rounded-lg text-blue-800",
    denied: "bg-red-100 p-1 rounded-lg text-red-800",
    issued: "bg-green-100 p-1 rounded-lg text-green-800",
};

export const BARANGAY_OFFICIAL_POSITIONS_TEXT = {
    barangay_captain: "Barangay Captain",
    barangay_secretary: "Barangay Secretary",
    barangay_treasurer: "Barangay Treasurer",
    barangay_kagawad: "Barangay Kagawad",
    sk_chairman: "SK Chairman",
    sk_kagawad: "SK Kagawad",
    health_worker: "Health Worker",
    tanod: "Tanod",
};

export const BARANGAY_OFFICIAL_POSITIONS_CLASS = {
    barangay_captain: "bg-blue-100 text-blue-800",
    barangay_secretary: "bg-purple-100 text-purple-800",
    barangay_treasurer: "bg-yellow-100 text-yellow-800",
    councilor: "bg-green-100 text-green-800",
    sk_chairman: "bg-pink-100 text-pink-800",
    sk_member: "bg-indigo-100 text-indigo-800",
    health_worker: "bg-teal-100 text-teal-800",
    tanod: "bg-red-100 text-red-800",
};

export const BMI_STATUS = {
    normal: "Normal",
    underweight: "Underweight",
    severely_underweight: "Severly Underweight",
    overweight: "Overweight",
    obese: "Obese",
};

export const BLOOD_TYPE_OPTIONS = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
];

export const PROJECT_STATUS_CLASS = {
    ongoing:
        "bg-purple-100 px-2 py-1 rounded-lg text-purple-800 text-xs font-medium",
    planning:
        "bg-yellow-100 px-2 py-1 rounded-lg text-yellow-800 text-xs font-medium",
    completed:
        "bg-green-100 px-2 py-1 rounded-lg text-green-800 text-xs font-medium",
    cancelled:
        "bg-red-100 px-2 py-1 rounded-lg text-red-800 text-xs font-medium",
};

export const PROJECT_STATUS_TEXT = {
    ongoing: "On-going",
    planning: "Planning",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const ROAD_TYPE_TEXT = {
    asphalt: "Asphalt",
    concrete: "Concrete",
    natural_earth_surface: "Natural Earth Surface",
    gravel: "Gravel",
};

export const FACILITY_TYPE_TEXT = [
    { value: "government", label: "Government" },
    { value: "protection", label: "Protection" },
    { value: "security", label: "Security" },
    { value: "finance", label: "Finance" },
    { value: "service", label: "Service" },
    { value: "commerce", label: "Commerce" },
];

export const MEDICAL_CONDITION_STATUSES = {
    active: "Active",
    resolved: "Resolved",
    chronic: "Chronic",
};
export const MEDICAL_CONDITION_STATUS_STYLES = {
    active: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded",
    resolved: "bg-green-100 text-green-800 px-2 py-1 rounded",
    chronic: "bg-red-100 text-red-800 px-2 py-1 rounded",
    default: "bg-gray-100 text-gray-800 px-2 py-1 rounded",
};

export const PREGNANCY_STATUSES = {
    ongoing: "Ongoing",
    delivered: "Delivered",
    miscarried: "Miscarried",
    aborted: "Aborted",
};

export const PREGNANCY_STATUS_STYLES = {
    ongoing: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded",
    delivered: "bg-green-100 text-green-800 px-2 py-1 rounded",
    miscarried: "bg-red-100 text-red-800 px-2 py-1 rounded",
    aborted: "bg-purple-100 text-purple-800 px-2 py-1 rounded",
    default: "bg-gray-100 text-gray-800 px-2 py-1 rounded",
};

export const BLOTTER_REPORT_STATUS = {
    pending: "Pending",
    on_going: "On Going",
    resolved: "Resolved",
    elevated: "Elevated",
};

export const TAKE_STATUS_CLASS = {
    pending:
        "bg-yellow-100 px-2 py-1 rounded-lg text-yellow-800 text-xs font-medium",
    attended:
        "bg-green-100 px-2 py-1 rounded-lg text-green-800 text-xs font-medium",
    missed: "bg-red-100 px-2 py-1 rounded-lg text-red-800 text-xs font-medium",
    rescheduled:
        "bg-purple-100 px-2 py-1 rounded-lg text-purple-800 text-xs font-medium",
};

export const TAKE_STATUS_TEXT = {
    pending: "Pending",
    attended: "Attended",
    missed: "Missed",
    rescheduled: "Rescheduled",
};

// Summon overall status
export const SUMMON_STATUS_CLASS = {
    arbitration:
        "bg-yellow-100 px-2 py-1 rounded-lg text-yellow-800 text-xs font-medium",
    medication:
        "bg-blue-100 px-2 py-1 rounded-lg text-blue-800 text-xs font-medium",
    conciliation:
        "bg-purple-100 px-2 py-1 rounded-lg text-purple-800 text-xs font-medium",
    issued_file_to_action:
        "bg-orange-100 px-2 py-1 rounded-lg text-orange-800 text-xs font-medium",
    closed: "bg-green-100 px-2 py-1 rounded-lg text-green-800 text-xs font-medium",
};

export const SUMMON_STATUS_TEXT = {
    arbitration: "Arbitration",
    medication: "Medication",
    conciliation: "Conciliation",
    issued_file_to_action: "Issued Certificate to File Action",
    closed: "Closed",
};
export const SESSION_STATUS_CLASS = {
    scheduled:
        "bg-blue-100 px-2 py-1 rounded-lg text-blue-800 text-xs font-medium",
    in_progress:
        "bg-yellow-100 px-2 py-1 rounded-lg text-yellow-800 text-xs font-medium",
    completed:
        "bg-green-100 px-2 py-1 rounded-lg text-green-800 text-xs font-medium",
    adjourned:
        "bg-purple-100 px-2 py-1 rounded-lg text-purple-800 text-xs font-medium",
    cancelled:
        "bg-gray-100 px-2 py-1 rounded-lg text-gray-800 text-xs font-medium",
    no_show: "bg-red-100 px-2 py-1 rounded-lg text-red-800 text-xs font-medium",
};

export const SESSION_STATUS_TEXT = {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    adjourned: "Adjourned",
    cancelled: "Cancelled",
    no_show: "No Show",
};

export const SPECIFIC_PURPOSE_TEXT = {
    certification: "Certification",
    blotter: "Blotter Report Generation",
    summon: "Summon Report Generation",
    file_action: "Certificate to File Action",
};

export const ACCOUNT_ROLE_TEXT = {
    barangay_officer: "Barangay Officer",
    resident: "Resident",
};

export const ACTION_TYPE_COLORS = {
    // CRUD (lowercase + uppercase fallback)
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",

    // Other actions
    generate: "bg-purple-100 text-purple-800",
    issue: "bg-teal-100 text-teal-800",
    deny: "bg-rose-100 text-rose-800",

    // Authentication events
    "logged in": "bg-indigo-100 text-indigo-800",
    "logged out": "bg-gray-100 text-gray-800",
    "access denied": "bg-red-50 text-red-700",

    // Default fallback
    default: "bg-gray-100 text-gray-800",
};
