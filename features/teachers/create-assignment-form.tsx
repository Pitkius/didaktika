"use client";

import { useActionState, useMemo, useState } from "react";
import { createAssignmentAction } from "@/features/teachers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssignmentType, AIAssistanceLevel } from "@prisma/client";
import { useRouter } from "next/navigation";
import { lt, tStatus } from "@/lib/i18n";
import { assignmentSecurityDefaults } from "@/config/assignment-security";

interface CreateAssignmentFormProps {
  classes: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
}

type ModePreset = "PRACTICE" | "HOMEWORK" | "TEST" | "EXAM";

const PRESET_LABELS: Record<ModePreset, string> = {
  PRACTICE: "practicePreset",
  HOMEWORK: "homeworkPreset",
  TEST: "testPreset",
  EXAM: "examPreset",
};

export function CreateAssignmentForm({ classes, subjects }: CreateAssignmentFormProps) {
  const router = useRouter();
  const [preset, setPreset] = useState<ModePreset>("HOMEWORK");
  const [type, setType] = useState<AssignmentType>("HOMEWORK");
  const defaults = useMemo(() => assignmentSecurityDefaults(preset), [preset]);

  const [aiAssistance, setAiAssistance] = useState<AIAssistanceLevel>(defaults.aiAssistance);
  const [integrityMonitoring, setIntegrityMonitoring] = useState(defaults.integrityMonitoring);
  const [showResultsImmediately, setShowResultsImmediately] = useState(
    defaults.showResultsImmediately
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    defaults.timeLimitMinutes?.toString() ?? ""
  );
  const [attemptsAllowed, setAttemptsAllowed] = useState(String(defaults.attemptsAllowed));

  function applyPreset(next: ModePreset) {
    setPreset(next);
    setType(next);
    const d = assignmentSecurityDefaults(next);
    setAiAssistance(d.aiAssistance);
    setIntegrityMonitoring(d.integrityMonitoring);
    setShowResultsImmediately(d.showResultsImmediately);
    setTimeLimitMinutes(d.timeLimitMinutes?.toString() ?? "");
    setAttemptsAllowed(String(d.attemptsAllowed));
  }

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createAssignmentAction({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        type: formData.get("type") as AssignmentType,
        classId: (formData.get("classId") as string) || undefined,
        subjectId: (formData.get("subjectId") as string) || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
        timeLimitMinutes: formData.get("timeLimitMinutes")
          ? parseInt(formData.get("timeLimitMinutes") as string, 10)
          : undefined,
        attemptsAllowed: formData.get("attemptsAllowed")
          ? parseInt(formData.get("attemptsAllowed") as string, 10)
          : 1,
        aiAssistance: (formData.get("aiAssistance") as AIAssistanceLevel) || "GUIDANCE",
        integrityMonitoring: formData.get("integrityMonitoring") === "on",
        showResultsImmediately: formData.get("showResultsImmediately") === "on",
      });
      if (result.success) {
        router.push("/teacher/assignments");
        return { success: true };
      }
      return { error: lt.teacher.createAssignmentFailed };
    },
    null
  );

  return (
    <form action={action} className="max-w-le space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}

      <div>
        <Label>{lt.teacher.assignmentMode}</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(PRESET_LABELS) as ModePreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`rounded-md border px-3 py-2 text-left text-sm ${
                preset === key
                  ? "border-brand-500 bg-brand-50 font-medium"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {lt.teacher[PRESET_LABELS[key] as keyof typeof lt.teacher] as string}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">{lt.teacher.assignmentModeHint}</p>
      </div>

      <div>
        <Label htmlFor="title">{lt.teacher.titleLabel}</Label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">{lt.common.description}</Label>
        <Input id="description" name="description" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="type">{lt.common.type}</Label>
        <select
          id="type"
          name="type"
          required
          value={type}
          onChange={(e) => {
            const v = e.target.value as AssignmentType;
            setType(v);
            if (v === "PRACTICE" || v === "HOMEWORK" || v === "TEST" || v === "EXAM") {
              applyPreset(v);
            } else {
              const d = assignmentSecurityDefaults("HOMEWORK");
              setPreset("HOMEWORK");
              setAiAssistance(d.aiAssistance);
              setIntegrityMonitoring(d.integrityMonitoring);
              setShowResultsImmediately(d.showResultsImmediately);
            }
          }}
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="PRACTICE">{tStatus("PRACTICE")}</option>
          <option value="HOMEWORK">{tStatus("HOMEWORK")}</option>
          <option value="ASSIGNMENT">{tStatus("ASSIGNMENT")}</option>
          <option value="TEST">{tStatus("TEST")}</option>
          <option value="EXAM">{tStatus("EXAM")}</option>
        </select>
      </div>
      <div>
        <Label htmlFor="classId">{lt.common.class}</Label>
        <select
          id="classId"
          name="classId"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="">{lt.common.noClass}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="subjectId">{lt.common.subject}</Label>
        <select
          id="subjectId"
          name="subjectId"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="">{lt.common.noSubject}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="dueDate">{lt.teacher.dueDate}</Label>
        <Input id="dueDate" name="dueDate" type="datetime-local" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimitMinutes">{lt.teacher.timeLimit}</Label>
          <Input
            id="timeLimitMinutes"
            name="timeLimitMinutes"
            type="number"
            min={1}
            className="mt-1"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="attemptsAllowed">{lt.teacher.attemptsAllowed}</Label>
          <Input
            id="attemptsAllowed"
            name="attemptsAllowed"
            type="number"
            min={1}
            className="mt-1"
            value={attemptsAllowed}
            onChange={(e) => setAttemptsAllowed(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="aiAssistance">{lt.teacher.aiAssistance}</Label>
        <select
          id="aiAssistance"
          name="aiAssistance"
          value={aiAssistance}
          onChange={(e) => setAiAssistance(e.target.value as AIAssistanceLevel)}
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="OFF">{tStatus("OFF")}</option>
          <option value="HINTS_ONLY">{tStatus("HINTS_ONLY")}</option>
          <option value="GUIDANCE">{tStatus("GUIDANCE")}</option>
          <option value="FULL_TUTORING">{tStatus("FULL_TUTORING")}</option>
        </select>
      </div>

      <div className="space-y-2 rounded-md border border-neutral-200 p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="integrityMonitoring"
            checked={integrityMonitoring}
            onChange={(e) => setIntegrityMonitoring(e.target.checked)}
          />
          {lt.teacher.integrityMonitoringToggle}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="showResultsImmediately"
            checked={showResultsImmediately}
            onChange={(e) => setShowResultsImmediately(e.target.checked)}
          />
          {lt.teacher.showResultsImmediatelyToggle}
        </label>
        <p className="text-xs text-neutral-500">{lt.teacher.secureModeTeacherHint}</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? lt.common.creating : lt.teacher.createAssignment}
      </Button>
    </form>
  );
}
