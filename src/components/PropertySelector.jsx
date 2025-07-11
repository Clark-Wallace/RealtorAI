import { useState, useEffect } from 'react';
import { Home, MapPin, DollarSign, Bed, Bath, Square, Calendar, ChevronDown, Check, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatPrice, calculateDaysOnMarket } from '../utils/dataHelpers';
import AddPropertyModal from './AddPropertyModal';

const PropertySelector = ({ value, onChange, error }) => {
  const { properties, addProperty } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (value) {
      const property = properties.find(p => p.id === value);
      setSelectedProperty(property);
    } else {
      setSelectedProperty(null);
    }
  }, [value, properties]);

  const handleSelect = (propertyId) => {
    onChange(propertyId);
    setIsOpen(false);
  };

  const handleAddProperty = (newProperty) => {
    const added = addProperty(newProperty);
    handleSelect(added.id);
    setShowAddModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Home size={20} className="text-green-600" />
              Select Property
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              <Plus size={18} />
              Add New
            </button>
          </div>

          {/* Custom Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full min-h-[44px] px-4 py-3 text-left bg-gray-50 border-2 rounded-lg flex items-center justify-between transition-all ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
              style={{ fontSize: '16px' }}
            >
              <span className={selectedProperty ? 'text-gray-900' : 'text-gray-500'}>
                {selectedProperty ? `${selectedProperty.address} - ${formatPrice(selectedProperty.price)}` : 'Choose a property...'}
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
                  {properties.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Home size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No properties yet</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setShowAddModal(true);
                        }}
                        className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Add your first property
                      </button>
                    </div>
                  ) : (
                    properties.map(property => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => handleSelect(property.id)}
                        className={`w-full min-h-[44px] px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center justify-between group ${
                          value === property.id ? 'bg-green-50' : ''
                        }`}
                        style={{ fontSize: '16px' }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{property.address}</div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(property.price)} • {property.bedrooms}BR/{property.bathrooms}BA • {property.sqft.toLocaleString()} sqft
                          </div>
                        </div>
                        {value === property.id && (
                          <Check size={20} className="text-green-600 ml-2" />
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

          {/* Selected Property Details */}
          {selectedProperty && (
            <div className="mt-6">
              {/* Property Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                <Home size={48} className="text-gray-400" />
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedProperty.address}</h4>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatPrice(selectedProperty.price)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full capitalize">
                    {selectedProperty.status || 'Active'}
                  </span>
                </div>

                {/* Property Specs */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <Bed size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-lg font-semibold">{selectedProperty.bedrooms}</p>
                    <p className="text-xs text-gray-600">Bedrooms</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <Bath size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-lg font-semibold">{selectedProperty.bathrooms}</p>
                    <p className="text-xs text-gray-600">Bathrooms</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <Square size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-lg font-semibold">{selectedProperty.sqft.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Sq Ft</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Home size={16} className="text-gray-500" />
                    <span>Type: <strong>{selectedProperty.type || selectedProperty.propertyType}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-gray-500" />
                    <span>Built: <strong>{selectedProperty.yearBuilt}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={16} className="text-gray-500" />
                    <span>Days on Market: <strong>{calculateDaysOnMarket(selectedProperty.listingDate)}</strong></span>
                  </div>
                </div>

                {/* Features */}
                {selectedProperty.features && selectedProperty.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.features.map((feature, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProperty}
      />
    </>
  );
};

export default PropertySelector;