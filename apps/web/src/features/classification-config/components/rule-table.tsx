import { type ClassRule, type ColorModel, rangeKeys, type SubRule, scaleMax, wholeScale } from "@color-bank-hub/contracts/color-classification";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Rule = ClassRule & Partial<Pick<SubRule, "family">>;

interface Props {
  title: string;
  /** Sets the top of the saturation scale. */
  model: ColorModel;
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
  /** Sub rules only: the families a rule can belong to. Adds the Family column. */
  families?: string[];
  /** Season and undertone: the labels are a fixed list, so rules cannot be added, removed or renamed. Only cut-offs and order change. */
  fixed?: boolean;
}

const names = { hue: "Hue", lightness: "Lightness", saturation: "Saturation / Chroma" };

/** One number of a range. Always holds a value: an emptied box goes back to what it had when the cursor leaves it. */
function NumberBox({ label, value, top, onChange }: { label: string; value: number; top: number; onChange: (value: number) => void }) {
  // Text being typed; null when the box is not being edited, so outside changes (reorder, discard) show through.
  const [text, setText] = useState<string | null>(null);
  return (
    <Input
      type="number"
      min={0}
      max={top}
      aria-label={label}
      className="h-7 w-14 px-1.5 text-xs"
      value={text ?? value}
      onChange={(event) => {
        setText(event.target.value);
        // Kept inside the scale: a hue of 371 would silently mean 11.
        if (event.target.value !== "") onChange(Math.min(top, Math.max(0, Number(event.target.value))));
      }}
      onBlur={() => setText(null)}
    />
  );
}

/** Rules of one label group. The order matters: the first rule that matches a shade wins. */
export function RuleTable({ title, model, rules, onChange, families, fixed }: Props) {
  // A new rule accepts everything (every range is the whole scale) until the user narrows it.
  const blank: Rule = { ...(families && { family: families[0] ?? "" }), label: "", ...wholeScale(model) };

  function update(index: number, changes: Partial<Rule>) {
    onChange(rules.map((rule, at) => (at === index ? { ...rule, ...changes } : rule)));
  }

  function swap(index: number, other: number) {
    const next = [...rules];
    [next[index], next[other]] = [next[other], next[index]];
    onChange(next);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          {families && <TableHead>Family</TableHead>}
          <TableHead>Label</TableHead>
          {rangeKeys.map((key) => (
            <TableHead key={key}>{names[key]}</TableHead>
          ))}
          <TableHead className="text-right">
            {!fixed && (
              <Button size="xs" variant="outline" onClick={() => onChange([...rules, blank])}>
                <Plus />
                Add rule
              </Button>
            )}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule, index) => (
          // Rules have no id and can repeat a label, so the position is their key.
          <TableRow key={index}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            {families && (
              <TableCell>
                <Select value={rule.family} onValueChange={(family) => family && update(index, { family })}>
                  <SelectTrigger size="sm" className="w-28" aria-label={`${title} rule ${index + 1} family`}>
                    <SelectValue>{() => rule.family || "–"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            )}
            <TableCell>
              {fixed ? (
                <span className="font-medium capitalize">{rule.label}</span>
              ) : (
                <Input
                  aria-label={`${title} rule ${index + 1} label`}
                  className="h-7 w-24 text-xs"
                  maxLength={60}
                  value={rule.label}
                  onChange={(event) => update(index, { label: event.target.value })}
                />
              )}
            </TableCell>
            {rangeKeys.map((key) => {
              const top = scaleMax(key, model);
              // Min and max are always filled. The whole scale (0 to its top) means the rule does not narrow this number.
              const range = rule[key] ?? { min: 0, max: top };
              const name = `${title} rule ${index + 1} ${names[key]}`;
              return (
                <TableCell key={key}>
                  <div className="flex items-center gap-1">
                    <NumberBox label={`${name} min`} value={range.min} top={top} onChange={(min) => update(index, { [key]: { ...range, min } })} />–
                    <NumberBox label={`${name} max`} value={range.max} top={top} onChange={(max) => update(index, { [key]: { ...range, max } })} />
                  </div>
                </TableCell>
              );
            })}
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button size="xs" variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => swap(index, index - 1)}>
                  <ArrowUp />
                </Button>
                <Button size="xs" variant="ghost" aria-label="Move down" disabled={index === rules.length - 1} onClick={() => swap(index, index + 1)}>
                  <ArrowDown />
                </Button>
                {!fixed && (
                  <Button size="xs" variant="ghost" aria-label="Remove rule" onClick={() => onChange(rules.filter((_, at) => at !== index))}>
                    <Trash2 />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
