"use client";

import { createContext, useContext } from "react";

/** Lets the page Header (anywhere in the tree) open the mobile sidebar drawer. */
export const SidebarContext = createContext<{ openSidebar: () => void }>({
  openSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
