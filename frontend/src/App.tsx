import React, { useState } from 'react';
import { AppView } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { KitchenDemand } from './pages/KitchenDemand';
import { QualityScan } from './pages/QualityScan';
import { Redistribution } from './pages/Redistribution';
import { Logistics } from './pages/Logistics';
import { Telemetry } from './pages/Telemetry';
import { ESGCompliance } from './pages/ESGCompliance';

const MainLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataMutated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not authenticated and not explicitly viewing the public landing page, show login
  if (!isAuthenticated && currentView !== 'landing') {
    return <LoginPage onSuccess={() => setCurrentView('dashboard')} />;
  }

  // If viewing project story / 5yo explanation
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
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header Bar with Breadcrumb and Judge Fast-Role Switcher */}
        <Topbar
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onDataMutated={handleDataMutated}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {currentView === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} refreshKey={refreshKey} />
          )}
          {currentView === 'kitchen' && (
            <KitchenDemand
              onNavigate={handleNavigate}
              onDataMutated={handleDataMutated}
            />
          )}
          {currentView === 'quality' && (
            <QualityScan
              onNavigate={handleNavigate}
              onDataMutated={handleDataMutated}
            />
          )}
          {currentView === 'rescue' && (
            <Redistribution
              onNavigate={handleNavigate}
              onDataMutated={handleDataMutated}
            />
          )}
          {currentView === 'logistics' && (
            <Logistics
              onNavigate={handleNavigate}
              onDataMutated={handleDataMutated}
            />
          )}
          {currentView === 'telemetry' && <Telemetry />}
          {currentView === 'impact' && <ESGCompliance />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};
