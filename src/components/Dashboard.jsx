import { useState } from 'react';
import { 
  BarChart3, Users, Home, FileDown, Share2, ChartBar, Eye,
  Download, Copy, Check, Filter as FilterIcon
} from 'lucide-react';
import ClientInsights from './ClientInsights';
import PropertyAnalytics from './PropertyAnalytics';
import AnalyticsCharts from './AnalyticsCharts';
import { useData } from '../context/DataContext';
import { 
  exportToCSV, exportToJSON, formatClientReport, 
  formatPropertyReport, copyToClipboard 
} from '../utils/exportUtils';

const Dashboard = () => {
  const { clients, properties, feedbackData } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportCSV = () => {
    const data = feedbackData.map(f => {
      const client = clients.find(c => c.id === f.clientId);
      const property = properties.find(p => p.id === f.propertyId);
      return {
        Date: new Date(f.timestamp).toLocaleDateString(),
        Client: client?.name || 'Unknown',
        Property: property?.address || 'Unknown',
        Rating: f.rating,
        Interest: f.interestLevel,
        'Price Opinion': f.priceOpinion,
        Likes: f.likes.join('; '),
        Dislikes: f.dislikes.join('; ')
      };
    });
    exportToCSV(data, 'realtor-ai-analytics.csv');
  };

  const handleExportJSON = () => {
    const report = {
      exportDate: new Date().toISOString(),
      summary: {
        totalClients: clients.length,
        totalProperties: properties.length,
        totalFeedback: feedbackData.length,
        avgRating: (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
      },
      clients: clients.map(client => formatClientReport(client, feedbackData, properties)),
      properties: properties.map(property => formatPropertyReport(property, feedbackData, clients))
    };
    exportToJSON(report, 'realtor-ai-report.json');
  };

  const handleShareReport = async () => {
    const reportUrl = window.location.href;
    const shareText = `RealtorAI Analytics Report\n\nTotal Clients: ${clients.length}\nTotal Properties: ${properties.length}\nTotal Feedback: ${feedbackData.length}\n\nView full report: ${reportUrl}`;
    
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate overview stats
  const overviewStats = {
    totalClients: clients.length,
    totalProperties: properties.length,
    totalShowings: feedbackData.length,
    avgRating: feedbackData.length > 0 
      ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
      : '0.0',
    highInterest: feedbackData.filter(f => f.interestLevel === 'high' || f.interestLevel === 'very high').length,
    uniqueViewers: new Set(feedbackData.map(f => f.clientId)).size
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalClients}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalProperties}</p>
            </div>
            <Home className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Showings</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalShowings}</p>
            </div>
            <Eye className="text-purple-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">★{overviewStats.avgRating}</p>
            </div>
            <ChartBar className="text-yellow-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Interest</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.highInterest}</p>
            </div>
            <BarChart3 className="text-red-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Viewers</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.uniqueViewers}</p>
            </div>
            <FilterIcon className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts 
        feedbackData={feedbackData} 
        properties={properties} 
        clients={clients} 
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        
        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileDown size={20} />
            Export
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <button
                onClick={() => {
                  handleExportCSV();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download size={16} />
                Export as CSV
              </button>
              <button
                onClick={() => {
                  handleExportJSON();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download size={16} />
                Export as JSON
              </button>
              <button
                onClick={() => {
                  handleShareReport();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Report Link'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} />
            Overview
          </div>
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'clients' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Client Insights
          </div>
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'properties' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Home size={18} />
            Property Analytics
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'clients' && <ClientInsights />}
        {activeTab === 'properties' && <PropertyAnalytics />}
      </div>
    </div>
  );
};

export default Dashboard;