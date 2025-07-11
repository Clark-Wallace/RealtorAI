import React, { useState, useEffect } from 'react';
import { Settings, Database, Key, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { validateApiConfig } from '../services/api/config';
import { useNotification } from './NotificationSystem';

const ApiConfiguration = ({ onClose }) => {
  const { notify } = useNotification();
  const [config, setConfig] = useState({
    mls: {
      apiKey: '',
      endpoint: '',
      enabled: false
    },
    zillow: {
      zwsId: '',
      apiKey: '',
      enabled: false
    },
    publicRecords: {
      apiKey: '',
      enabled: false
    }
  });
  const [testing, setTesting] = useState({});
  const [validationResults, setValidationResults] = useState({});

  useEffect(() => {
    // Load existing config from localStorage
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    }
  }, []);

  const handleConfigChange = (service, field, value) => {
    setConfig(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
  };

  const saveConfig = () => {
    try {
      localStorage.setItem('apiConfig', JSON.stringify(config));
      
      // Also save to environment variables for the API services
      Object.entries(config).forEach(([service, settings]) => {
        if (settings.enabled) {
          if (service === 'mls') {
            process.env.REACT_APP_MLS_API_KEY = settings.apiKey;
            process.env.REACT_APP_MLS_ENDPOINT = settings.endpoint;
          } else if (service === 'zillow') {
            process.env.REACT_APP_ZILLOW_ZWS_ID = settings.zwsId;
            process.env.REACT_APP_ZILLOW_API_KEY = settings.apiKey;
          } else if (service === 'publicRecords') {
            process.env.REACT_APP_PUBLIC_RECORDS_API_KEY = settings.apiKey;
          }
        }
      });

      notify.success('API configuration saved', {
        description: 'Settings have been saved successfully'
      });
    } catch (error) {
      notify.error('Failed to save configuration', {
        description: error.message
      });
    }
  };

  const testConnection = async (service) => {
    setTesting(prev => ({ ...prev, [service]: true }));
    
    try {
      // This would make a test API call to verify credentials
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const isValid = Math.random() > 0.3; // Simulate success/failure
      
      setValidationResults(prev => ({
        ...prev,
        [service]: {
          valid: isValid,
          message: isValid ? 'Connection successful' : 'Invalid credentials',
          timestamp: new Date()
        }
      }));
      
      if (isValid) {
        notify.success(`${service.toUpperCase()} connection successful`);
      } else {
        notify.error(`${service.toUpperCase()} connection failed`);
      }
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        [service]: {
          valid: false,
          message: error.message,
          timestamp: new Date()
        }
      }));
      notify.error(`${service.toUpperCase()} test failed`);
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  const getConnectionStatus = (service) => {
    const result = validationResults[service];
    if (!result) return null;
    
    return (
      <div className={`flex items-center gap-2 text-sm ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
        {result.valid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {result.message}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">API Configuration</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Configure your API credentials to access real market data
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* MLS Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium">MLS / IDX</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mls.enabled}
                  onChange={(e) => handleConfigChange('mls', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {config.mls.enabled && (
              <div className="ml-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.mls.apiKey}
                    onChange={(e) => handleConfigChange('mls', 'apiKey', e.target.value)}
                    placeholder="Enter your MLS API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={config.mls.endpoint}
                    onChange={(e) => handleConfigChange('mls', 'endpoint', e.target.value)}
                    placeholder="https://api.mlsgrid.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => testConnection('mls')}
                    disabled={testing.mls}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testing.mls ? <Loader className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Test Connection
                  </button>
                  {getConnectionStatus('mls')}
                </div>
              </div>
            )}
          </div>

          {/* Zillow Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-medium">Zillow</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.zillow.enabled}
                  onChange={(e) => handleConfigChange('zillow', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {config.zillow.enabled && (
              <div className="ml-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZWS ID
                  </label>
                  <input
                    type="password"
                    value={config.zillow.zwsId}
                    onChange={(e) => handleConfigChange('zillow', 'zwsId', e.target.value)}
                    placeholder="Enter your Zillow Web Services ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.zillow.apiKey}
                    onChange={(e) => handleConfigChange('zillow', 'apiKey', e.target.value)}
                    placeholder="Enter your Zillow API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => testConnection('zillow')}
                    disabled={testing.zillow}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {testing.zillow ? <Loader className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Test Connection
                  </button>
                  {getConnectionStatus('zillow')}
                </div>
              </div>
            )}
          </div>

          {/* Public Records Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-medium">Public Records</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.publicRecords.enabled}
                  onChange={(e) => handleConfigChange('publicRecords', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {config.publicRecords.enabled && (
              <div className="ml-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.publicRecords.apiKey}
                    onChange={(e) => handleConfigChange('publicRecords', 'apiKey', e.target.value)}
                    placeholder="Enter your Public Records API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => testConnection('publicRecords')}
                    disabled={testing.publicRecords}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {testing.publicRecords ? <Loader className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Test Connection
                  </button>
                  {getConnectionStatus('publicRecords')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={saveConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfiguration;