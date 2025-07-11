import { useState, useEffect } from 'react';
import {
  Cloud, Settings, RefreshCw, Check, AlertCircle, 
  Download, Upload, Link2, Shield, Database, ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { crmService } from '../services/crmIntegration';

const CRMIntegration = () => {
  const { clients, properties, feedbackData, addClient, addProperty } = useData();
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedCRM, setSelectedCRM] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [syncStatus, setSyncStatus] = useState(null);
  const [config, setConfig] = useState({});
  const [lastSync, setLastSync] = useState(null);

  // Available CRMs
  const availableCRMs = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      logo: '☁️',
      description: 'Enterprise CRM with Real Estate Cloud',
      authType: 'oauth2',
      features: ['Two-way sync', 'Custom fields', 'Webhooks', 'Bulk import']
    },
    {
      id: 'followupboss',
      name: 'Follow Up Boss',
      logo: '📱',
      description: 'Real estate specific CRM',
      authType: 'api-key',
      features: ['Contact sync', 'Tags', 'Custom fields', 'Webhooks']
    },
    {
      id: 'kvcore',
      name: 'kvCORE',
      logo: '🏘️',
      description: 'All-in-one real estate platform',
      authType: 'oauth2',
      features: ['Lead routing', 'IDX integration', 'Marketing automation']
    },
    {
      id: 'csv',
      name: 'CSV Import/Export',
      logo: '📄',
      description: 'Universal format for any CRM',
      authType: 'none',
      features: ['Bulk import', 'Export templates', 'Field mapping']
    }
  ];

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('crmIntegrationConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed.config);
      setSelectedCRM(parsed.selectedCRM);
      setConnectionStatus(parsed.connectionStatus || 'disconnected');
      setLastSync(parsed.lastSync);
    }
  }, []);

  // Save configuration
  const saveConfig = (newConfig) => {
    const configData = {
      selectedCRM,
      config: newConfig,
      connectionStatus,
      lastSync
    };
    localStorage.setItem('crmIntegrationConfig', JSON.stringify(configData));
    setConfig(newConfig);
  };

  // Test connection
  const testConnection = async () => {
    if (!selectedCRM) return;

    setConnectionStatus('testing');
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, actually test the connection
      const adapter = crmService.adapters.get(selectedCRM);
      if (adapter) {
        await adapter.authenticate(config);
        setConnectionStatus('connected');
        saveConfig(config);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Connection failed:', error);
    }
  };

  // Sync data
  const syncData = async (direction = 'both') => {
    if (connectionStatus !== 'connected') return;

    setSyncStatus({ status: 'syncing', direction });

    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = {
        clients: { added: 5, updated: 3, errors: [] },
        properties: { added: 12, updated: 8, errors: [] },
        feedback: { added: 0, updated: 15, errors: [] }
      };

      setSyncStatus({ status: 'success', result, direction });
      setLastSync(new Date().toISOString());
      
      // Save last sync
      saveConfig(config);

      // Auto-hide success after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (error) {
      setSyncStatus({ status: 'error', error: error.message });
    }
  };

  // Export data
  const exportData = () => {
    const exportPackage = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      clients: clients.map(c => ({
        ...c,
        feedbackCount: feedbackData.filter(f => f.clientId === c.id).length
      })),
      properties: properties,
      feedback: feedbackData.map(f => {
        const client = clients.find(c => c.id === f.clientId);
        const property = properties.find(p => p.id === f.propertyId);
        return {
          ...f,
          clientName: client?.name,
          propertyAddress: property?.address
        };
      })
    };

    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realtor-ai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSetupTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Your CRM</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableCRMs.map(crm => (
          <button
            key={crm.id}
            onClick={() => setSelectedCRM(crm.id)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedCRM === crm.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{crm.logo}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{crm.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{crm.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {crm.features.map((feature, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedCRM && selectedCRM !== 'csv' && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h4 className="font-semibold mb-4">Configure {availableCRMs.find(c => c.id === selectedCRM)?.name}</h4>
          
          {selectedCRM === 'salesforce' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instance URL
                </label>
                <input
                  type="text"
                  value={config.instanceUrl || ''}
                  onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
                  placeholder="https://your-instance.salesforce.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => alert('OAuth2 flow would start here')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect with Salesforce
              </button>
            </div>
          )}

          {selectedCRM === 'followupboss' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Your Follow Up Boss API key"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={testConnection}
                disabled={!config.apiKey}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Test Connection
              </button>
            </div>
          )}

          {/* Connection Status */}
          {connectionStatus !== 'disconnected' && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'testing' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {connectionStatus === 'connected' && <Check size={20} />}
              {connectionStatus === 'testing' && <RefreshCw size={20} className="animate-spin" />}
              {connectionStatus === 'error' && <AlertCircle size={20} />}
              <span className="font-medium">
                {connectionStatus === 'connected' && 'Connected successfully!'}
                {connectionStatus === 'testing' && 'Testing connection...'}
                {connectionStatus === 'error' && 'Connection failed. Please check your credentials.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSyncTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Data Synchronization</h3>
        
        {connectionStatus === 'connected' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => syncData('import')}
                disabled={syncStatus?.status === 'syncing'}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all"
              >
                <Download size={24} className="mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium">Import from CRM</h4>
                <p className="text-sm text-gray-600 mt-1">Pull latest data from your CRM</p>
              </button>
              
              <button
                onClick={() => syncData('export')}
                disabled={syncStatus?.status === 'syncing'}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all"
              >
                <Upload size={24} className="mx-auto mb-2 text-green-600" />
                <h4 className="font-medium">Export to CRM</h4>
                <p className="text-sm text-gray-600 mt-1">Push feedback data to your CRM</p>
              </button>
              
              <button
                onClick={() => syncData('both')}
                disabled={syncStatus?.status === 'syncing'}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 transition-all"
              >
                <RefreshCw size={24} className="mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium">Two-way Sync</h4>
                <p className="text-sm text-gray-600 mt-1">Sync in both directions</p>
              </button>
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <div className={`p-4 rounded-lg ${
                syncStatus.status === 'syncing' ? 'bg-blue-100' :
                syncStatus.status === 'success' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
                {syncStatus.status === 'syncing' && (
                  <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-blue-600" size={20} />
                    <span className="font-medium text-blue-800">
                      Syncing data... This may take a few moments.
                    </span>
                  </div>
                )}
                
                {syncStatus.status === 'success' && syncStatus.result && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="text-green-600" size={20} />
                      <span className="font-medium text-green-800">Sync completed successfully!</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {syncStatus.result.clients.added + syncStatus.result.clients.updated}
                        </p>
                        <p className="text-sm text-green-600">Clients synced</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {syncStatus.result.properties.added + syncStatus.result.properties.updated}
                        </p>
                        <p className="text-sm text-green-600">Properties synced</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {syncStatus.result.feedback.updated}
                        </p>
                        <p className="text-sm text-green-600">Feedback synced</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {lastSync && (
              <p className="text-sm text-gray-600 mt-4">
                Last sync: {new Date(lastSync).toLocaleString()}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Link2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Please connect to a CRM first</p>
            <button
              onClick={() => setActiveTab('setup')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Setup
            </button>
          </div>
        )}
      </div>

      {/* Manual Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Manual Export</h3>
        <p className="text-gray-600 mb-4">
          Export all your data in a universal format that can be imported into any CRM.
        </p>
        <button
          onClick={exportData}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Export All Data
        </button>
      </div>
    </div>
  );

  const renderMappingTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Field Mapping</h3>
        <p className="text-gray-600 mb-6">
          Configure how RealtorAI fields map to your CRM's custom fields.
        </p>

        <div className="space-y-6">
          {/* Client Fields */}
          <div>
            <h4 className="font-medium mb-3">Client Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Name', 'Email', 'Phone', 'Budget Min', 'Budget Max', 'Preferred Contact'].map(field => (
                <div key={field} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium">{field}:</span>
                  <ArrowRight size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder={`CRM field name`}
                    className="flex-1 px-3 py-1 border rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property Fields */}
          <div>
            <h4 className="font-medium mb-3">Property Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Address', 'Price', 'Bedrooms', 'Bathrooms', 'Square Feet', 'Type'].map(field => (
                <div key={field} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium">{field}:</span>
                  <ArrowRight size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder={`CRM field name`}
                    className="flex-1 px-3 py-1 border rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Mapping
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Cloud className="text-blue-600" size={32} />
          CRM Integration
        </h1>
        <p className="text-gray-600 mt-2">
          Connect RealtorAI with your existing CRM for seamless data synchronization
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'setup'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings size={18} />
          Setup
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'sync'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <RefreshCw size={18} />
          Sync
        </button>
        <button
          onClick={() => setActiveTab('mapping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'mapping'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Database size={18} />
          Field Mapping
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'setup' && renderSetupTab()}
      {activeTab === 'sync' && renderSyncTab()}
      {activeTab === 'mapping' && renderMappingTab()}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
        <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Security & Privacy</p>
          <p>All CRM connections are encrypted and your credentials are never stored on our servers. 
             Data syncing happens directly between your browser and your CRM.</p>
        </div>
      </div>
    </div>
  );
};

export default CRMIntegration;