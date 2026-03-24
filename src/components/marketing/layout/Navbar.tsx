'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuId = 'mobile-primary-nav';

  const linkClass = (path: string) => (pathname === path ? 'nav__link is-active' : 'nav__link');

  const mobileLinkClass = (path: string) =>
    pathname === path ? 'nav__mobile-link is-active' : 'nav__mobile-link';

  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);


  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link href="/" className="nav__logo">
          KQ Collective
        </Link>
        <div className="nav__links">
          <Link href="/about" className={linkClass('/about')}>
            About
          </Link>
          <Link href="/services" className={linkClass('/services')}>
            Services
          </Link>
          <Link href="/events" className={linkClass('/events')}>
            Events
          </Link>
          <Link href="/contact" className={linkClass('/contact')}>
            Contact
          </Link>
        </div>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen(prev => !prev)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div id={menuId} className={`nav__mobile-panel ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="nav__mobile-links">
          <Link href="/about" className={mobileLinkClass('/about')}>
            About
          </Link>
          <Link href="/services" className={mobileLinkClass('/services')}>
            Services
          </Link>
          <Link href="/events" className={mobileLinkClass('/events')}>
            Events
          </Link>
          <Link href="/contact" className={mobileLinkClass('/contact')}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
