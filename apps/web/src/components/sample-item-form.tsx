import { useForm } from "@tanstack/react-form";
import { useState } from "react";

export function SampleItemForm() {
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { title: "" },
    onSubmit: ({ value }) => setSubmittedTitle(value.title),
  });

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        TanStack Form example
      </h2>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? "Enter a sample title." : undefined,
          }}
        >
          {(field) => (
            <label className="flex flex-1 flex-col gap-1">
              <span className="sr-only">Sample title</span>
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Sample title"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-sm text-red-600">
                  {field.state.meta.errors.join(", ")}
                </span>
              )}
            </label>
          )}
        </form.Field>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit example"}
            </button>
          )}
        </form.Subscribe>
      </form>
      {submittedTitle && (
        <p className="mt-3 text-sm text-slate-600">
          Submitted locally: {submittedTitle}
        </p>
      )}
    </section>
  );
}
