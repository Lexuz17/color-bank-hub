import type { DataInputIssue, DataInputPreviewRow } from "@color-bank-hub/contracts/data-input";
import { ShadeSwatch } from "@/components/shared/workspace-components";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TemplateRow } from "../utils/read-template";

interface Props {
  rows: TemplateRow[];
  preview?: DataInputPreviewRow[];
  errors: DataInputIssue[][];
}

const labelVariants = ["warm", "neutral", "cool", "spring", "summer", "autumn", "winter"] as const;
type LabelVariant = (typeof labelVariants)[number];
const isLabelVariant = (value: string | null | undefined): value is LabelVariant => labelVariants.includes(value as LabelVariant);

export function PreviewTable({ rows, preview, errors: errorsByRow, onlyErrors }: Props & { onlyErrors: boolean }) {
  const shown = rows.map((row, index) => ({ row, index })).filter(({ index }) => !onlyErrors || errorsByRow[index].length > 0);

  return (
    <div className="max-h-96 overflow-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="w-12">Row</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Shade</TableHead>
            <TableHead>Sub</TableHead>
            <TableHead>Auto</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map(({ row, index }) => {
            const checked = preview?.[index];
            const errors = errorsByRow[index];
            const warnings = checked?.warnings ?? [];
            const computed = checked?.computed;
            return (
              <TableRow key={index} className="align-top text-xs">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  {row.display.brand}
                  {computed?.isNewBrand && (
                    <Badge variant="info" className="ml-1.5">
                      New
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {row.display.productName}
                  {computed?.isNewProduct && (
                    <Badge variant="info" className="ml-1.5">
                      New
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    {/^#[\da-f]{6}$/i.test(row.display.hex) && <ShadeSwatch hex={row.display.hex} />}
                    {row.display.shadeName}
                  </span>
                </TableCell>
                <TableCell>{row.display.subCategoryCode}</TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1">
                    {computed?.colorFamily && <Badge variant="secondary">{computed.colorFamily}</Badge>}
                    {isLabelVariant(computed?.undertone) && (
                      <Badge variant={computed.undertone} className="capitalize">
                        {computed.undertone}
                      </Badge>
                    )}
                    {isLabelVariant(computed?.season) && (
                      <Badge variant={computed.season} className="capitalize">
                        {computed.season}
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="space-y-0.5">
                  {checked && errors.length === 0 && <Badge variant="success">Valid</Badge>}
                  {errors.map((error) => (
                    <p key={`${error.path}-${error.reason}-${error.message}`} className="text-destructive">
                      {error.path ? `${error.path}: ` : ""}
                      {error.message}
                    </p>
                  ))}
                  {warnings.map((warning) => (
                    <p key={`${warning.path}-${warning.reason}`} className="text-warning-foreground">
                      {warning.message}
                    </p>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
