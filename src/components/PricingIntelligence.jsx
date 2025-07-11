import { useState } from 'react';
import { 
  DollarSign, TrendingUp, Target, AlertTriangle, 
  CheckCircle, BarChart3, Info, Calculator, Home,
  Clock, Users, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useData } from '../context/DataContext';

const PricingIntelligence = () => {
  const { analyzePricing, marketData } = useMarket();
  const { properties } = useData();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInputs, setCustomInputs] = useState({
    sqft: '',
    neighborhood: ''
  });

  // Get pricing analysis
  const analysis = selectedProperty 
    ? analyzePricing(properties.find(p => p.id === parseInt(selectedProperty)))
    : customInputs.sqft && customInputs.neighborhood
    ? analyzePricing(customInputs)
    : null;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = (price) => {
    const downPayment = price * 0.2;
    const loanAmount = price - downPayment;
    const monthlyRate = 0.068 / 12; // 6.8% annual
    const numPayments = 360; // 30 years
    
    const payment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return Math.round(payment);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="text-green-600" />
          Pricing Intelligence Engine
        </h2>
        <p className="text-gray-700">
          Get AI-powered pricing recommendations based on real-time market data
        </p>
      </div>

      {/* Property Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Select Property to Analyze</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose from your properties
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => {
                setSelectedProperty(e.target.value);
                setCustomInputs({ sqft: '', neighborhood: '' });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a property...</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.address} - {property.bedrooms}BR/{property.bathrooms}BA - {property.sqft} sqft
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Footage
              </label>
              <input
                type="number"
                value={customInputs.sqft}
                onChange={(e) => {
                  setCustomInputs(prev => ({ ...prev, sqft: e.target.value }));
                  setSelectedProperty('');
                }}
                placeholder="e.g., 2500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood
              </label>
              <select
                value={customInputs.neighborhood}
                onChange={(e) => {
                  setCustomInputs(prev => ({ ...prev, neighborhood: e.target.value }));
                  setSelectedProperty('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select neighborhood...</option>
                {Object.keys(marketData.neighborhoods).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Primary Recommendation */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-500 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Recommended List Price
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(analysis.suggestedPrice)}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${getConfidenceColor(analysis.confidence)}`}>
                <p className="text-sm font-medium">Confidence</p>
                <p className="text-2xl font-bold">{analysis.confidence}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-green-600" size={20} />
                  <span className="font-medium text-gray-700">Aggressive</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(analysis.priceRange.aggressive)}</p>
                <p className="text-sm text-gray-600">Quick sale likely</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-700">Recommended</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(analysis.priceRange.moderate)}</p>
                <p className="text-sm text-gray-600">Optimal balance</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-orange-600" size={20} />
                  <span className="font-medium text-gray-700">Conservative</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(analysis.priceRange.conservative)}</p>
                <p className="text-sm text-gray-600">May sit longer</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Reasoning:</strong> {analysis.reasoning}
              </p>
            </div>
          </div>

          {/* Market Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="text-purple-600" size={20} />
                Market Position
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Price per sq ft</span>
                    <span className="font-medium">${analysis.pricePerSqft}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs neighborhood average</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Market temperature</span>
                    <span className="font-medium capitalize">{analysis.marketPosition}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {analysis.marketPosition === 'hot' ? 'High demand, price aggressively' :
                     analysis.marketPosition === 'cool' ? 'Lower demand, price competitively' :
                     'Balanced market conditions'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="text-orange-600" size={20} />
                Expected Performance
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Expected DOM</span>
                    <span className="text-xl font-bold text-orange-600">{analysis.expectedDom} days</span>
                  </div>
                  <p className="text-xs text-gray-500">Based on current market conditions</p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700">
                    Properties in this price range are currently selling 
                    {analysis.expectedDom < 30 ? ' quickly' : ' at a moderate pace'}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={20} />
                Advanced Pricing Insights
              </h4>
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showAdvanced && (
              <div className="p-6 pt-0 space-y-4">
                {/* Monthly Payment Calculator */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-3">Buyer's Perspective</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Payment</p>
                      <p className="text-xl font-bold">{formatCurrency(calculateMonthlyPayment(analysis.suggestedPrice))}</p>
                      <p className="text-xs text-gray-500">20% down, 6.8% rate</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Down Payment</p>
                      <p className="text-xl font-bold">{formatCurrency(analysis.suggestedPrice * 0.2)}</p>
                      <p className="text-xs text-gray-500">20% required</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Income Needed</p>
                      <p className="text-xl font-bold">{formatCurrency(calculateMonthlyPayment(analysis.suggestedPrice) * 12 * 3)}</p>
                      <p className="text-xs text-gray-500">3x payment ratio</p>
                    </div>
                  </div>
                </div>

                {/* Competitive Positioning */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Competitive Positioning Strategy</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-green-500 mt-0.5" size={16} />
                      <span>Price {formatCurrency(50000)} below competing listings to generate immediate interest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-green-500 mt-0.5" size={16} />
                      <span>Highlight unique features that justify the price point</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-green-500 mt-0.5" size={16} />
                      <span>Consider offering buyer incentives if market slows</span>
                    </li>
                  </ul>
                </div>

                {/* Risk Assessment */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-orange-600" size={16} />
                    Pricing Risks
                  </h5>
                  <ul className="space-y-1 text-sm text-orange-800">
                    <li>• Interest rates may impact buyer pool if they increase</li>
                    <li>• Seasonal factors could affect demand in coming months</li>
                    <li>• Monitor competing listings for price adjustments</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Generate Listing Report
            </button>
            <button className="flex-1 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Save Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingIntelligence;