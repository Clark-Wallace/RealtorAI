import { useState } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, Calendar, 
  AlertTriangle, CheckCircle, Info, Zap,
  Home, DollarSign, Users, Building
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

const MarketForecast = () => {
  const { getMarketForecast, marketData } = useMarket();
  const [forecastPeriod, setForecastPeriod] = useState(6);
  const forecast = getMarketForecast(forecastPeriod);

  // Generate chart data
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: forecastPeriod }, (_, i) => {
      const monthIndex = (currentMonth + i + 1) % 12;
      return {
        month: months[monthIndex],
        value: 100 + parseFloat(forecast.priceForecast[i]?.change || 0)
      };
    });
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));

  // Get indicator color
  const getIndicatorColor = (type) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Market indicators
  const indicators = [
    {
      title: 'Interest Rate Impact',
      value: 'Stabilizing',
      trend: 'neutral',
      description: 'Rates expected to hold steady through Q2'
    },
    {
      title: 'Inventory Levels',
      value: 'Increasing',
      trend: 'positive',
      description: 'More listings expected in spring market'
    },
    {
      title: 'Buyer Demand',
      value: 'Strong',
      trend: 'positive',
      description: 'Pent-up demand from qualified buyers'
    },
    {
      title: 'Economic Factors',
      value: 'Mixed',
      trend: 'neutral',
      description: 'Tech sector growth offsetting concerns'
    }
  ];

  // Investment opportunities
  const opportunities = [
    {
      type: 'neighborhood',
      title: 'Tech Quarter Expansion',
      impact: '+15-20%',
      timeline: '12-18 months',
      confidence: 85
    },
    {
      type: 'property',
      title: 'Starter Homes Under $800K',
      impact: '+8-12%',
      timeline: '6-9 months',
      confidence: 78
    },
    {
      type: 'market',
      title: 'Luxury Waterfront',
      impact: '+5-8%',
      timeline: '6 months',
      confidence: 72
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="text-indigo-600" />
          Market Forecast & Predictions
        </h2>
        
        <select
          value={forecastPeriod}
          onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
          <option value={12}>12 Months</option>
        </select>
      </div>

      {/* Confidence Score */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Forecast Confidence
            </h3>
            <p className="text-gray-600">
              Based on historical data, market trends, and economic indicators
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">{forecast.confidence}%</div>
            <div className="text-sm text-gray-600">Accuracy Score</div>
          </div>
        </div>
      </div>

      {/* Price Forecast Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Price Index Forecast</h3>
        
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {chartData.map((data, index) => {
              const height = ((data.value - minValue) / (maxValue - minValue)) * 100;
              const isPositive = data.value > 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center h-48">
                    <div
                      className={`w-full max-w-[40px] transition-all rounded-t-lg ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                        {(data.value - 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              );
            })}
          </div>
          
          {/* Baseline */}
          <div className="absolute bottom-16 left-0 right-0 border-t-2 border-dashed border-gray-300">
            <span className="absolute -top-3 left-0 text-xs text-gray-500">Current</span>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Price Increase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Price Decrease</span>
          </div>
        </div>
      </div>

      {/* Market Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicators.map((indicator, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getIndicatorColor(indicator.trend)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{indicator.title}</h4>
              <span className="font-medium">{indicator.value}</span>
            </div>
            <p className="text-sm opacity-80">{indicator.description}</p>
          </div>
        ))}
      </div>

      {/* Investment Opportunities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="text-yellow-500" />
          Investment Opportunities
        </h3>
        
        <div className="space-y-4">
          {opportunities.map((opp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">{opp.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Expected appreciation: <span className="font-medium text-green-600">{opp.impact}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{opp.confidence}%</div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="text-gray-400" size={16} />
                  <span className="text-gray-600">{opp.timeline}</span>
                </div>
                <div className="flex items-center gap-1">
                  {opp.type === 'neighborhood' && <Building className="text-gray-400" size={16} />}
                  {opp.type === 'property' && <Home className="text-gray-400" size={16} />}
                  {opp.type === 'market' && <DollarSign className="text-gray-400" size={16} />}
                  <span className="text-gray-600 capitalize">{opp.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Market Risks
          </h3>
          <ul className="space-y-2 text-sm text-red-800">
            {forecast.risks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Market Opportunities
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            {forecast.opportunities.map((opp, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                {opp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Info size={20} />
          Strategic Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">For Sellers:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• List premium properties now before inventory increases</li>
              <li>• Price competitively to capture spring buyers</li>
              <li>• Highlight energy efficiency features</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">For Buyers:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Lock in rates before potential increases</li>
              <li>• Focus on emerging neighborhoods for value</li>
              <li>• Consider off-market opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketForecast;