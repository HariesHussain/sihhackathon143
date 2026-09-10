import React, { useState } from 'react';
import { AppView, UserRole, UserProfile } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Page Views
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { KitchenDemand } from './pages/KitchenDemand';
import { QualityScan } from './pages/QualityScan';
import { Redistribution } from './pages/Redistribution';
import { Telemetry } from './pages/Telemetry';
import { ESGCompliance } from './pages/ESGCompliance';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Demo user persona state for hackathon evaluation
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr_chef_01',
    name: 'Chef Rajesh Sharma',
    role: 'KITCHEN_OPERATOR',
    roleTitle: 'Head Chef / Kitchen Operator',
    orgName: 'Central Institutional Mess',
    avatarUrl: '',
  });

  const handleRoleChange = (role: UserRole) => {
    const roleMap: Record<UserRole, { title: string; name: string; org: string }> = {
      KITCHEN_OPERATOR: {
        title: 'Head Chef / Kitchen Operator',
        name: 'Chef Rajesh Sharma',
        org: 'Central Institutional Mess',
      },
      PLANT_SUPERVISOR: {
        title: 'Industrial Plant Supervisor',
        name: 'Vikram Sengupta',
        org: 'Mega Food Processing Unit Beta',
      },
      NGO_REPRESENTATIVE: {
        title: 'NGO Logistics Coordinator',
        name: 'Priya Nair',
        org: 'Feeding India & Robin Hood Army Hub',
      },
      REGULATOR_AUDITOR: {
        title: 'MoFPI Regulatory Auditor',
        name: 'Dr. Sunita Mehra',
        org: 'Ministry of Food Processing Industries',
      },
    };

    const info = roleMap[role];
    setCurrentUser({
      id: `usr_${role.toLowerCase()}`,
      name: info.name,
      role: role,
      roleTitle: info.title,
      orgName: info.org,
      avatarUrl: '',
    });
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Landing / About view, render full-screen immersive presentation
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterApp={(targetView = 'dashboard') => handleNavigate(targetView)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (With left margin for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header Bar */}
        <Topbar
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          user={currentUser}
          onChangeUserRole={handleRoleChange}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentView === 'kitchen' && <KitchenDemand />}
          {currentView === 'quality' && <QualityScan onNavigate={handleNavigate} />}
          {currentView === 'redistribution' && <Redistribution />}
          {currentView === 'telemetry' && <Telemetry />}
          {currentView === 'esg' && <ESGCompliance />}
        </main>
      </div>
    </div>
  );
};
