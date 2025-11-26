import { Suspense } from "react";
import SubjectClient from "./SubjectClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SubjectClient />
    </Suspense>
  );
}
