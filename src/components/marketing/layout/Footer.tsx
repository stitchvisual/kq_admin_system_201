import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div>
            <div className="footer__brand">KQ Collective</div>
            <p className="footer__tagline">Building independence. One session at a time.</p>
          </div>
          <div>
            <span className="footer__col-label">Company</span>
            <Link href="/about" className="footer__link">
              About
            </Link>
            <Link href="/services" className="footer__link">
              Services
            </Link>
            <Link href="/contact" className="footer__link">
              Contact
            </Link>
          </div>
          <div>
            <span className="footer__col-label">Services</span>
            <Link href="/services" className="footer__link">
              Life Skills Training
            </Link>
            <Link href="/services" className="footer__link">
              Home &amp; Daily Living
            </Link>
            <Link href="/services" className="footer__link">
              Community Participation
            </Link>
          </div>
          <div>
            <span className="footer__col-label">Connect</span>
            <span className="footer__link">Instagram (coming soon)</span>
            <span className="footer__link">LinkedIn (coming soon)</span>
            <a href="mailto:hello@kqcollective.com" className="footer__link">
              hello@kqcollective.com
            </a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 KQ Collective. All rights reserved.</span>
          <div className="cluster">
            <Link href="/privacy" className="footer__link">Privacy</Link>
            <Link href="/terms" className="footer__link">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
