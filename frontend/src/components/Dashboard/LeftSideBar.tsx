import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Settings as SettingsIcon,
  Users,
  BarChart3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'antd';
import { useLayoutStore } from '@/store/useLayoutStore';
import { SettingsModal } from './SettingsModal';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isExpanded: boolean;
}

const NavItem = ({ to, icon: Icon, label, isExpanded }: NavItemProps) => {
  return (
    <Tooltip title={!isExpanded ? label : ''} placement="right" mouseEnterDelay={0.5}>
      <NavLink
        to={to}
        className={({ isActive }) => `
          group relative flex items-center w-full transition-all duration-300 px-4 py-3
          ${isExpanded ? 'justify-start space-x-4' : 'justify-center'}
          ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
        `}
      >
        {({ isActive }) => (
          <>
            {/* Active Indicator Bar */}
            {isActive && (
              <motion.div
                layoutId="activeSideBar"
                className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <div className={`
              p-2 rounded-xl transition-all duration-300
              ${isActive ? 'bg-blue-50' : 'group-hover:bg-slate-100'}
            `}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>

            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {isExpanded && isActive && (
              <ChevronRight size={14} className="ml-auto opacity-40" />
            )}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
};

export const LeftSideBar: React.FC = () => {
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <motion.aside
        animate={{ width: isSidebarExpanded ? 200 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen bg-[rgb(244,245,246)] border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-sm"
      >
        {/* Collapse Toggle Button - Replaces Logo Area */}
        <div className="mb-10 w-full px-4 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center hover:text-blue-600 transition-all duration-300 cursor-pointer"
          >
            {isSidebarExpanded ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 w-full space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isExpanded={isSidebarExpanded} />
          <NavItem to="/chat" icon={MessageSquare} label="Messages" isExpanded={isSidebarExpanded} />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" isExpanded={isSidebarExpanded} />
          <NavItem to="/team" icon={Users} label="Team Members" isExpanded={isSidebarExpanded} />
        </nav>

        {/* Bottom Actions */}
        <div className="w-full mt-auto space-y-2 flex flex-col items-center">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`
              group flex items-center w-full px-4 py-3 transition-all duration-300 text-slate-500 hover:text-slate-900
              ${isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'}
            `}
          >
            <div className="p-2 rounded-xl group-hover:bg-slate-100">
              <SettingsIcon size={22} />
            </div>
            {isSidebarExpanded && <span className="text-sm font-semibold">Settings</span>}
          </button>

          <div className="h-px w-12 bg-slate-200 my-2" />

          <button
            className={`
              group flex items-center w-full px-4 py-3 transition-all duration-300 text-slate-500 hover:text-red-500
              ${isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'}
            `}
          >
            <div className="p-2 rounded-xl group-hover:bg-red-50">
              <LogOut size={22} />
            </div>
            {isSidebarExpanded && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </motion.aside>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default LeftSideBar;
