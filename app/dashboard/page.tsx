export default function DashboardPage() {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-xl border bg-card px-6 py-16 text-center shadow-sm sm:px-12">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-md bg-muted text-xl font-black tracking-[-0.08em]">
          CA
        </span>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Área de gestão
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground sm:text-4xl">
          Bem-vindo ao ClienteApp
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
          Use a navegação acima para acessar seus clientes ou ajustar as configurações da sua conta.
        </p>
      </div>
    </section>
  );
}
