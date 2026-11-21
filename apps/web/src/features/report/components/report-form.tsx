import type { Priority } from "@color-bank-hub/contracts/common";
import {
  type CreateReportRequest,
  createReportRequest,
  reportIssueLabels,
  reportIssueType,
  type ReportIssueType,
} from "@color-bank-hub/contracts/report";
import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { useBrands } from "@/api/brands/brand-queries";
import { useProducts } from "@/api/products/product-queries";
import { useShades } from "@/api/shades/shade-queries";
import { SearchSelect } from "@/components/shared/search-select";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateReport } from "../hooks/report-mutations";
import { AttachmentInput } from "./attachment-input";

const priorities: Priority[] = ["low", "medium", "high"];

// Nothing is chosen at first: the pickers stay undefined, which the schema treats as absent.
const defaultValues: Partial<CreateReportRequest> = { description: "", priority: "medium", attachmentKeys: [] };

export function ReportForm() {
  const create = useCreateReport();
  // Changing the key clears the attachment list after a successful submit.
  const [formKey, setFormKey] = useState(0);
  const form = useForm({
    defaultValues,
    validators: { onSubmit: createReportRequest },
    onSubmit: ({ value }) =>
      create.mutate(createReportRequest.parse(value), {
        onSuccess: () => {
          form.reset();
          setFormKey((key) => key + 1);
        },
      }),
  });

  const { issueType, brandId, productId } = useStore(form.store, (state) => state.values);
  const brands = useBrands();
  const products = useProducts();
  const shades = useShades({ productId, pageSize: 100 }, !!productId);

  const brandOptions: [string, string][] = (brands.data ?? []).map((brand) => [brand.id, brand.name]);
  const productOptions: [string, string][] = (products.data ?? [])
    .filter((product) => product.brandId === brandId)
    .map((product) => [product.id, product.name]);
  const shadeOptions: [string, string, string][] = (shades.data?.items ?? []).map((shade) => [
    shade.id,
    shade.sku ? `${shade.name} · ${shade.sku}` : shade.name,
    shade.hex,
  ]);

  return (
    <form
      className="space-y-5 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="issueType">
        {(field) => (
          <div className="grid gap-1.5 text-xs font-medium">
            Issue type
            <Select value={field.state.value ?? null} onValueChange={(value) => value && field.handleChange(value as ReportIssueType)}>
              <SelectTrigger aria-label="Issue type" className="w-full">
                <SelectValue placeholder="Select issue type">
                  {(value: ReportIssueType | null) => (value ? reportIssueLabels[value] : null)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reportIssueType.options.map((type) => (
                  <SelectItem key={type} value={type}>
                    {reportIssueLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <div className="grid gap-1.5 text-xs font-medium">
        <div className="flex items-center justify-between">
          Brand
          {brandId && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                form.setFieldValue("brandId", undefined);
                form.setFieldValue("productId", undefined);
                form.setFieldValue("shadeId", undefined);
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <SearchSelect
          value={brandId ?? null}
          placeholder="Select brand"
          options={brandOptions}
          className="h-8"
          onChange={(value) => {
            form.setFieldValue("brandId", value);
            form.setFieldValue("productId", undefined);
            form.setFieldValue("shadeId", undefined);
          }}
        />
      </div>

      <div className="grid gap-1.5 text-xs font-medium">
        Product
        <SearchSelect
          value={productId ?? null}
          placeholder="Select product"
          options={productOptions}
          disabled={!brandId}
          className="h-8"
          onChange={(value) => {
            form.setFieldValue("productId", value);
            form.setFieldValue("shadeId", undefined);
          }}
        />
      </div>

      <form.Field name="shadeId">
        {(field) => (
          <div className="grid gap-1.5 text-xs font-medium">
            Shade
            <SearchSelect
              value={field.state.value ?? null}
              placeholder="Select shade"
              options={shadeOptions}
              disabled={!productId}
              className="h-8"
              onChange={field.handleChange}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <label className="grid gap-1.5 text-xs font-medium">
            Description
            <Textarea
              rows={5}
              maxLength={20000}
              placeholder="Describe the issue clearly…"
              aria-invalid={field.state.meta.errors.length > 0}
              value={field.state.value ?? ""}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            {field.state.meta.errors[0] && <span className="text-[11px] font-normal text-destructive">{field.state.meta.errors[0]?.message}</span>}
          </label>
        )}
      </form.Field>

      <div className="grid gap-1.5 text-xs font-medium">
        Attachments
        <form.Field name="attachmentKeys">{(field) => <AttachmentInput key={formKey} onChange={field.handleChange} />}</form.Field>
      </div>

      <form.Field name="priority">
        {(field) => (
          <div className="grid gap-1.5 text-xs font-medium">
            Priority
            <div className="flex gap-2">
              {priorities.map((priority) => (
                <Button
                  key={priority}
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex-1 capitalize",
                    field.state.value === priority && "border-primary bg-primary/10 text-primary hover:bg-primary/10",
                  )}
                  onClick={() => field.handleChange(priority)}
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      <Button type="submit" size="lg" className="w-full" disabled={create.isPending || !issueType}>
        {create.isPending ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
