"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PLATFORM_CURRICULUM } from "@/config/curriculum";
import type { SelfStudyLimits } from "@/config/self-study";
import {
  saveSelfStudySelectionsAction,
  startSelfStudyPracticeAction,
} from "@/features/students/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/lib/i18n";
import { Check, Sparkles } from "lucide-react";

type LabeledSelection = {
  subjectKey: string;
  subjectName: string;
  color: string;
  topics: { key: string; name: string }[];
};

type PracticeItem = {
  id: string;
  title: string;
  statusLabel: string;
  href: string;
};

type Props = {
  limits: SelfStudyLimits;
  planName: string;
  initialSelections: { subjectKey: string; topicKeys: string[] }[];
  labeled: LabeledSelection[];
  practices: PracticeItem[];
};

export function SelfStudyAssignments({
  limits,
  planName,
  initialSelections,
  labeled,
  practices,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(initialSelections.length === 0);
  const [draft, setDraft] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const sel of initialSelections) map[sel.subjectKey] = [...sel.topicKeys];
    return map;
  });
  const [pending, startTransition] = useTransition();
  const [startingKey, setStartingKey] = useState<string | null>(null);

  const selectedSubjectCount = Object.keys(draft).filter(
    (k) => (draft[k]?.length ?? 0) > 0
  ).length;

  const upgradeHint =
    limits.maxSubjects <= 3
      ? lt.student.selfStudyUpgradeHint
      : null;

  function toggleSubject(subjectKey: string) {
    setDraft((prev) => {
      const next = { ...prev };
      if (next[subjectKey]?.length) {
        delete next[subjectKey];
        return next;
      }
      if (Object.keys(next).length >= limits.maxSubjects) {
        toast.error(
          lt.student.selfStudySubjectLimit.replace(
            "{count}",
            String(limits.maxSubjects)
          )
        );
        return prev;
      }
      next[subjectKey] = [];
      return next;
    });
  }

  function toggleTopic(subjectKey: string, topicKey: string) {
    setDraft((prev) => {
      if (!(subjectKey in prev) && Object.keys(prev).length >= limits.maxSubjects) {
        toast.error(
          lt.student.selfStudySubjectLimit.replace(
            "{count}",
            String(limits.maxSubjects)
          )
        );
        return prev;
      }
      const current = prev[subjectKey] ? [...prev[subjectKey]] : [];
      const idx = current.indexOf(topicKey);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        if (current.length >= limits.maxTopicsPerSubject) {
          toast.error(
            lt.student.selfStudyTopicLimit.replace(
              "{count}",
              String(limits.maxTopicsPerSubject)
            )
          );
          return prev;
        }
        current.push(topicKey);
      }
      return { ...prev, [subjectKey]: current };
    });
  }

  const payload = useMemo(
    () =>
      Object.entries(draft)
        .filter(([, topics]) => topics.length > 0)
        .map(([subjectKey, topicKeys]) => ({ subjectKey, topicKeys })),
    [draft]
  );

  function handleSave() {
    startTransition(async () => {
      const result = await saveSelfStudySelectionsAction(payload);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(lt.student.selfStudySaved);
      setEditing(false);
      router.refresh();
    });
  }

  function handleStart(subjectKey: string, topicKey: string) {
    const key = `${subjectKey}:${topicKey}`;
    setStartingKey(key);
    startTransition(async () => {
      const result = await startSelfStudyPracticeAction({ subjectKey, topicKey });
      setStartingKey(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.assignmentId) {
        router.push(`/student/assignments/${result.assignmentId}`);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{lt.nav.student.assignments}</h1>
          <p className="mt-1 text-neutral-500">{lt.student.selfStudyDesc}</p>
          <p className="mt-1 text-xs text-neutral-400">
            {lt.student.selfStudyPlanLine
              .replace("{plan}", planName)
              .replace("{subjects}", String(limits.maxSubjects))
              .replace("{topics}", String(limits.maxTopicsPerSubject))}
          </p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            {lt.student.selfStudyEdit}
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{lt.student.selfStudyPickTitle}</CardTitle>
            <p className="text-sm text-neutral-500">
              {lt.student.selfStudyPickHint
                .replace("{subjects}", String(limits.maxSubjects))
                .replace("{topics}", String(limits.maxTopicsPerSubject))}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {PLATFORM_CURRICULUM.map((subject) => {
              const selected = subject.key in draft;
              const topicCount = draft[subject.key]?.length ?? 0;
              return (
                <div key={subject.key} className="space-y-3 border-b border-neutral-100 pb-5 last:border-0">
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject.key)}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left ${
                      selected
                        ? "border-brand-500 bg-brand-50"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {selected
                        ? `${topicCount}/${limits.maxTopicsPerSubject}`
                        : lt.student.selfStudyAddSubject}
                    </span>
                  </button>
                  {selected && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {subject.topics.map((topic) => {
                        const on = draft[subject.key]?.includes(topic.key);
                        return (
                          <button
                            key={topic.key}
                            type="button"
                            onClick={() => toggleTopic(subject.key, topic.key)}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${
                              on
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            {on && <Check className="h-3.5 w-3.5" />}
                            {topic.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSave} disabled={pending || payload.length === 0}>
                {pending ? lt.common.saving : lt.student.selfStudySave}
              </Button>
              {initialSelections.length > 0 && (
                <Button
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    setEditing(false);
                    const map: Record<string, string[]> = {};
                    for (const sel of initialSelections) map[sel.subjectKey] = [...sel.topicKeys];
                    setDraft(map);
                  }}
                >
                  {lt.common.cancel}
                </Button>
              )}
              <span className="text-sm text-neutral-500">
                {selectedSubjectCount}/{limits.maxSubjects} {lt.student.subjects.toLowerCase()}
              </span>
            </div>
            {upgradeHint && (
              <p className="text-sm text-neutral-500">
                {upgradeHint}{" "}
                <Link href="/student/billing" className="font-medium text-brand-600 hover:underline">
                  {lt.student.selfStudyUpgradeCta}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {labeled.map((subject) => (
              <Card key={subject.subjectKey}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.subjectName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {subject.topics.map((topic) => {
                    const key = `${subject.subjectKey}:${topic.key}`;
                    const busy = pending && startingKey === key;
                    return (
                      <div
                        key={topic.key}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-100 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{topic.name}</p>
                          <p className="text-xs text-neutral-500">
                            {lt.student.selfStudyAiPractice}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleStart(subject.subjectKey, topic.key)}
                          disabled={pending}
                        >
                          <Sparkles className="mr-1 h-4 w-4" />
                          {busy ? lt.common.loading : lt.student.selfStudyStart}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {practices.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{lt.student.selfStudyHistory}</h2>
              {practices.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{p.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{p.statusLabel}</Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={p.href}>{lt.common.view}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
