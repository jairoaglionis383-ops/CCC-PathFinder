// Footer - per Phase 1 tokens.css, Navy is designated for nav/footer
// surfaces specifically, applied here directly.

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-small text-white/80">
          © {new Date().getFullYear()} City College of Calamba
        </p>
        <p className="font-mono text-caption text-white/60">CCC PathFinder</p>
      </div>
    </footer>
  );
}
