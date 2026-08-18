//* Libraries Imports
import * as z from "zod"

//* Types Imports
import { type LucideIcon } from "lucide-react"

const sidebarItemSchema = z.object({
    label: z.string(),
    icon: z.custom<LucideIcon>(),
    href: z.string(),
    subItems: z.array(
        z.object({
            label: z.string(),
            href: z.string(),
        })
    ).optional()
})

type SidebarItem = z.infer<typeof sidebarItemSchema>

export { sidebarItemSchema, type SidebarItem }