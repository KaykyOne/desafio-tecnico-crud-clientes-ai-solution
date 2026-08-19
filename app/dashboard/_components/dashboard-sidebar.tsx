"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, UsersRound } from "lucide-react";

import { AvatarFallback, AvatarRoot } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clientes", icon: UsersRound },
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
      ">
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center gap-3 px-1"
        aria-label="Ir para a visão geral"
      >
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#183d34] text-sm font-black tracking-[-0.08em] text-[#eef8f2] shadow-[0_10px_24px_-12px_rgba(24,61,52,0.8)]">
          CA
        </span>
        <span className="text-[0.78rem] font-black uppercase tracking-[0.18em] text-[#183d34]">
          ClienteApp
        </span>
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
                "h-10 shrink-0 justify-start gap-3 rounded-xl px-3 text-[#71837d] hover:bg-[#eef5f0] hover:text-[#183d34]",
                isActive && "bg-[#e7f2eb] font-bold text-[#183d34] shadow-sm ring-1 ring-[#d6e8dc]"
              )}
            >
              <Icon />
              <span>{label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-[#dce8e2] bg-white p-3">
          <AvatarRoot size="sm" className="bg-[#dcebe2] text-[#183d34] ring-2 ring-white">
            <AvatarFallback>CA</AvatarFallback>
          </AvatarRoot>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#183d34]">Minha conta</p>
            <p className="truncate text-[0.68rem] text-[#8a9a93]">ClienteApp</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => void logout()}
          className="mt-3 h-9 w-full justify-start gap-3 rounded-xl px-3 text-[#8a9a93] hover:bg-[#fff4f1] hover:text-[#b45d4d]"
        >
          <LogOut />
          <span>{isLoading ? "Saindo..." : "Sair"}</span>
        </Button>
      </div>
    </div>
  );
}
