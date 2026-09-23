"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { lt, tStatus } from "@/lib/i18n";
import { InviteStudentForm } from "@/features/teachers/invite-student-form";

interface ClassMember {
  id: string;
  user: { firstName: string; lastName: string; email: string };
}

interface ClassAssignment {
  id: string;
  title: string;
  type: string;
  status: string;
  dueDate: Date | null;
  _count: { submissions: number };
}

interface ClassDetailTabsProps {
  classId: string;
  className: string;
  description: string | null;
  subjectName: string | null;
  joinCode: string;
  memberCount: number;
  assignmentCount: number;
  members: ClassMember[];
  assignments: ClassAssignment[];
}

const tabs = [
  { id: "overview" as const, label: lt.teacher.tabOverview },
  { id: "students" as const, label: lt.teacher.tabStudents },
  { id: "assignments" as const, label: lt.teacher.tabAssignments },
];

export function ClassDetailTabs({
  classId,
  className,
  description,
  subjectName,
  joinCode,
  memberCount,
  assignmentCount,
  members,
  assignments,
}: ClassDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{className}</h1>
        <p className="text-neutral-500">
          {lt.teacher.classDetailMeta
            .replace("{subject}", subjectName ?? lt.common.noSubject)
            .replace("{students}", String(memberCount))
            .replace("{assignments}", String(assignmentCount))}
        </p>
      </div>

      <div className="flex gap-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-le border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">{lt.common.students}</p>
            <p className="text-2xl font-semibold">{memberCount}</p>
          </div>
          <div className="rounded-le border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">{lt.teacher.assignments}</p>
            <p className="text-2xl font-semibold">{assignmentCount}</p>
          </div>
          <div className="rounded-le border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">{lt.teacher.joinCode}</p>
            <p className="text-lg font-mono font-semibold">{joinCode}</p>
          </div>
          {description && (
            <div className="col-span-full rounded-le border border-neutral-200 bg-white p-4">
              <p className="text-sm text-neutral-500">{lt.common.description}</p>
              <p className="mt-1 text-neutral-700">{description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "students" && (
        <div className="rounded-le border border-neutral-200 bg-white">
          {members.length === 0 ? (
            <p className="py-12 text-center text-neutral-500">{lt.teacher.noStudentsEnrolled}</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{m.user.firstName} {m.user.lastName}</p>
                    <p className="text-sm text-neutral-500">{m.user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-neutral-200 p-4">
            <InviteStudentForm classId={classId} />
          </div>
        </div>
      )}

      {activeTab === "assignments" && (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="py-12 text-center text-neutral-500">{lt.teacher.noClassAssignments}</p>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-le border border-neutral-200 bg-white p-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-neutral-500">
                    {lt.teacher.classAssignmentMeta
                      .replace("{type}", tStatus(a.type))
                      .replace("{count}", String(a._count.submissions))}
                    {a.dueDate && ` · ${lt.common.due} ${new Date(a.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <Badge variant={a.status === "PUBLISHED" ? "success" : "secondary"}>
                  {tStatus(a.status)}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
