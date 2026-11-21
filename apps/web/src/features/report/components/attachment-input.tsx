import { uploadRules } from "@color-bank-hub/contracts/upload";
import { ImageIcon, FileTextIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { apiError } from "@/lib/api-error";
import { uploadFile } from "@/lib/upload";

const MAX_FILES = 5;
const { types } = uploadRules["report-attachment"];

interface Props {
  onChange: (keys: string[]) => void;
}

// Uploads each file straight to storage and reports the stored keys.
export function AttachmentInput({ onChange }: Props) {
  const [files, setFiles] = useState<{ key: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = files.length >= MAX_FILES;

  const change = (next: typeof files) => {
    setFiles(next);
    onChange(next.map((file) => file.key));
  };

  async function add(selected: FileList | null) {
    setError(null);
    setIsUploading(true);
    let next = files;
    try {
      for (const file of Array.from(selected ?? []).slice(0, MAX_FILES - files.length)) {
        next = [...next, { key: await uploadFile(file, "report-attachment"), name: file.name }];
        change(next);
      }
    } catch (uploadError) {
      setError(apiError(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label
        className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border bg-muted/50 p-4 text-center text-xs font-normal text-muted-foreground hover:bg-muted"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!isFull && !isUploading) void add(event.dataTransfer.files);
        }}
      >
        <span className="flex gap-2">
          <ImageIcon className="size-6" />
          <FileTextIcon className="size-6" />
        </span>
        {isUploading ? "Uploading…" : "Drop your files here"}
        <span className="rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">Browse file</span>
        <span className="text-[10px]">Images or PDF, up to {MAX_FILES} files, 10 MB each</span>
        <input
          type="file"
          multiple
          hidden
          accept={types.join(",")}
          disabled={isUploading || isFull}
          onChange={(event) => {
            void add(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {files.map((file) => (
        <div key={file.key} className="flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1 text-xs">
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            className="text-muted-foreground hover:text-foreground"
            onClick={() => change(files.filter((item) => item.key !== file.key))}
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
