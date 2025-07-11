import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Thermometer, Clock, 
  Home, DollarSign, Users, BarChart3, AlertCircle, Zap
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

const MarketPulse = () => {
  const { marketData, marketAlerts, getMarketTiming } = useMarket();
  const [selectedView, setSelectedView] = useState('overview');
  const marketTiming = getMarketTiming();

  // Get temperature color
  const getTempColor = (temp) => {
    switch (temp) {
      case 'hot': return 'text-red-600 bg-red-50 border-red-200';
      case 'warm': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'balanced': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cool': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get trend icon
  const getTrendIcon = (value) => {
    if (value > 5) return <TrendingUp className="text-green-600" size={20} />;
    if (value < -5) return <TrendingDown className="text-red-600" size={20} />;
    return <Minus className="text-gray-400" size={20} />;
  };

  // Format price
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Market Temperature Overview */}
      <div className={`p-6 rounded-xl border-2 ${getTempColor(marketData.marketPulse.overallTemp)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Thermometer size={32} className="opacity-80" />
            <div>
              <h2 className="text-2xl font-bold capitalize">
                {marketData.marketPulse.overallTemp} Market
              </h2>
              <p className="text-sm opacity-80">
                {marketData.marketPulse.buyerDemand} buyer demand, {marketData.marketPulse.sellerSupply} inventory
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{marketData.marketPulse.inventoryMonths}</p>
            <p className="text-sm opacity-80">months supply</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Home size={20} className="opacity-60" />
              {getTrendIcon(8)}
            </div>
            <p className="text-2xl font-bold">{formatPrice(marketData.marketPulse.medianPrice)}</p>
            <p className="text-sm opacity-80">Median Price</p>
          </div>

          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="opacity-60" />
              {getTrendIcon(-15)}
            </div>
            <p className="text-2xl font-bold">{Math.round(marketData.marketPulse.avgDom)}</p>
            <p className="text-sm opacity-80">Days on Market</p>
          </div>

          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="opacity-60" />
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                High
              </span>
            </div>
            <p className="text-lg font-bold">Active Buyers</p>
            <p className="text-sm opacity-80">Above average</p>
          </div>

          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={20} className="opacity-60" />
              <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                6.8%
              </span>
            </div>
            <p className="text-lg font-bold">Interest Rates</p>
            <p className="text-sm opacity-80">+0.2% this month</p>
          </div>
        </div>
      </div>

      {/* Market Timing Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} />
            Market Timing Intelligence
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            marketTiming.isOptimalListing 
              ? 'bg-green-100 text-green-700'
              : marketTiming.isOptimalBuying
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {marketTiming.isOptimalListing ? 'Prime Listing Time' : 
             marketTiming.isOptimalBuying ? 'Prime Buying Time' : 'Moderate Activity'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="font-medium text-gray-800 mb-2">Current Recommendation</p>
            <p className="text-gray-700">{marketTiming.recommendation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-1">Best Listing Months</p>
              <p className="text-green-700">March - May</p>
              <p className="text-xs text-green-600 mt-1">+{marketData.trends.seasonal.seasonalPremium}% price premium</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-1">Best Buying Months</p>
              <p className="text-blue-700">November - January</p>
              <p className="text-xs text-blue-600 mt-1">More negotiating power</p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Alerts */}
      {marketAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-500" size={20} />
            Market Alerts
          </h3>
          <div className="space-y-3">
            {marketAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.priority === 'high' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium ${
                      alert.priority === 'high' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {alert.title}
                    </p>
                    <p className={`text-sm mt-1 ${
                      alert.priority === 'high' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.type === 'opportunity' ? 'bg-green-100 text-green-700' :
                    alert.type === 'trend' ? 'bg-blue-100 text-blue-700' :
                    alert.type === 'competition' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-center">
          <BarChart3 className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-sm font-medium">View Neighborhoods</p>
        </button>
        <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-sm font-medium">Market Forecast</p>
        </button>
        <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-center">
          <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-sm font-medium">Price Analysis</p>
        </button>
        <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all text-center">
          <Home className="mx-auto mb-2 text-orange-600" size={24} />
          <p className="text-sm font-medium">Competitive Intel</p>
        </button>
      </div>
    </div>
  );
};

export default MarketPulse;