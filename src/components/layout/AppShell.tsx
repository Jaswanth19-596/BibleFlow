import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
  sidebarContent?: ReactNode;
  onCloseSidebar?: () => void;
}

export default function AppShell({
  children,
  showSidebar = false,
  sidebarContent,
  onCloseSidebar,
}: AppShellProps) {
  const handleCloseSidebar = onCloseSidebar || (() => {});

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
        {showSidebar && sidebarContent && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={handleCloseSidebar}
            />
            <Sidebar onClose={handleCloseSidebar}>{sidebarContent}</Sidebar>
          </>
        )}
      </div>
    </div>
  );
}
