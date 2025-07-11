import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { validateApiConfig } from '../services/api/config';
import ApiConfiguration from './ApiConfiguration';

const ApiStatusIndicator = () => {
  const { useRealData, toggleRealData, isLoadingRealData } = useMarket();
  const [showConfig, setShowConfig] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    configured: false,
    services: {
      mls: false,
      zillow: false,
      publicRecords: false
    }
  });

  useEffect(() => {
    // Check API configuration status
    const checkStatus = () => {
      const config = validateApiConfig();
      const savedConfig = localStorage.getItem('apiConfig');
      
      let services = { mls: false, zillow: false, publicRecords: false };
      
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          services = {
            mls: parsed.mls?.enabled && parsed.mls?.apiKey,
            zillow: parsed.zillow?.enabled && parsed.zillow?.zwsId,
            publicRecords: parsed.publicRecords?.enabled && parsed.publicRecords?.apiKey
          };
        } catch (error) {
          console.error('Error parsing API config:', error);
        }
      }
      
      setApiStatus({
        configured: config,
        services
      });
    };

    checkStatus();
    
    // Listen for configuration changes
    const handleStorageChange = (e) => {
      if (e.key === 'apiConfig') {
        checkStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getStatusColor = () => {
    const activeServices = Object.values(apiStatus.services).filter(Boolean).length;
    if (activeServices === 0) return 'text-gray-400';
    if (activeServices === 1) return 'text-yellow-500';
    if (activeServices === 2) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    const activeServices = Object.values(apiStatus.services).filter(Boolean).length;
    if (activeServices === 0) return 'No APIs configured';
    if (activeServices === 1) return '1 API configured';
    return `${activeServices} APIs configured`;
  };

  const getDataSourceText = () => {
    if (isLoadingRealData) return 'Loading real data...';
    return useRealData ? 'Real market data' : 'Mock data';
  };

  return (
    <>
      <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* API Status */}
        <div className="flex items-center gap-2">
          <Database className={`w-5 h-5 ${getStatusColor()}`} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {Object.entries(apiStatus.services).map(([service, enabled]) => (
                <span key={service} className={`px-2 py-1 rounded ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {service.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Data Source Toggle */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          {useRealData ? (
            <Wifi className="w-5 h-5 text-blue-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {getDataSourceText()}
            </span>
            <button
              onClick={toggleRealData}
              disabled={isLoadingRealData || !apiStatus.configured}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                useRealData 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {useRealData ? 'Switch to Mock' : 'Switch to Real'}
            </button>
          </div>
        </div>

        {/* Configuration Button */}
        <button
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configure
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {apiStatus.configured ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <span className="text-sm text-gray-600">
            {apiStatus.configured ? 'Ready' : 'Setup Required'}
          </span>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <ApiConfiguration onClose={() => setShowConfig(false)} />
      )}
    </>
  );
};

export default ApiStatusIndicator;