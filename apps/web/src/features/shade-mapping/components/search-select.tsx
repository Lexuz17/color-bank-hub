import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
  options: [value: string, label: string][];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

// A select you can type into, so a long list does not have to be scrolled.
export function SearchSelect({ value, onChange, options, placeholder, disabled, className }: Props) {
  const labelOf = (option: string) => options.find(([key]) => key === option)?.[1] ?? "";

  return (
    <Combobox
      items={options.map(([key]) => key)}
      value={value}
      disabled={disabled}
      itemToStringLabel={labelOf}
      onValueChange={(next) => next && onChange(next)}
    >
      <ComboboxInput placeholder={placeholder} disabled={disabled} className={cn("h-7 w-full min-w-0 text-xs", className)} />
      <ComboboxContent>
        <ComboboxEmpty>No results</ComboboxEmpty>
        <ComboboxList>
          {(option: string) => (
            <ComboboxItem key={option} value={option} className="text-xs">
              {labelOf(option)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
