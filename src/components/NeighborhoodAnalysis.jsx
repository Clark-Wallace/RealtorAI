import { useState } from 'react';
import { 
  MapPin, TrendingUp, TrendingDown, Home, DollarSign, 
  Clock, Thermometer, Info, ChevronRight, BarChart3,
  School, ShoppingBag, Train, Trees, Building
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

const NeighborhoodAnalysis = () => {
  const { marketData, getNeighborhoodIntel } = useMarket();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareNeighborhoods, setCompareNeighborhoods] = useState([]);

  // Get all neighborhoods
  const neighborhoods = Object.keys(marketData.neighborhoods);

  // Get market temperature badge
  const getTempBadge = (temp) => {
    const configs = {
      hot: { bg: 'bg-red-100', text: 'text-red-700', icon: '🔥' },
      warm: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '☀️' },
      balanced: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⚖️' },
      cool: { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '❄️' }
    };
    const config = configs[temp] || configs.balanced;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {temp}
      </span>
    );
  };

  // Get trend arrow
  const getTrendArrow = (value) => {
    const numValue = parseFloat(value);
    if (numValue > 5) return <TrendingUp className="text-green-500" size={16} />;
    if (numValue < -5) return <TrendingDown className="text-red-500" size={16} />;
    return <span className="text-gray-400">→</span>;
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Handle neighborhood selection
  const handleNeighborhoodClick = (name) => {
    if (compareMode) {
      if (compareNeighborhoods.includes(name)) {
        setCompareNeighborhoods(prev => prev.filter(n => n !== name));
      } else if (compareNeighborhoods.length < 3) {
        setCompareNeighborhoods(prev => [...prev, name]);
      }
    } else {
      setSelectedNeighborhood(name);
    }
  };

  // Neighborhood detail view
  const NeighborhoodDetail = ({ neighborhood }) => {
    const data = marketData.neighborhoods[neighborhood];
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{neighborhood}</h3>
            <div className="flex items-center gap-3">
              {getTempBadge(data.marketTemp)}
              <span className={`text-sm font-medium ${
                data.trendDirection === 'rising' ? 'text-green-600' :
                data.trendDirection === 'declining' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {data.trendDirection === 'rising' ? '↑' : 
                 data.trendDirection === 'declining' ? '↓' : '→'} 
                {' '}{data.trendDirection}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedNeighborhood(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-blue-600" size={20} />
              {getTrendArrow(data.priceChange)}
            </div>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(data.medianPrice)}</p>
            <p className="text-sm text-blue-700">Median Price</p>
            <p className="text-xs text-blue-600 mt-1">{data.priceChange}% YoY</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-purple-600" size={20} />
              {getTrendArrow(data.domChange * -1)}
            </div>
            <p className="text-xl font-bold text-purple-900">{data.averageDom} days</p>
            <p className="text-sm text-purple-700">Avg DOM</p>
            <p className="text-xs text-purple-600 mt-1">{data.domChange}% vs last Q</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Home className="text-green-600" size={20} />
              <span className="text-xs font-medium text-green-700">{data.inventory}mo</span>
            </div>
            <p className="text-xl font-bold text-green-900">Supply</p>
            <p className="text-sm text-green-700">Inventory Level</p>
            <p className="text-xs text-green-600 mt-1">
              {data.inventory < 3 ? "Seller's market" : 
               data.inventory > 6 ? "Buyer's market" : "Balanced"}
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="text-orange-600" size={20} />
            </div>
            <p className="text-xl font-bold text-orange-900">${data.pricePerSqft}</p>
            <p className="text-sm text-orange-700">Per Sq Ft</p>
            <p className="text-xs text-orange-600 mt-1">+8% vs city avg</p>
          </div>
        </div>

        {/* Market Drivers */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Info size={18} />
            Key Market Drivers
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.keyDrivers.map((driver, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {driver}
              </span>
            ))}
          </div>
        </div>

        {/* Neighborhood Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <School className="text-blue-600" size={20} />
            <span className="text-sm">Top Schools</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <ShoppingBag className="text-purple-600" size={20} />
            <span className="text-sm">Shopping</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Train className="text-orange-600" size={20} />
            <span className="text-sm">Transit Access</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Trees className="text-green-600" size={20} />
            <span className="text-sm">Parks</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Building className="text-gray-600" size={20} />
            <span className="text-sm">Urban</span>
          </div>
        </div>

        {/* Expert Insight */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">Market Expert Insight</h4>
          <p className="text-gray-700 text-sm">
            {data.marketTemp === 'hot' 
              ? `${neighborhood} is experiencing strong buyer demand with homes selling ${Math.abs(data.domChange)}% faster than last quarter. List aggressively but price realistically.`
              : data.marketTemp === 'cool'
              ? `Buyer's market conditions in ${neighborhood}. Properties sitting longer. Consider pricing below recent comps and highlighting unique features.`
              : `Balanced market in ${neighborhood}. Focus on proper staging and competitive pricing to stand out.`
            }
          </p>
        </div>
      </div>
    );
  };

  // Comparison view
  const ComparisonView = () => {
    if (compareNeighborhoods.length < 2) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Select at least 2 neighborhoods to compare</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h3 className="text-xl font-bold mb-6">Neighborhood Comparison</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Metric</th>
              {compareNeighborhoods.map(name => (
                <th key={name} className="text-left py-3 px-4">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 px-4 font-medium">Market Temp</td>
              {compareNeighborhoods.map(name => (
                <td key={name} className="py-3 px-4">
                  {getTempBadge(marketData.neighborhoods[name].marketTemp)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-medium">Median Price</td>
              {compareNeighborhoods.map(name => (
                <td key={name} className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {formatCurrency(marketData.neighborhoods[name].medianPrice)}
                    {getTrendArrow(marketData.neighborhoods[name].priceChange)}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-medium">Avg DOM</td>
              {compareNeighborhoods.map(name => (
                <td key={name} className="py-3 px-4">
                  {marketData.neighborhoods[name].averageDom} days
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-medium">$/Sq Ft</td>
              {compareNeighborhoods.map(name => (
                <td key={name} className="py-3 px-4">
                  ${marketData.neighborhoods[name].pricePerSqft}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium">Inventory</td>
              {compareNeighborhoods.map(name => (
                <td key={name} className="py-3 px-4">
                  {marketData.neighborhoods[name].inventory} months
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-blue-600" />
          Neighborhood Intelligence
        </h2>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setCompareNeighborhoods([]);
            setSelectedNeighborhood(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            compareMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {compareMode ? 'Exit Compare' : 'Compare Mode'}
        </button>
      </div>

      {/* Selected/Comparison View */}
      {selectedNeighborhood ? (
        <NeighborhoodDetail neighborhood={selectedNeighborhood} />
      ) : compareMode && compareNeighborhoods.length >= 2 ? (
        <ComparisonView />
      ) : null}

      {/* Neighborhood Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {neighborhoods.map(name => {
          const data = marketData.neighborhoods[name];
          const isSelected = compareMode ? compareNeighborhoods.includes(name) : false;
          
          return (
            <button
              key={name}
              onClick={() => handleNeighborhoodClick(name)}
              disabled={compareMode && compareNeighborhoods.length >= 3 && !isSelected}
              className={`p-4 bg-white rounded-lg border-2 text-left transition-all ${
                isSelected 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              } ${compareMode && compareNeighborhoods.length >= 3 && !isSelected ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{name}</h3>
                {getTempBadge(data.marketTemp)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Median</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatCurrency(data.medianPrice)}</span>
                    {getTrendArrow(data.priceChange)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">DOM</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{data.averageDom} days</span>
                    {getTrendArrow(data.domChange * -1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">$/sqft</span>
                  <span className="font-medium">${data.pricePerSqft}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    data.trendDirection === 'rising' ? 'text-green-600' :
                    data.trendDirection === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {data.trendDirection}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NeighborhoodAnalysis;