/**
 * Sidebar Context
 * Manages sidebar collapsed/expanded state
 */

import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

/**
 * SidebarProvider component
 * Provides sidebar state to the app
 */
export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const value = {
    isCollapsed,
    toggleSidebar,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

/**
 * Custom hook to use sidebar context
 * @returns {object} Sidebar context value
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

