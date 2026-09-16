/** Pure security defaults — safe to import from client components. */

export type AssignmentSecurityDefaults = {
  aiAssistance: "OFF" | "HINTS_ONLY" | "GUIDANCE" | "FULL_TUTORING";
  integrityMonitoring: boolean;
  showResultsImmediately: boolean;
  attemptsAllowed: number;
  timeLimitMinutes: number | undefined;
};

/** Defaults for practice vs graded secure assessments */
export function assignmentSecurityDefaults(type: string): AssignmentSecurityDefaults {
  if (type === "TEST" || type === "EXAM") {
    return {
      aiAssistance: "OFF",
      integrityMonitoring: true,
      showResultsImmediately: false,
      attemptsAllowed: 1,
      timeLimitMinutes: type === "EXAM" ? 90 : 45,
    };
  }
  if (type === "PRACTICE") {
    return {
      aiAssistance: "GUIDANCE",
      integrityMonitoring: false,
      showResultsImmediately: true,
      attemptsAllowed: 99,
      timeLimitMinutes: undefined,
    };
  }
  // HOMEWORK / ASSIGNMENT
  return {
    aiAssistance: "HINTS_ONLY",
    integrityMonitoring: false,
    showResultsImmediately: true,
    attemptsAllowed: 1,
    timeLimitMinutes: undefined,
  };
}

export const EVENT_WEIGHTS = {
  TAB_HIDDEN: 0.12,
  WINDOW_BLUR: 0.1,
  PASTE: 0.22,
  COPY: 0.08,
  FOCUS_RETURN: 0.02,
  CONTEXT_MENU: 0.05,
} as const;

export type IntegrityEventTypeKey = keyof typeof EVENT_WEIGHTS;

export function scoreIntegrityEvents(
  events: Array<{ type: IntegrityEventTypeKey | string }>
): { riskScore: number; riskLevel: "LOW" | "MEDIUM" | "HIGH"; indicators: string[] } {
  const counts = events.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  let raw = 0;
  const indicators: string[] = [];

  for (const [type, count] of Object.entries(counts)) {
    const weight = EVENT_WEIGHTS[type as IntegrityEventTypeKey] ?? 0.05;
    raw += Math.min(count, 8) * weight;
    if (count > 0) indicators.push(`${type}:${count}`);
  }

  const leaveEvents = (counts.TAB_HIDDEN ?? 0) + (counts.WINDOW_BLUR ?? 0);
  if (leaveEvents >= 5) indicators.push("frequent_tab_switching");
  if ((counts.PASTE ?? 0) >= 2) indicators.push("multiple_pastes");
  if ((counts.PASTE ?? 0) >= 1 && leaveEvents >= 2) {
    indicators.push("leave_and_paste_pattern");
    raw += 0.15;
  }

  const riskScore = Math.min(1, Math.round(raw * 100) / 100);
  const riskLevel = riskScore >= 0.65 ? "HIGH" : riskScore >= 0.35 ? "MEDIUM" : "LOW";

  return { riskScore, riskLevel, indicators };
}
