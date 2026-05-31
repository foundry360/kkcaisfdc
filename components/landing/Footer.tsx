import { footerLinks } from "@/lib/landing-data";

export function Footer() {
  return (
    <footer className="px-6 pb-8 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} KKC AI. AI readiness intelligence for modern teams.</p>
        <div className="flex gap-5">
          {footerLinks.map((link) => (
            <a key={link} href="#" className="transition hover:text-white">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
