import type { DataInputCommitResponse, DataInputIssue } from "@color-bank-hub/contracts/data-input";
import { checkUpload } from "@color-bank-hub/contracts/upload";
import { Link } from "@tanstack/react-router";
import { Download, FileSpreadsheet, ImageIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/components/shared/request-feedback";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiError } from "@/lib/api-error";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { useCommitDataInput, usePreviewDataInput } from "../hooks/data-input-mutations";
import { readTemplate, type TemplateRow } from "../utils/read-template";
import { PreviewTable } from "./preview-table";

const UPLOAD_PARALLEL = 4;
const lower = (value: string) => value.toLowerCase();

const dropzoneClass =
  "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed bg-muted/50 p-5 text-center text-xs text-muted-foreground hover:bg-muted";

export function UploadPanel() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [readError, setReadError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [uploaded, setUploaded] = useState<number | null>(null);
  const [done, setDone] = useState<DataInputCommitResponse | null>(null);
  const preview = usePreviewDataInput();
  const commit = useCommitDataInput();

  // Photos are matched to the sheet by file name, ignoring upper/lower case.
  const photoByName = new Map(photos.map((photo) => [lower(photo.name), photo]));
  const wanted = new Set(rows.flatMap((row) => [row.lipPhotoFile, row.swatchPhotoFile]).flatMap((name) => (name ? [lower(name)] : [])));
  const errors: DataInputIssue[][] = rows.map((row, index) => {
    const missing = [
      ["lipPhotoFile", row.lipPhotoFile],
      ["swatchPhotoFile", row.swatchPhotoFile],
    ].flatMap(([path, name]) =>
      name && !photoByName.has(lower(name))
        ? [{ path: path as string, reason: "PHOTO_FILE_MISSING", message: `Photo "${name}" was not added in step 2` }]
        : [],
    );
    return [...row.issues, ...missing, ...(preview.data?.rows[index]?.errors ?? [])];
  });
  const photoProblem = (photo: File) => {
    const name = lower(photo.name);
    if (photos.filter((other) => lower(other.name) === name).length > 1) return "Added twice";
    if (rows.length > 0 && !wanted.has(name)) return "No row uses this file name";
    return checkUpload("shade-photo", { contentType: photo.type, size: photo.size });
  };

  const isBusy = preview.isPending || commit.isPending || uploaded !== null;
  const errorCount = errors.filter((list) => list.length > 0).length;
  const hasPhotoProblems = photos.some((photo) => photoProblem(photo));
  const canImport = !!preview.data?.valid && errorCount === 0 && !hasPhotoProblems && !isBusy;

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    clear();
    setFileName(file.name);
    const result = await readTemplate(file);
    if ("error" in result) return setReadError(result.error);
    setRows(result.rows);
    preview.mutate({ rows: result.rows.map((row) => row.data) });
  }

  function clear() {
    setFileName(null);
    setRows([]);
    setReadError(null);
    setPhotos([]);
    setDone(null);
    preview.reset();
    commit.reset();
  }

  function addPhotos(selected: FileList | null) {
    setPhotos((current) => [...current, ...Array.from(selected ?? [])]);
  }

  async function importRows() {
    // Photos go to storage only now, after every row is valid, so a wrong Excel leaves nothing behind.
    const keys = new Map<string, string>();
    const queue = [...wanted];
    let count = 0;
    setUploaded(0);
    try {
      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_PARALLEL, queue.length) }, async () => {
          for (let name = queue.shift(); name; name = queue.shift()) {
            const photo = photoByName.get(name);
            if (photo) keys.set(name, await uploadFile(photo, "shade-photo"));
            setUploaded(++count);
          }
        }),
      );
    } catch (error) {
      setUploaded(null);
      toast.error(apiError(error));
      return;
    }
    setUploaded(null);
    commit.mutate(
      {
        rows: rows.map((row) => ({
          ...row.data,
          lipPhotoKey: row.lipPhotoFile ? keys.get(lower(row.lipPhotoFile)) : undefined,
          swatchPhotoKey: row.swatchPhotoFile ? keys.get(lower(row.swatchPhotoFile)) : undefined,
        })),
      },
      {
        onSuccess: (result) => {
          clear();
          setDone(result);
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      {done && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-success p-4 text-xs text-success-foreground">
          <p>
            {done.imported} shades imported · {done.createdBrands} new brands · {done.createdProducts} new products
          </p>
          <Link to="/color-database" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-card")}>
            Open Color Database
          </Link>
        </section>
      )}

      <section className="space-y-3 rounded-lg bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium">Step 1 · Excel file</h2>
            <p className="text-[11px] text-muted-foreground">Fill the template, one row per shade. Nothing is saved until every row is valid.</p>
          </div>
          <a href="/templates/shade-import-template.xlsx" download className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
            <Download className="size-3.5" />
            Download template (.xlsx)
          </a>
        </div>
        <label
          className={dropzoneClass}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!isBusy) void chooseFile(event.dataTransfer.files[0]);
          }}
        >
          <FileSpreadsheet className="size-7" />
          {fileName ?? "Drop your Excel file here"}
          <span className="rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">Browse file</span>
          <span className="text-[10px]">.xlsx from the template, up to 500 rows</span>
          <input
            type="file"
            hidden
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={isBusy}
            onChange={(event) => {
              void chooseFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {readError && <p className="text-xs text-destructive">{readError}</p>}
        {preview.isError && <ApiError error={preview.error} />}
      </section>

      <section className="space-y-3 rounded-lg bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-medium">Step 2 · Photos</h2>
          <p className="text-[11px] text-muted-foreground">
            Optional. Add the images named in "Lip Photo File" and "Swatch Photo File" (JPEG, PNG or WebP, 5 MB each). File names must match.
          </p>
        </div>
        <label
          className={dropzoneClass}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!isBusy) addPhotos(event.dataTransfer.files);
          }}
        >
          <ImageIcon className="size-7" />
          Drop your photos here
          <span className="rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">Browse photos</span>
          <input
            type="file"
            multiple
            hidden
            accept="image/jpeg,image/png,image/webp"
            disabled={isBusy}
            onChange={(event) => {
              addPhotos(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {photos.length > 0 && (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {photos.map((photo, index) => {
              const problem = photoProblem(photo);
              return (
                <li key={`${photo.name}-${index}`} className="flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1 text-xs">
                  <span className="min-w-0">
                    <span className="block truncate">{photo.name}</span>
                    {problem && <span className="block text-[11px] text-destructive">{problem}</span>}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${photo.name}`}
                    disabled={isBusy}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setPhotos((current) => current.filter((_, other) => other !== index))}
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {rows.length > 0 && (
        <section className="space-y-3 rounded-lg bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Preview</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">{rows.length} rows</Badge>
              {preview.data && (
                <>
                  <Badge variant={errorCount === 0 ? "success" : "destructive"}>{errorCount === 0 ? "All valid" : `${errorCount} with errors`}</Badge>
                  {preview.data.newBrandCount > 0 && <Badge variant="info">{preview.data.newBrandCount} new brands</Badge>}
                  {preview.data.newProductCount > 0 && <Badge variant="info">{preview.data.newProductCount} new products</Badge>}
                </>
              )}
              <label className="flex items-center gap-1.5">
                <Checkbox checked={onlyErrors} onCheckedChange={(value) => setOnlyErrors(value === true)} />
                Errors only
              </label>
            </div>
          </div>
          {preview.isPending && <p className="text-xs text-muted-foreground">Checking rows…</p>}
          <PreviewTable rows={rows} preview={preview.data?.rows} errors={errors} onlyErrors={onlyErrors} />
          <div className="flex items-center justify-end gap-2">
            {uploaded !== null && (
              <span className="mr-auto text-xs text-muted-foreground">
                Uploading photos {uploaded}/{wanted.size}…
              </span>
            )}
            <Button variant="outline" disabled={isBusy} onClick={clear}>
              Clear
            </Button>
            <Button disabled={!canImport} onClick={() => void importRows()}>
              {commit.isPending ? "Importing…" : `+ Import ${rows.length} shades`}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
