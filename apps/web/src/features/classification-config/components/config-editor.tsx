import {
  type ClassificationConfig,
  type ColorModel,
  type ConfigVersion,
  type RuleGroup,
  classificationConfig,
  type SubRule,
  wholeScale,
} from "@color-bank-hub/contracts/color-classification";
import { useState } from "react";
import { toast } from "sonner";
import type { MapView } from "@/components/shared/shade-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/date";
import { useActivateConfigVersion, useCreateConfigVersion } from "../hooks/config-version-mutations";
import { ConfigPreview } from "./config-preview";
import { RuleTable } from "./rule-table";

const tabs: { view: MapView; label: string }[] = [
  { view: "season", label: "By season" },
  { view: "color_family", label: "By color family" },
  { view: "hue_circle", label: "Hue circle" },
];

const groups = [
  { tab: "season", key: "season", title: "Season", hint: "The seasons are fixed. Change their cut-offs and their order." },
  {
    tab: "season",
    key: "undertone",
    title: "Undertone",
    hint: "Not drawn on the map. The undertones are fixed. Change their cut-offs and their order.",
  },
  {
    tab: "color_family",
    key: "colorFamily",
    title: "Color family",
    hint: "Columns of the map, in this order. The last rule must cover every hue, lightness and saturation: it takes the shades no other rule matched.",
  },
  {
    tab: "color_family",
    key: "valueClass",
    title: "Lightness rows",
    hint: "Rows of the map. A row starts where the row below ends (0–37, then 37–40). Shades in a gap between two rows get the last rule.",
  },
  { tab: "color_family", key: "chromaClass", title: "Chroma", hint: "Not drawn on the map." },
  { tab: "hue_circle", key: "hueMunsell", title: "Hue Munsell", hint: "Areas of the hue circle." },
] as const;

const models: Record<ColorModel, string> = { hsl: "HSL", lch: "LCh" };

/** The same group with every range written out: a range a rule leaves out becomes its whole scale, so the form has no empty box. */
function explicit(group: RuleGroup): RuleGroup {
  return { ...group, rules: group.rules.map((rule) => ({ ...wholeScale(group.model), ...rule })) };
}

interface Props {
  productFormatId: number;
  /** Name of the product format, to say what Save applies to. */
  formatName: string;
  /** Sub-categories of the category, for the preview. */
  items: { id: number; name: string }[];
  versions: ConfigVersion[];
}

/** Edits a copy of the active cut-offs. Saving adds a version; old versions are never changed. */
export function ConfigEditor({ productFormatId, formatName, items, versions }: Props) {
  const active = versions.find((version) => version.isActive) ?? versions[0];
  // The active rules as the form shows them. Sub rules are read in the color family's model.
  const saved: ClassificationConfig | undefined = active && {
    season: explicit(active.config.season),
    undertone: explicit(active.config.undertone),
    colorFamily: explicit(active.config.colorFamily),
    colorSub: (active.config.colorSub ?? []).map((rule) => ({ ...wholeScale(active.config.colorFamily.model), ...rule })),
    valueClass: explicit(active.config.valueClass),
    chromaClass: explicit(active.config.chromaClass),
    hueMunsell: explicit(active.config.hueMunsell),
  };
  const [draft, setDraft] = useState(saved);
  const [view, setView] = useState<MapView>("season");
  const [note, setNote] = useState("");
  // The checked rules waiting for the user's confirmation; null while the dialog is closed.
  const [pending, setPending] = useState<ClassificationConfig | null>(null);
  const create = useCreateConfigVersion();
  const activate = useActivateConfigVersion();
  // Rule objects are rebuilt on every edit with the same key order, so comparing their JSON is enough.
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  if (!draft || !active) return <p className="text-xs text-muted-foreground">This product format has no rules yet.</p>;

  function review() {
    // Same shape check as the API, so a missing label is caught before the confirmation.
    const parsed = classificationConfig.safeParse(draft);
    if (!parsed.success) return toast.error(`${parsed.error.issues[0].path.join(" › ")}: ${parsed.error.issues[0].message}`);
    setPending(parsed.data);
  }

  function save() {
    if (!pending) return;
    create.mutate(
      { productFormatId, config: pending, note: note || undefined },
      {
        onSuccess: () => {
          setNote("");
          setPending(null);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-medium">2. Rules to edit</p>
        <div className="flex">
          {tabs.map((tab, index) => (
            <Button
              key={tab.view}
              variant={view === tab.view ? "default" : "outline"}
              aria-pressed={view === tab.view}
              className={index === 0 ? "rounded-r-none" : index === tabs.length - 1 ? "-ml-px rounded-l-none" : "-ml-px rounded-none"}
              onClick={() => setView(tab.view)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Each tab shows one map and the rules it is drawn from.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,700px)]">
        <div className="xl:sticky xl:top-4 xl:self-start">
          <ConfigPreview items={items} view={view} draft={draft} active={active.config} dirty={dirty} />
        </div>
        <div className="space-y-5">
          {groups
            .filter((group) => group.tab === view)
            .map(({ key, title, hint }) => (
              <section key={key} className="overflow-x-auto rounded-md border bg-card">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
                  <div>
                    <h3 className="text-sm font-medium">{title}</h3>
                    <p className="text-[11px] text-muted-foreground">{hint}</p>
                  </div>
                  <Select value={draft[key].model} onValueChange={(model) => model && setDraft({ ...draft, [key]: { ...draft[key], model } })}>
                    <SelectTrigger size="sm" className="w-24" aria-label={`${title} color model`}>
                      <SelectValue>{() => models[draft[key].model]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(models).map(([model, name]) => (
                        <SelectItem key={model} value={model}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </header>
                <RuleTable
                  title={title}
                  model={draft[key].model}
                  fixed={key === "season" || key === "undertone"}
                  rules={draft[key].rules}
                  onChange={(rules) => setDraft({ ...draft, [key]: { ...draft[key], rules } })}
                />
                {key === "colorFamily" && (
                  <div className="border-t">
                    <p className="px-4 pt-3 text-[11px] text-muted-foreground">
                      Sub-columns (optional). Read in the color family model. A family without sub rules stays one column.
                    </p>
                    <RuleTable
                      title="Color sub"
                      model={draft.colorFamily.model}
                      families={[...new Set(draft.colorFamily.rules.map((rule) => rule.label))]}
                      rules={draft.colorSub ?? []}
                      onChange={(rules) => setDraft({ ...draft, colorSub: rules as SubRule[] })}
                    />
                  </div>
                )}
              </section>
            ))}

          <p className="text-[11px] text-muted-foreground">
            Saving applies the rules of all three tabs to <span className="font-medium text-foreground">{formatName}</span> only, and re-classifies
            its shades. Other product formats keep their own rules.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={review} disabled={!dirty}>
              Save rules for {formatName}
            </Button>
            <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(saved)}>
              Discard changes
            </Button>
          </div>
        </div>
      </div>

      {/* Saving re-labels every shade of the format, so it is confirmed first. */}
      <Dialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save rules for {formatName}?</DialogTitle>
            <DialogDescription>What happens when you save:</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            <li>All {formatName} shades are re-classified.</li>
            <li>Color Database and Shade Mapping show the new labels right away.</li>
            <li>Saved mappings do not change.</li>
            <li>To undo, activate an older version.</li>
          </ul>
          <div className="grid gap-1.5">
            <p className="text-xs font-medium">Note (optional)</p>
            <Input
              aria-label="Version note"
              placeholder="What changed and why"
              maxLength={255}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={create.isPending}>
              Save and re-classify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="rounded-md border bg-card">
        <h3 className="border-b px-4 py-2 text-sm font-medium">Versions</h3>
        <ul className="divide-y text-xs">
          {versions.map((version) => (
            <li key={version.id} className="flex flex-wrap items-center gap-3 px-4 py-2">
              <span className="font-medium">v{version.version}</span>
              <span className="text-muted-foreground">{formatDateTime(version.createdAt)}</span>
              <span className="flex-1 text-muted-foreground">{version.note}</span>
              {version.isActive ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Button size="xs" variant="outline" disabled={activate.isPending} onClick={() => activate.mutate(version.id)}>
                  Activate
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
