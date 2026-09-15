export const featureFlags = {
  AI_TEACHER_ENABLED: process.env.FEATURE_AI_TEACHER !== "false",
  ADAPTIVE_LEARNING_ENABLED: process.env.FEATURE_ADAPTIVE_LEARNING !== "false",
  AI_INTEGRITY_ENABLED: process.env.FEATURE_AI_INTEGRITY !== "false",
  PROGRAMMING_TASKS_ENABLED: process.env.FEATURE_PROGRAMMING !== "false",
  BILLING_ENABLED: process.env.FEATURE_BILLING === "true",
  UNDERSTANDING_CHECK_ENABLED: process.env.FEATURE_UNDERSTANDING_CHECK !== "false",
  PARENT_PORTAL_ENABLED: process.env.FEATURE_PARENT_PORTAL === "true",
  SSO_ENABLED: process.env.FEATURE_SSO === "true",
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
