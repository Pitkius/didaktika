import { Suspense } from "react";
import LearningSessionPage from "./session-client";

export default function LearningSessionRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500">Kraunama...</div>}>
      <LearningSessionPage />
    </Suspense>
  );
}
