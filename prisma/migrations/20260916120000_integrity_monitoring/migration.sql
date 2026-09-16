-- Secure assessment / integrity monitoring
CREATE TYPE "IntegrityEventType" AS ENUM ('TAB_HIDDEN', 'WINDOW_BLUR', 'PASTE', 'COPY', 'FOCUS_RETURN', 'CONTEXT_MENU');

ALTER TABLE "Assignment" ADD COLUMN "integrityMonitoring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assignment" ADD COLUMN "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "IntegrityEvent" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "IntegrityEventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrityEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrityEvent_submissionId_idx" ON "IntegrityEvent"("submissionId");
CREATE INDEX "IntegrityEvent_studentId_idx" ON "IntegrityEvent"("studentId");
CREATE INDEX "IntegrityEvent_type_idx" ON "IntegrityEvent"("type");
CREATE INDEX "IntegrityEvent_createdAt_idx" ON "IntegrityEvent"("createdAt");

ALTER TABLE "IntegrityEvent" ADD CONSTRAINT "IntegrityEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrityEvent" ADD CONSTRAINT "IntegrityEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing TEST/EXAM assignments get secure defaults
UPDATE "Assignment"
SET "integrityMonitoring" = true,
    "showResultsImmediately" = false,
    "aiAssistance" = 'OFF'
WHERE "type" IN ('TEST', 'EXAM');
