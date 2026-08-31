import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Sidebar({ children, onClose }: SidebarProps) {
  return (
    <aside className="fixed inset-x-0 bottom-0 max-h-[calc(100dvh-0.75rem)] w-full rounded-t-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200 sm:inset-y-0 sm:left-auto sm:max-h-none sm:w-96 sm:rounded-none">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="min-h-11 min-w-11 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
    </aside>
  );
}
