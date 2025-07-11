import { useState, useEffect } from 'react';
import { User, Phone, Mail, DollarSign, ChevronDown, Check, UserPlus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatPrice, formatPhoneNumber } from '../utils/dataHelpers';
import AddClientModal from './AddClientModal';

const ClientSelector = ({ value, onChange, error }) => {
  const { clients, addClient } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (value) {
      const client = clients.find(c => c.id === value);
      setSelectedClient(client);
    } else {
      setSelectedClient(null);
    }
  }, [value, clients]);

  const handleSelect = (clientId) => {
    onChange(clientId);
    setIsOpen(false);
  };

  const handleAddClient = (newClient) => {
    const added = addClient(newClient);
    handleSelect(added.id);
    setShowAddModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Select Client
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <UserPlus size={18} />
              Add New
            </button>
          </div>

          {/* Custom Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full min-h-[44px] px-4 py-3 text-left bg-gray-50 border-2 rounded-lg flex items-center justify-between transition-all ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
              style={{ fontSize: '16px' }} // Prevent iOS zoom
            >
              <span className={selectedClient ? 'text-gray-900' : 'text-gray-500'}>
                {selectedClient ? selectedClient.name : 'Choose a client...'}
              </span>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                {/* Backdrop for mobile */}
                <div 
                  className="fixed inset-0 z-10 md:hidden" 
                  onClick={() => setIsOpen(false)}
                />
                
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {clients.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <User size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No clients yet</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setShowAddModal(true);
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Add your first client
                      </button>
                    </div>
                  ) : (
                    clients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelect(client.id)}
                        className={`w-full min-h-[44px] px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group ${
                          value === client.id ? 'bg-blue-50' : ''
                        }`}
                        style={{ fontSize: '16px' }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-600">
                            Budget: {formatPrice(client.budget.min)} - {formatPrice(client.budget.max)}
                          </div>
                        </div>
                        {value === client.id && (
                          <Check size={20} className="text-blue-600 ml-2" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
              {error}
            </p>
          )}

          {/* Selected Client Details */}
          {selectedClient && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">{selectedClient.name}</h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={18} className="text-gray-500" />
                  <span style={{ fontSize: '16px' }}>{selectedClient.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={18} className="text-gray-500" />
                  <span style={{ fontSize: '16px' }}>{formatPhoneNumber(selectedClient.phone)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <DollarSign size={18} className="text-gray-500" />
                  <span style={{ fontSize: '16px' }}>
                    Budget: {formatPrice(selectedClient.budget.min)} - {formatPrice(selectedClient.budget.max)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="text-sm text-gray-600">Preferred Contact: </span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {selectedClient.preferredContact || 'Email'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddClient}
      />
    </>
  );
};

export default ClientSelector;