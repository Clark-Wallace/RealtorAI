import { Home, Edit, BarChart3, Sparkles, Cloud, Search, Brain } from 'lucide-react';

const Header = ({ currentView, setCurrentView }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home size={24} />
            Realtor Insight Engine
          </h1>
          <nav className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => setCurrentView('feedback')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                currentView === 'feedback'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Edit size={18} />
              <span className="hidden sm:inline">Feedback Entry</span>
              <span className="sm:hidden">Entry</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                currentView === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('matching')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                currentView === 'matching'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">Smart Match</span>
              <span className="sm:hidden">Match</span>
            </button>
            <button
              onClick={() => setCurrentView('crm')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                currentView === 'crm'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Cloud size={18} />
              <span className="hidden sm:inline">CRM</span>
              <span className="sm:hidden">CRM</span>
            </button>
            <button
              onClick={() => setCurrentView('properties')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                currentView === 'properties'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search size={18} />
              <span className="hidden sm:inline">Properties</span>
              <span className="sm:hidden">Search</span>
            </button>
            <button
              onClick={() => setCurrentView('market')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                currentView === 'market'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Brain size={18} />
              <span className="hidden sm:inline">Market Intel</span>
              <span className="sm:hidden">Intel</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;