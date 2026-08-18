"use client"

//* Types Imports
import type { LucideIcon } from "lucide-react"

type propsItem = {
    title: string
    icon: LucideIcon
    href: string
}

export function Item(props: propsItem) {
    return (
        <a href={props.href} className="flex gap-2 items-center cursor-pointer hover:bg-background/10 p-5 rounded-lg transition-all duration-300">
            <props.icon size={20} />
            <span>{props.title}</span>
        </a>
    )
}