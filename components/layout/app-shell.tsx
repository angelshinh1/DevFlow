"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, type SidebarUser, type SidebarRepo } from "./sidebar";
import { SidebarContext } from "./sidebar-context";

interface AppShellProps {
  user: SidebarUser;
  repos: SidebarRepo[];
  children: React.ReactNode;
}

/**
 * Responsive app frame. The sidebar is statically docked on `lg+`; below that it
 * collapses into a hamburger-triggered drawer (the hamburger lives in the page
 * Header via {@link SidebarContext}).
 */
export function AppShell({ user, repos, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the drawer on navigation - adjusted during render (no effect needed).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setOpen(true) }}>
      <div className="flex h-dvh overflow-hidden">
        {/* Docked sidebar - desktop only */}
        <div className="hidden lg:flex">
          <Sidebar user={user} repos={repos} />
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 bg-canvas lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-label="Navigation"
              >
                <Sidebar user={user} repos={repos} onClose={() => setOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}
