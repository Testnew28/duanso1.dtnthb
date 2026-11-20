import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { useRevealObserver } from '@/hooks/useRevealObserver';

export function Layout({ children }: { children?: ReactNode }) {
  useRevealObserver();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
