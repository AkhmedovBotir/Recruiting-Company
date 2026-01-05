/**
 * Dashboard Layout Component
 * Main layout with Sidebar and Navbar for all dashboard pages
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';

const DashboardLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Navbar */}
        <Navbar />

        {/* Main Content with Outlet */}
        <main className="flex-1 overflow-y-auto pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
