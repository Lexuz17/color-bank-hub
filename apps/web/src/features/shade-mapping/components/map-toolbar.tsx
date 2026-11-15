import { SquarePen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type AxisKey, axes, axisKeys } from "@/components/shared/map-axes";
import type { MapView } from "@/components/shared/shade-map";

interface Props {
  name: string;
  onNameChange: (name: string) => void;
  view: MapView;
  onViewChange: (view: MapView) => void;
  axisX: AxisKey;
  axisY: AxisKey;
  /** Applies the axes and switches to the custom view. */
  onAxesChange: (axisX: AxisKey, axisY: AxisKey) => void;
  showPhoto: boolean;
  onShowPhotoChange: (showPhoto: boolean) => void;
  showScale: boolean;
  onShowScaleChange: (showScale: boolean) => void;
}

const templates: { view: MapView; label: string }[] = [
  { view: "season", label: "By season" },
  { view: "color_family", label: "By color family" },
  { view: "hue_circle", label: "Hue circle" },
];

export function MapToolbar(props: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ x: props.axisX, y: props.axisY });

  return (
    <div className="flex items-center justify-between gap-3 overflow-x-auto border-b bg-card px-5 py-3">
      <Input
        aria-label="Mapping name"
        value={props.name}
        maxLength={255}
        onChange={(event) => props.onNameChange(event.target.value)}
        className="h-8 max-w-56 min-w-20 flex-1 text-sm font-medium"
      />
      <div className="flex shrink-0 items-center gap-2">
        <Label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          photo
          <Switch size="sm" checked={props.showPhoto} onCheckedChange={props.onShowPhotoChange} />
        </Label>
        <Label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          scale
          <Switch size="sm" checked={props.showScale} onCheckedChange={props.onShowScaleChange} />
        </Label>
        <div className="ml-2 flex">
          {templates.map((template, index) => (
            <Button
              key={template.view}
              size="sm"
              variant={props.view === template.view ? "default" : "outline"}
              aria-pressed={props.view === template.view}
              className={index === 0 ? "rounded-r-none" : index === templates.length - 1 ? "-ml-px rounded-l-none" : "-ml-px rounded-none"}
              onClick={() => props.onViewChange(template.view)}
            >
              {template.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant={props.view === "custom" ? "default" : "outline"}
          aria-pressed={props.view === "custom"}
          onClick={() => {
            setDraft({ x: props.axisX, y: props.axisY });
            setOpen(true);
          }}
        >
          <SquarePen />
          Customize Axis
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Axis</DialogTitle>
            <DialogDescription>Pick the color value for each axis.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {(["x", "y"] as const).map((side) => (
              <div key={side} className="grid gap-1.5">
                <p className="font-medium">{side === "x" ? "Horizontal Axis" : "Vertical Axis"}</p>
                <Select value={draft[side]} onValueChange={(value) => value && setDraft({ ...draft, [side]: value as AxisKey })}>
                  <SelectTrigger className="w-full" aria-label={side === "x" ? "Horizontal Axis" : "Vertical Axis"}>
                    <SelectValue>{() => axes[draft[side]].label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {axisKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {axes[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                props.onAxesChange(draft.x, draft.y);
                setOpen(false);
              }}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
