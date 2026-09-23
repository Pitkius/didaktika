import { PlanAudience, SubscriptionPlan, UsageMetric } from "@prisma/client";

export type PlanFeatureKey =
  | "AI_TEACHER"
  | "ADAPTIVE_LEARNING"
  | "BASIC_ANALYTICS"
  | "ADVANCED_ANALYTICS"
  | "STUDY_PLANS"
  | "MASTERY_MAP"
  | "EXAM_PREP"
  | "EXAM_SIMULATION"
  | "PROGRAMMING"
  | "UNDERSTANDING_CHECK"
  | "INTEGRITY"
  | "AI_GENERATOR"
  | "CLASS_MANAGEMENT"
  | "SCHOOL_ADMIN"
  | "SSO"
  | "API_ACCESS"
  | "MULTI_SCHOOL";

export type PlanPriceBasis = "per_user" | "per_org" | "custom";

export interface PlanDefinition {
  code: SubscriptionPlan;
  name: string;
  audience: PlanAudience;
  priceCents: number;
  seatsLimit: number | null;
  description: string;
  /** Short “kam skirtas” line for pricing cards */
  intendedFor: string;
  /** Marketing bullets — single source for /pricing and homepage */
  highlights: string[];
  priceBasis: PlanPriceBasis;
  /** Show in homepage pricing preview strip */
  homepage: boolean;
  sortOrder: number;
  features: PlanFeatureKey[];
  limits: Partial<Record<UsageMetric, number>>;
}

/**
 * Central plan matrix — seeded into DB; EntitlementService prefers DB values.
 * Pricing UI, homepage, marketing bullets and seats all read from here.
 *
 * Education ladder (seats ↑, admin ↑):
 * TEACHER → SMALL_SCHOOL → SCHOOL → SCHOOL_PLUS → ENTERPRISE
 */
export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    code: "FREE",
    name: "Nemokamas",
    audience: "INDIVIDUAL",
    priceCents: 0,
    seatsLimit: 1,
    description: "Individualiam mokiniui — išbandyti platformą ir DI mokymąsi",
    intendedFor: "Pavieniam mokiniui be mokyklos — išbandyti DI mokymąsi",
    highlights: [
      "1 mokinys",
      "DI mokytojas (50 žinučių / mėn.)",
      "DI užduotys: iki 3 dalykų × 3 temos",
      "100 sugeneruotų klausimų / mėn.",
      "Pagrindinė pažanga",
    ],
    priceBasis: "per_user",
    homepage: false,
    sortOrder: 1,
    features: ["AI_TEACHER", "ADAPTIVE_LEARNING", "BASIC_ANALYTICS"],
    limits: {
      AI_TEACHER_MESSAGES: 50,
      AI_QUESTION_GENERATION: 100,
      AI_STUDY_PLANS: 3,
      AI_GRADING: 200,
      AI_ANALYSIS: 50,
      AI_UNDERSTANDING_CHECKS: 10,
      AI_INTEGRITY_CHECKS: 0,
    },
  },
  {
    code: "PLUS",
    name: "Plus",
    audience: "INDIVIDUAL",
    priceCents: 799,
    seatsLimit: 1,
    description: "Aktyviam mokiniui — studijų planai ir meistriškumo žemėlapis",
    intendedFor: "Aktyviam savarankiškam mokiniui",
    highlights: [
      "1 mokinys",
      "500 DI žinučių / mėn.",
      "DI užduotys: iki 6 dalykų × 5 temos",
      "Studijų planai",
      "Meistriškumo žemėlapis",
      "Egzaminų pasiruošimas",
    ],
    priceBasis: "per_user",
    homepage: false,
    sortOrder: 2,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "STUDY_PLANS",
      "MASTERY_MAP",
      "EXAM_PREP",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 500,
      AI_QUESTION_GENERATION: 500,
      AI_STUDY_PLANS: 20,
      AI_GRADING: 2000,
      AI_ANALYSIS: 500,
      AI_UNDERSTANDING_CHECKS: 100,
      AI_INTEGRITY_CHECKS: 0,
    },
  },
  {
    code: "PRO",
    name: "Pro",
    audience: "INDIVIDUAL",
    priceCents: 1299,
    seatsLimit: 1,
    description: "Intensyviam mokymuisi ir egzaminams — didžiausi individualūs limitai",
    intendedFor: "Intensyviam mokymuisi / egzaminų sezonui",
    highlights: [
      "1 mokinys",
      "2000 DI žinučių / mėn.",
      "DI užduotys: iki 12 dalykų × 10 temų",
      "Egzaminų simuliacijos",
      "Programavimo užduotys (rengiama)",
      "Supratimo patikra",
    ],
    priceBasis: "per_user",
    homepage: false,
    sortOrder: 3,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "STUDY_PLANS",
      "MASTERY_MAP",
      "EXAM_PREP",
      "EXAM_SIMULATION",
      "PROGRAMMING",
      "UNDERSTANDING_CHECK",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 2000,
      AI_QUESTION_GENERATION: 2000,
      AI_STUDY_PLANS: 100,
      AI_GRADING: 10000,
      AI_ANALYSIS: 2000,
      AI_UNDERSTANDING_CHECKS: 500,
      AI_INTEGRITY_CHECKS: 0,
    },
  },
  {
    code: "TEACHER",
    name: "Mokytojas",
    audience: "EDUCATION",
    priceCents: 1900,
    seatsLimit: 50,
    description: "Individualiam mokytojui / vienai klasei — klasės, užduotys, DI generatorius",
    intendedFor: "1 mokytojas · 1 klasė · be mokyklos administravimo",
    highlights: [
      "Iki 50 mokinių",
      "1 mokytojas",
      "Klasės ir užduotys",
      "DI klausimų generatorius",
      "Pagrindinis sąžiningumo stebėjimas",
      "Klasių analitika",
    ],
    priceBasis: "per_org",
    homepage: true,
    sortOrder: 4,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "AI_GENERATOR",
      "CLASS_MANAGEMENT",
      "INTEGRITY",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 2000,
      AI_QUESTION_GENERATION: 1000,
      AI_STUDY_PLANS: 50,
      AI_GRADING: 5000,
      AI_ANALYSIS: 1000,
      AI_UNDERSTANDING_CHECKS: 200,
      AI_INTEGRITY_CHECKS: 100,
    },
  },
  {
    code: "SMALL_SCHOOL",
    name: "Maža mokykla",
    audience: "EDUCATION",
    priceCents: 6900,
    seatsLimit: 150,
    description: "Mažai mokyklai — mokytojų valdymas ir mokyklos administravimas",
    intendedFor: "Mažai mokyklai · keli mokytojai · iki 150 mokinių",
    highlights: [
      "Iki 150 mokinių",
      "Keli mokytojai",
      "Mokyklos administravimas",
      "DI generatorius",
      "Sąžiningumo stebėjimas",
      "Mokyklos analitika",
    ],
    priceBasis: "per_org",
    homepage: false,
    sortOrder: 5,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "STUDY_PLANS",
      "MASTERY_MAP",
      "AI_GENERATOR",
      "CLASS_MANAGEMENT",
      "INTEGRITY",
      "SCHOOL_ADMIN",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 10000,
      AI_QUESTION_GENERATION: 5000,
      AI_STUDY_PLANS: 200,
      AI_GRADING: 20000,
      AI_ANALYSIS: 5000,
      AI_UNDERSTANDING_CHECKS: 1000,
      AI_INTEGRITY_CHECKS: 500,
    },
  },
  {
    code: "SCHOOL",
    name: "Mokykla",
    audience: "EDUCATION",
    priceCents: 12900,
    seatsLimit: 500,
    description: "Vidutinei / didelei mokyklai — SSO ir pilnas administravimas",
    intendedFor: "Vidutinei / didelei mokyklai · iki 500 mokinių · SSO",
    highlights: [
      "Iki 500 mokinių",
      "Neriboti mokytojai",
      "Mokyklos administravimas",
      "SSO (rengiama)",
      "Sąžiningumo stebėjimas",
      "Audito žurnalas",
    ],
    priceBasis: "per_org",
    homepage: true,
    sortOrder: 6,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "STUDY_PLANS",
      "MASTERY_MAP",
      "EXAM_PREP",
      "AI_GENERATOR",
      "CLASS_MANAGEMENT",
      "INTEGRITY",
      "SCHOOL_ADMIN",
      "SSO",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 30000,
      AI_QUESTION_GENERATION: 12000,
      AI_STUDY_PLANS: 500,
      AI_GRADING: 50000,
      AI_ANALYSIS: 12000,
      AI_UNDERSTANDING_CHECKS: 3000,
      AI_INTEGRITY_CHECKS: 1000,
    },
  },
  {
    code: "SCHOOL_PLUS",
    name: "Mokykla Plus",
    audience: "EDUCATION",
    priceCents: 24900,
    seatsLimit: 1000,
    description: "Didesnei mokyklai — didesni AI limitai ir iki 1000 mokinių",
    intendedFor: "Didesnei mokyklai · iki 1000 mokinių · didesni AI limitai",
    highlights: [
      "Iki 1000 mokinių",
      "Viskas iš Mokykla plano",
      "Didesni DI limitai",
      "SSO (rengiama)",
      "Prioritetinė pagalba",
    ],
    priceBasis: "per_org",
    homepage: false,
    sortOrder: 7,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "STUDY_PLANS",
      "MASTERY_MAP",
      "EXAM_PREP",
      "UNDERSTANDING_CHECK",
      "AI_GENERATOR",
      "CLASS_MANAGEMENT",
      "INTEGRITY",
      "SCHOOL_ADMIN",
      "SSO",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 50000,
      AI_QUESTION_GENERATION: 20000,
      AI_STUDY_PLANS: 1000,
      AI_GRADING: 100000,
      AI_ANALYSIS: 20000,
      AI_UNDERSTANDING_CHECKS: 5000,
      AI_INTEGRITY_CHECKS: 2000,
    },
  },
  {
    code: "ENTERPRISE",
    name: "Įstaiga",
    audience: "EDUCATION",
    priceCents: 0,
    seatsLimit: null,
    description: "Rajonui / kelioms mokykloms — API, multi-mokykla, individualus pasiūlymas",
    intendedFor: "1000+ mokinių · kelios mokyklos · individualus pasiūlymas",
    highlights: [
      "Neriboti mokiniai",
      "Kelių mokyklų valdymas",
      "API / SCIM (rengiama)",
      "SSO (rengiama)",
      "Prioritetinė pagalba ir SLA",
    ],
    priceBasis: "custom",
    homepage: true,
    sortOrder: 8,
    features: [
      "AI_TEACHER",
      "ADAPTIVE_LEARNING",
      "BASIC_ANALYTICS",
      "ADVANCED_ANALYTICS",
      "AI_GENERATOR",
      "CLASS_MANAGEMENT",
      "INTEGRITY",
      "SCHOOL_ADMIN",
      "SSO",
      "API_ACCESS",
      "MULTI_SCHOOL",
      "EXAM_SIMULATION",
      "PROGRAMMING",
      "UNDERSTANDING_CHECK",
      "STUDY_PLANS",
      "MASTERY_MAP",
      "EXAM_PREP",
    ],
    limits: {
      AI_TEACHER_MESSAGES: 1_000_000,
      AI_QUESTION_GENERATION: 1_000_000,
      AI_STUDY_PLANS: 1_000_000,
      AI_GRADING: 1_000_000,
      AI_ANALYSIS: 1_000_000,
      AI_UNDERSTANDING_CHECKS: 1_000_000,
      AI_INTEGRITY_CHECKS: 1_000_000,
    },
  },
];

export function getPlanDefinition(code: SubscriptionPlan): PlanDefinition {
  const plan = PLAN_DEFINITIONS.find((p) => p.code === code);
  if (!plan) return PLAN_DEFINITIONS[0];
  return plan;
}

export function formatPlanPrice(plan: PlanDefinition): string {
  if (plan.priceBasis === "custom" || plan.code === "ENTERPRISE") return "Individuali";
  if (plan.priceCents === 0) return "€0";
  return `€${(plan.priceCents / 100).toFixed(plan.priceCents % 100 === 0 ? 0 : 2)}`;
}

export function formatSeatsLabel(plan: PlanDefinition): string {
  if (plan.seatsLimit == null) return "Neriboti mokiniai";
  if (plan.seatsLimit === 1) return "1 mokinys";
  return `Iki ${plan.seatsLimit} mokinių`;
}

export function getHomepagePlans(): PlanDefinition[] {
  return PLAN_DEFINITIONS.filter((p) => p.homepage).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getIndividualPlans(): PlanDefinition[] {
  return PLAN_DEFINITIONS.filter((p) => p.audience === "INDIVIDUAL");
}

export function getEducationPlans(): PlanDefinition[] {
  return PLAN_DEFINITIONS.filter((p) => p.audience === "EDUCATION");
}

/** Approximate € per seat for org plans (excludes ENTERPRISE). */
export function pricePerSeatCents(plan: PlanDefinition): number | null {
  if (plan.audience !== "EDUCATION" || !plan.seatsLimit || plan.priceCents <= 0) return null;
  return Math.round(plan.priceCents / plan.seatsLimit);
}
