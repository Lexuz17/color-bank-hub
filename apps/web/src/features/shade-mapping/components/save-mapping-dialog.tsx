import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  initialName: string;
  initialNotes: string;
  saving: boolean;
  onSave: (name: string, notes: string) => void;
  onClose: () => void;
}

export function SaveMappingDialog({ initialName, initialNotes, saving, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName);
  const [notes, setNotes] = useState(initialNotes);
  const complete = name.trim() !== "" && notes.trim() !== "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save mapping</DialogTitle>
          <DialogDescription>Check the name and add a note. Both show in My Mappings.</DialogDescription>
        </DialogHeader>
        <form
          id="save-mapping-form"
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (complete) onSave(name.trim(), notes.trim());
          }}
        >
          <label className="block space-y-1.5 text-xs">
            Name
            <Input autoFocus maxLength={255} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block space-y-1.5 text-xs">
            Notes
            <Textarea
              rows={4}
              maxLength={300}
              placeholder="What is this mapping for?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <span className="block text-right text-[10px] text-muted-foreground">{notes.length}/300</span>
          </label>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="save-mapping-form" disabled={!complete || saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
