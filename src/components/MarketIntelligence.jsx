import { useState } from 'react';
import { 
  BarChart3, TrendingUp, MapPin, DollarSign, 
  Brain, Bell, ChevronRight, Sparkles
} from 'lucide-react';
import MarketPulse from './MarketPulse';
import NeighborhoodAnalysis from './NeighborhoodAnalysis';
import PricingIntelligence from './PricingIntelligence';
import CompetitiveIntel from './CompetitiveIntel';
import MarketForecast from './MarketForecast';
import ApiStatusIndicator from './ApiStatusIndicator';
import ErrorBoundary from './ErrorBoundary';

const MarketIntelligence = () => {
  const [activeTab, setActiveTab] = useState('pulse');

  const tabs = [
    { id: 'pulse', label: 'Market Pulse', icon: BarChart3, color: 'blue' },
    { id: 'neighborhoods', label: 'Neighborhoods', icon: MapPin, color: 'purple' },
    { id: 'pricing', label: 'Pricing Intel', icon: DollarSign, color: 'green' },
    { id: 'competitive', label: 'Competition', icon: TrendingUp, color: 'orange' },
    { id: 'forecast', label: 'Forecast', icon: Brain, color: 'indigo' }
  ];

  const getTabColor = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50',
      purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50',
      green: isActive ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50',
      orange: isActive ? 'bg-orange-600 text-white' : 'text-orange-600 hover:bg-orange-50',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Brain className="text-white" size={28} />
            </div>
            Market Intelligence
          </h1>
          <button className="p-2 relative hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
        <p className="text-gray-600">
          Real-time market insights and intelligence to dominate your local market
        </p>
      </div>

      {/* API Status Indicator */}
      <div className="mb-6">
        <ApiStatusIndicator />
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Market Advantage</p>
          <p className="text-2xl font-bold">87%</p>
          <p className="text-xs opacity-80">vs competitors</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Insights Generated</p>
          <p className="text-2xl font-bold">156</p>
          <p className="text-xs opacity-80">this month</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Pricing Accuracy</p>
          <p className="text-2xl font-bold">94%</p>
          <p className="text-xs opacity-80">within 3% of sale</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Active Alerts</p>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs opacity-80">opportunities</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                getTabColor(tab.color, isActive)
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-xl p-6">
        <ErrorBoundary fallbackMessage="There was an error loading this market intelligence component. Please try refreshing the page.">
          {activeTab === 'pulse' && <MarketPulse />}
          {activeTab === 'neighborhoods' && <NeighborhoodAnalysis />}
          {activeTab === 'pricing' && <PricingIntelligence />}
          {activeTab === 'competitive' && <CompetitiveIntel />}
          {activeTab === 'forecast' && <MarketForecast />}
        </ErrorBoundary>
      </div>

      {/* Market Oracle Assistant */}
      <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles size={24} />
              Market Oracle™ AI Assistant
            </h3>
            <p className="opacity-90 mb-4">
              Ask me anything about your local market - I analyze millions of data points to give you an edge
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Should the Johnsons list now or wait until spring?"
                className="flex-1 px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                Ask Oracle
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Brain size={48} className="text-white/80" />
            </div>
          </div>
        </div>
        
        {/* Example Questions */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm opacity-80 mb-2">Popular questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Best time to list luxury homes?",
              "Impact of new tech campus?",
              "Pricing strategy for bidding wars?",
              "Forecast for next 6 months?"
            ].map((question, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;