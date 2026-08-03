import { FOOTER_SOCIAL_LINKS } from '@/lib/social-links';

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="container flex flex-col items-center justify-center gap-2 px-4 py-4">
        <nav aria-label="소셜 링크" className="flex items-center gap-[5px] text-[#999]">
          {FOOTER_SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="hover:text-foreground focus-visible:ring-ring rounded-sm p-[5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </nav>
        <p className="text-muted-foreground text-xs">© 2025 강병준. All rights reserved.</p>
      </div>
    </footer>
  );
}
