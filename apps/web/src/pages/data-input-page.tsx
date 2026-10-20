import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  ImageUpload,
  ShadeSwatch,
} from "@/components/shared/workspace-components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function DataInputPage() {
  const [hex, setHex] = useState("#aa6d78");
  const [paste, setPaste] = useState("");
  const [rows, setRows] = useState<string[][]>([]);
  return (
    <PageShell section="Data Input">
      <PageToolbar
        title="Data Input"
        description="Prepare shade data · local preview"
      />
      <div className="p-5">
        <Tabs defaultValue="manual">
          <div className="overflow-x-auto border-b">
            <TabsList
              variant="line"
              className="h-10! w-max justify-start gap-1 rounded-none p-0"
            >
              <TabsTrigger
                className="h-10 flex-none px-4 after:bottom-0!"
                value="paste"
              >
                Paste from Excel
              </TabsTrigger>
              <TabsTrigger
                className="h-10 flex-none px-4 after:bottom-0!"
                value="upload"
              >
                File Upload
              </TabsTrigger>
              <TabsTrigger
                className="h-10 flex-none px-4 after:bottom-0!"
                value="manual"
              >
                Manual Entry
              </TabsTrigger>
              <TabsTrigger
                className="h-10 flex-none px-4 after:bottom-0!"
                value="manage"
              >
                Manage Database
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="manual">
            <form
              className="mt-4 w-full space-y-5 rounded-md border bg-card p-5"
              onSubmit={(event) => {
                event.preventDefault();
                toast.info("Shade validated", {
                  description:
                    "Database import is not connected. This is a local form preview.",
                });
              }}
            >
              <h2 className="text-sm font-medium">Basic information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {["Brand", "Product name", "Shade name", "SKU"].map((label) => (
                  <label key={label} className="grid gap-2 text-xs">
                    {label}
                    <Input required name={label} />
                  </label>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUpload label="Photo on lips" />
                <ImageUpload label="Swatch photo" />
              </div>
              <h2 className="text-sm font-medium">Color input</h2>
              <label className="grid gap-2 text-xs">
                HEX code
                <div className="flex items-center gap-3">
                  <Input
                    value={hex}
                    onChange={(event) => setHex(event.target.value)}
                    pattern="#[0-9a-fA-F]{6}"
                    title="Enter a six-digit HEX code"
                    required
                  />
                  <ShadeSwatch hex={hex} />
                </div>
              </label>
              <label className="grid gap-2 text-xs">
                Full ingredients
                <Textarea required />
              </label>
              <Button type="submit">Validate shade</Button>
            </form>
          </TabsContent>
          <TabsContent value="paste">
            <div className="mt-4 w-full space-y-4 rounded-md border bg-card p-5">
              <h2 className="text-sm font-medium">Paste from Excel</h2>
              <p className="text-xs text-muted-foreground">
                Paste tab-separated rows: brand, product, shade, HEX. Preview
                only; imports are not connected.
              </p>
              <Textarea
                aria-label="Spreadsheet data"
                rows={7}
                value={paste}
                onChange={(event) => setPaste(event.target.value)}
                placeholder={"2aN\tGlaze Bouncing Tint\t01 Nudy Coco\t#fc8877"}
              />
              <Button
                disabled={!paste.trim()}
                onClick={() =>
                  setRows(
                    paste
                      .trim()
                      .split(/\r?\n/)
                      .map((row) => row.split("\t")),
                  )
                }
              >
                Preview data
              </Button>
              {!!rows.length && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        {["Brand", "Product", "Shade", "HEX", "Validation"].map(
                          (name) => (
                            <th key={name} className="border-b p-2 text-left">
                              {name}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {row.slice(0, 4).map((cell, index) => (
                            <td key={index} className="border-b p-2">
                              {cell}
                            </td>
                          ))}
                          <td className="p-2">
                            {row.length === 4 && /^#[0-9a-f]{6}$/i.test(row[3])
                              ? "Valid"
                              : "Check columns / HEX"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <div className="mt-4 flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed bg-card p-8 text-center">
              <h2 className="text-sm font-medium">Upload tab-separated data</h2>
              <p className="text-xs text-muted-foreground">
                Choose a .tsv file to load it into Paste from Excel for preview.
              </p>
              <Input
                className="max-w-md"
                aria-label="Upload TSV file"
                type="file"
                accept=".tsv,text/tab-separated-values"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Choose a file under 5 MB");
                    return;
                  }
                  try {
                    setPaste(await file.text());
                    toast.info(
                      "File loaded. Open Paste from Excel to preview.",
                    );
                  } catch {
                    toast.error("Unable to read file");
                  }
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="manage">
            <Alert className="mt-4">
              <AlertDescription>
                Browse the shared database on its dedicated page.{" "}
                <Link to="/color-database" className="text-primary underline">
                  Open Color Database
                </Link>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
