'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/' || pathname.startsWith('/auth');

  return (
    <div className={isPublic ? undefined : 'app-shell'}>
      {!isPublic && <Sidebar />}
      <main className={isPublic ? undefined : 'main-content'}>{children}</main>
      {!isPublic && <BottomNav />}
    </div>
  );
}
