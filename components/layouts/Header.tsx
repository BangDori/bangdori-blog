'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ModeToggle } from '../theme/ThemeToggle';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'blog' },
    { href: '/about', label: 'about' },
  ];

  return (
    <header className="bg-background top-0 z-50 mb-4">
      <div className="container flex h-[var(--header-height)] items-center px-4">
        <div className="flex w-full items-center justify-between">
          <nav className="flex items-center justify-center gap-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={clsx(
                  pathname === href ? 'text-primary' : 'hover:text-primary font-medium'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
