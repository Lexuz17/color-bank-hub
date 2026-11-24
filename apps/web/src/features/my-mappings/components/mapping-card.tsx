import type { MappingCard as Card } from "@color-bank-hub/contracts/mapping";
import { useNavigate } from "@tanstack/react-router";
import { Ellipsis, FolderInput, Trash2 } from "lucide-react";
import { ShadeSwatch } from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/date";
import { useMoveToFolder } from "../hooks/mapping-mutations";

interface Props {
  card: Card;
  folders: { id: string; name: string }[];
  onDelete: (id: string) => void;
}

export function MappingCard({ card, folders, onDelete }: Props) {
  const navigate = useNavigate();
  const move = useMoveToFolder();

  function open() {
    const [productId, itemId] = card.id.split(":");
    void navigate({ to: "/shade-mapping", search: card.kind === "mine" ? { mappingId: card.id } : { productId, itemId: Number(itemId) } });
  }

  return (
    <article className="flex flex-col rounded-md border bg-card">
      <div className="flex min-h-24 flex-wrap items-center justify-center gap-1.5 rounded-t-md bg-muted p-3">
        {card.swatches.map((hex, index) => (
          <ShadeSwatch key={`${hex}-${index}`} hex={hex} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h2 className="truncate text-sm font-medium" title={card.name}>
          {card.name}
        </h2>
        {card.notes && (
          <Tooltip>
            <TooltipTrigger render={<p className="line-clamp-2 text-left text-[11px] text-muted-foreground" />}>{card.notes}</TooltipTrigger>
            <TooltipContent className="max-w-xs">{card.notes}</TooltipContent>
          </Tooltip>
        )}
        <p className="mt-auto pt-1 text-[11px] text-muted-foreground">
          {card.shadeCount} shades · {formatDate(card.updatedAt)}
        </p>
      </div>
      <div className="flex gap-2 border-t p-3">
        <Button size="sm" variant="outline" className="flex-1" onClick={open}>
          Open mapping
        </Button>
        {card.kind === "mine" && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label={`Actions for ${card.name}`} />}>
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderInput />
                  Move to folder
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {folders.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      disabled={folder.id === card.folderId}
                      onClick={() => move.mutate({ id: card.id, folderId: folder.id })}
                    >
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem disabled={card.folderId === null} onClick={() => move.mutate({ id: card.id, folderId: null })}>
                    No folder
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(card.id)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </article>
  );
}
