"use client";

//* Components Imports
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Command from "@/components/ui/command";
import Popover from "@/components/ui/popover";
import Separator from "@/components/ui/separator";

//* Libraries Imports
import { Check, PlusCircle } from "lucide-react";

//* Utils Imports
import { cn } from "@/lib/utils";

export type FacetedFilterOption = {
  value: string;
  label: string;
};

type FacetedFilterProps = {
  label: string;
  options: FacetedFilterOption[];
  selected: string[];
  emptyMessage?: string;
  onChange: (selected: string[]) => void;
};

/**
 * Filtro de múltipla escolha com busca (padrão "faceted filter" do shadcn: Popover + Command).
 *
 * Genérico de propósito: qualquer filtro novo que seja "escolher de uma lista" reusa este
 * componente passando `options`, sem precisar de UI própria.
 */
export function FacetedFilter({
  label,
  options,
  selected,
  emptyMessage = "Nada encontrado.",
  onChange,
}: FacetedFilterProps) {
  const selectedOptions = options.filter((option) => selected.includes(option.value));

  function handleToggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  return (
    <Popover.PopoverRoot>
      <Popover.PopoverTrigger
        render={<Button type="button" variant="outline" size="sm" className="h-9 border-dashed" />}
      >
        <PlusCircle />
        {label}
        {selected.length > 0 && (
          <>
            <Separator orientation="vertical" className="mx-1 h-4" />
            {selectedOptions.length <= 2 ? (
              selectedOptions.map((option) => (
                <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                  {option.label}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selected.length} selecionados
              </Badge>
            )}
          </>
        )}
      </Popover.PopoverTrigger>

      <Popover.PopoverContent align="start" className="w-56 p-0">
        <Command.CommandRoot>
          <Command.CommandInput placeholder={label} />
          <Command.CommandList>
            <Command.CommandEmpty>{emptyMessage}</Command.CommandEmpty>
            <Command.CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <Command.CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleToggle(option.value)}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </Command.CommandItem>
                );
              })}
            </Command.CommandGroup>
            {selected.length > 0 && (
              <>
                <Command.CommandSeparator />
                <Command.CommandGroup>
                  <Command.CommandItem value="__limpar" onSelect={() => onChange([])} className="justify-center">
                    Limpar
                  </Command.CommandItem>
                </Command.CommandGroup>
              </>
            )}
          </Command.CommandList>
        </Command.CommandRoot>
      </Popover.PopoverContent>
    </Popover.PopoverRoot>
  );
}
