export default function DashboardPage() {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#dce8e2] bg-white px-6 py-16 text-center shadow-[0_24px_70px_-45px_rgba(24,61,52,0.42)] sm:px-12">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#e7f2eb] text-xl font-black tracking-[-0.08em] text-[#397563]">
          CA
        </span>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#397563]">
          Área de gestão
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#183d34] sm:text-4xl">
          Bem-vindo ao ClienteApp
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#71837d]">
          Use a navegação acima para acessar seus clientes ou ajustar as configurações da sua conta.
        </p>
      </div>
    </section>
  );
}
