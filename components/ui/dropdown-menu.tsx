"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function DropdownMenuRoot({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  className,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="z-[9999] outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            `
              z-[9999]
              min-w-52
              max-h-[var(--available-height)]

              overflow-x-hidden
              overflow-y-auto

              origin-[var(--transform-origin)]

              rounded-xl
              border
              border-border/60

              bg-popover/95
              p-1.5
              text-popover-foreground

              shadow-xl
              shadow-black/15

              backdrop-blur-xl

              outline-none

              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2

              data-open:animate-in
              data-open:fade-in-0
              data-open:zoom-in-95

              data-closed:animate-out
              data-closed:fade-out-0
              data-closed:zoom-out-95
            `,
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        `
          px-3
          py-2

          text-[11px]
          font-semibold
          uppercase
          tracking-wider

          text-muted-foreground

          data-inset:pl-8
        `,
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        `
          group/dropdown-menu-item

          relative
          flex
          cursor-pointer
          items-center
          gap-2

          rounded-lg

          px-3
          py-2.5

          text-sm
          font-medium

          outline-none
          select-none

          transition-colors
          duration-150

          hover:bg-accent/70
          hover:text-accent-foreground

          focus:bg-accent
          focus:text-accent-foreground

          data-inset:pl-8

          data-[variant=destructive]:text-destructive

          data-[variant=destructive]:hover:bg-destructive/10
          data-[variant=destructive]:focus:bg-destructive/10

          dark:data-[variant=destructive]:hover:bg-destructive/20
          dark:data-[variant=destructive]:focus:bg-destructive/20

          data-disabled:pointer-events-none
          data-disabled:opacity-50

          [&_svg]:pointer-events-none
          [&_svg]:shrink-0
          [&_svg]:size-4
          [&_svg]:opacity-70
        `,
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        `
          flex
          cursor-pointer
          items-center
          gap-2

          rounded-lg

          px-3
          py-2.5

          text-sm
          font-medium

          outline-none
          select-none

          transition-colors
          duration-150

          hover:bg-accent/70
          hover:text-accent-foreground

          focus:bg-accent
          focus:text-accent-foreground

          data-popup-open:bg-accent
          data-popup-open:text-accent-foreground

          data-open:bg-accent
          data-open:text-accent-foreground

          data-inset:pl-8

          [&_svg]:pointer-events-none
          [&_svg]:shrink-0
          [&_svg]:size-4
        `,
        className,
      )}
      {...props}
    >
      {children}

      <ChevronRightIcon className="ml-auto opacity-60" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -4,
  side = "right",
  sideOffset = 6,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("min-w-48", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      checked={checked}
      className={cn(
        `
          relative
          flex
          cursor-pointer
          items-center
          gap-2

          rounded-lg

          py-2.5
          pr-9
          pl-3

          text-sm
          font-medium

          outline-none
          select-none

          transition-colors
          duration-150

          hover:bg-accent/70
          hover:text-accent-foreground

          focus:bg-accent
          focus:text-accent-foreground

          data-inset:pl-8

          data-disabled:pointer-events-none
          data-disabled:opacity-50

          [&_svg]:pointer-events-none
          [&_svg]:shrink-0
          [&_svg]:size-4
        `,
        className,
      )}
      {...props}
    >
      <span
        data-slot="dropdown-menu-checkbox-item-indicator"
        className="
          pointer-events-none
          absolute
          right-3
          flex
          items-center
          justify-center
        "
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>

      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        `
          relative
          flex
          cursor-pointer
          items-center
          gap-2

          rounded-lg

          py-2.5
          pr-9
          pl-3

          text-sm
          font-medium

          outline-none
          select-none

          transition-colors
          duration-150

          hover:bg-accent/70
          hover:text-accent-foreground

          focus:bg-accent
          focus:text-accent-foreground

          data-inset:pl-8

          data-disabled:pointer-events-none
          data-disabled:opacity-50

          [&_svg]:pointer-events-none
          [&_svg]:shrink-0
          [&_svg]:size-4
        `,
        className,
      )}
      {...props}
    >
      <span
        data-slot="dropdown-menu-radio-item-indicator"
        className="
          pointer-events-none
          absolute
          right-3
          flex
          items-center
          justify-center
        "
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>

      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1.5 h-px bg-border/60", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        `
          ml-auto
          text-xs
          tracking-widest
          text-muted-foreground

          group-focus/dropdown-menu-item:text-accent-foreground
        `,
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenuRoot,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

const DropdownMenu = {
  DropdownMenuRoot,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

export default DropdownMenu;
