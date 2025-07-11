import { useState, lazy, Suspense } from 'react';
import { DataProvider } from './context/DataContext';
import { MarketProvider } from './context/MarketContext';
import { NotificationProvider } from './components/NotificationSystem';
import Header from './components/Header';
import InstallPrompt from './components/InstallPrompt';

// Lazy load components for better performance
const FeedbackEntry = lazy(() => import('./components/FeedbackEntry'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const SmartMatching = lazy(() => import('./components/SmartMatching'));
const CRMIntegration = lazy(() => import('./components/CRMIntegration'));
const PropertySearch = lazy(() => import('./components/PropertySearch'));
const MarketIntelligence = lazy(() => import('./components/MarketIntelligence'));

function App() {
  const [currentView, setCurrentView] = useState('feedback');

  // Loading component
  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <NotificationProvider>
      <DataProvider>
        <MarketProvider>
          <div className="min-h-screen bg-gray-50">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            
            <main>
              <Suspense fallback={<PageLoader />}>
                {currentView === 'feedback' && <FeedbackEntry />}
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'matching' && <SmartMatching />}
                {currentView === 'crm' && <CRMIntegration />}
                {currentView === 'properties' && <PropertySearch />}
                {currentView === 'market' && <MarketIntelligence />}
              </Suspense>
            </main>
            
            {/* PWA Install Prompt */}
            <InstallPrompt />
          </div>
        </MarketProvider>
      </DataProvider>
    </NotificationProvider>
  );
}

export default App;