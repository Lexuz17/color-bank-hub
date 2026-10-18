import { SampleItemList } from "@/components/sample-item-list";
import { SampleItemForm } from "@/components/sample-item-form";
import { useSampleItems } from "@/hooks/use-sample-items";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export function HomePage() {
  const { data: sampleItems = [], error, isLoading } = useSampleItems();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Starter workspace
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        Clean architecture starter
      </h1>
      <p className="mt-4 text-slate-600">
        These placeholder records come from{" "}
        <code className="rounded bg-slate-200 px-2 py-1 text-sm text-slate-800">
          GET /api/sample-items
        </code>
        .
      </p>
      {isLoading && (
        <p className="mt-8 text-slate-600">Loading sample items…</p>
      )}
      {error && <p className="mt-8 text-red-600">{error.message}</p>}
      {!isLoading && !error && <SampleItemList sampleItems={sampleItems} />}
      <SampleItemForm />
    </main>
  );
}
