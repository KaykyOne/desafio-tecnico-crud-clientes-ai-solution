"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, KanbanSquare, LayoutDashboard, LogOut, Settings, UsersRound, Wallet } from "lucide-react";

import { AvatarFallback, AvatarRoot } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";

import ThemeToggle from "./theme-toggle";

const navigation = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clientes", icon: UsersRound },
  { href: "/dashboard/tasks", label: "Tarefas", icon: KanbanSquare },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, isLoading } = useLogout();

  return (
    <div
      className="
        flex min-h-0 flex-col gap-8
        lg:sticky
        lg:top-6
        lg:h-[calc(100dvh-3rem)]
      "
    >
      <Link href="/dashboard" className="flex shrink-0 items-center gap-3 px-1" aria-label="Ir para a visão geral">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-black tracking-[-0.08em] text-primary-foreground">
          iF
        </span>
        <span className="text-[0.78rem] font-black uppercase tracking-[0.18em] text-foreground">izi Freelas</span>
      </Link>

      <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="Navegação principal">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Button
              key={href}
              variant="ghost"
              size="sm"
              render={<Link href={href} aria-current={isActive ? "page" : undefined} />}
              className={cn(
                "h-10 shrink-0 justify-start gap-3 rounded-md px-3 text-muted-foreground",
                isActive && "bg-accent font-bold text-accent-foreground shadow-sm",
              )}
            >
              <Icon />
              <span>{label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <ThemeToggle />

        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <AvatarRoot size="sm" className="bg-muted text-foreground ring-2 ring-background">
            <AvatarFallback>iF</AvatarFallback>
          </AvatarRoot>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">Minha conta</p>
            <p className="truncate text-[0.68rem] text-muted-foreground">izi Freelas</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => void logout()}
          className="mt-3 h-9 w-full justify-start gap-3 rounded-md px-3 text-muted-foreground"
        >
          <LogOut />
          <span>{isLoading ? "Saindo..." : "Sair"}</span>
        </Button>

        <p className="px-1 text-center text-[0.65rem] text-muted-foreground">
          por{" "}
          <a href="https://kayky.dev.br/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-foreground hover:underline">
            Kayky
          </a>
        </p>
      </div>
    </div>
  );
}
