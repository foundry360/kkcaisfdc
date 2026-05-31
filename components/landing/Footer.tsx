import { footerLinks } from "@/lib/landing-data";

export function Footer() {
  return (
    <footer className="px-6 pb-8 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-[#173244]/10 pt-8 text-sm text-[#6f7f86] md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} Kona Kai Corporation. Business transformation through
          proactive partnership.
        </p>
        <div className="flex gap-5">
          {footerLinks.map((link) => (
            <a key={link} href="#" className="transition hover:text-[#173244]">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
