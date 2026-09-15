import { redirect } from "next/navigation";

export default async function SubjectLearnRedirectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  redirect(`/student/learn/session?subjectId=${subjectId}`);
}
