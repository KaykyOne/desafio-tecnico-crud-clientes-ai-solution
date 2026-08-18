"use client"

//* Library Imports
import { ChevronRightIcon } from "lucide-react"

//* Types Imports
import { type SidebarItem } from "./types"

//* Components Imports
import DropdownMenu from "@/components/ui/dropdown-menu"

type propsItem = {
    role: SidebarItem
}

export function Item({ role }: propsItem) {
    if (role.subItems) {
        return (
            <DropdownMenu.DropdownMenuRoot
                onOpenChange={(open) => {
                    console.log("menu open:", open)
                }}
            >
                <DropdownMenu.DropdownMenuTrigger
                    className="
                        flex w-full gap-2 items-center
                        cursor-pointer
                        hover:bg-background/10
                        p-5 rounded-lg
                        transition-all duration-300
                    "
                >
                    <ChevronRightIcon
                        size={20}
                        className="opacity-70"
                    />

                    <span>{role.label}</span>
                </DropdownMenu.DropdownMenuTrigger>

                <DropdownMenu.DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={8}
                >
                    {role.subItems.map((subItem) => (
                        <DropdownMenu.DropdownMenuItem
                            key={subItem.label}
                        >
                            {subItem.label}
                        </DropdownMenu.DropdownMenuItem>
                    ))}
                </DropdownMenu.DropdownMenuContent>
            </DropdownMenu.DropdownMenuRoot>
        )
    }

    return (
        <div className="flex gap-2 items-center cursor-pointer hover:bg-background/10 p-5 rounded-lg transition-all duration-300">
            <role.icon size={20} />
            <span>{role.label}</span>
        </div>
    )
}