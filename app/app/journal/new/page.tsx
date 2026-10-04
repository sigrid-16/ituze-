import { Suspense } from "react";
import { JournalComposer } from "@/components/journal/composer";

export default function NewJournalEntryPage() {
  return (
    <Suspense>
      <JournalComposer />
    </Suspense>
  );
}
