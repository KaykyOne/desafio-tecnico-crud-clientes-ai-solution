export default function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl py-6 text-center text-[0.72rem] text-muted-foreground">
      <p>
        Desenvolvido por{" "}
        <a
          href="https://kayky.dev.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Kayky
        </a>{" "}
        · sistemas sob medida para freelancers e pequenos negócios.
      </p>
    </footer>
  );
}
