import { UsersRound } from "lucide-react";

export default function AuthBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 font-semibold tracking-tight text-[#12231f]">
        <span className="grid size-9 place-items-center rounded-xl bg-[#183d34] text-white">
          <UsersRound className="size-4" strokeWidth={2.5} />
        </span>
        ClienteApp
      </div>
    );
  }

  return (
    <div className="flex max-w-[22rem] flex-col items-start">
      <div className="mb-5 grid size-10 place-items-center rounded-xl bg-[#d8efe5] text-[#245246]">
        <UsersRound className="size-5" strokeWidth={2.3} />
      </div>
      <p className="text-[1.25rem] font-bold tracking-[-0.04em] text-[#12231f]">
        ClienteApp
      </p>
      <p className="mt-3 max-w-[17rem] text-[0.78rem] font-semibold leading-5 text-[#526660]">
        A plataforma simples para gerenciar seus clientes com clareza e eficiência.
      </p>
      <div className="mt-6 text-[0.68rem] leading-4 text-[#71837d]">
        <p className="font-semibold text-[#397563]">“Organize. Gerencie. Cresça.”</p>
        <p>Soluções simples para equipes reais.</p>
      </div>
    </div>
  );
}
