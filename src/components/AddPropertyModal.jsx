import { useState } from 'react';
import { 
  X, Home, MapPin, DollarSign, Bed, Bath, Square, Calendar,
  Building, Save, Plus, Minus, Search
} from 'lucide-react';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

const AddPropertyModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    address: '',
    price: '',
    bedrooms: 3,
    bathrooms: 2,
    sqft: '',
    yearBuilt: new Date().getFullYear(),
    type: 'Single Family',
    features: [],
    listingDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [placeDetails, setPlaceDetails] = useState(null);

  const propertyTypes = [
    'Single Family',
    'Condo',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Commercial'
  ];

  const commonFeatures = [
    'Pool', 'Garage', 'Hardwood Floors', 'Updated Kitchen', 
    'Walk-in Closet', 'Fireplace', 'Basement', 'Central AC',
    'Large Backyard', 'Home Office', 'Smart Home', 'Solar Panels'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Property address is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.sqft) {
      newErrors.sqft = 'Square footage is required';
    } else if (parseFloat(formData.sqft) <= 0) {
      newErrors.sqft = 'Square footage must be greater than 0';
    }
    
    if (formData.yearBuilt < 1800 || formData.yearBuilt > new Date().getFullYear() + 1) {
      newErrors.yearBuilt = 'Please enter a valid year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProperty = {
      id: Date.now(), // In production, this would come from backend
      address: formData.address.trim(),
      price: parseFloat(formData.price),
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      sqft: parseFloat(formData.sqft),
      yearBuilt: formData.yearBuilt,
      type: formData.type,
      features: formData.features,
      listingDate: formData.listingDate,
      description: formData.description.trim(),
      createdAt: new Date().toISOString(),
      // Add place details if available
      ...(placeDetails && {
        placeId: placeDetails.placeId,
        coordinates: placeDetails.coordinates,
        neighborhood: placeDetails.neighborhood,
        addressComponents: placeDetails.components
      })
    };
    
    onSave(newProperty);
    
    // Reset form
    setFormData({
      address: '',
      price: '',
      bedrooms: 3,
      bathrooms: 2,
      sqft: '',
      yearBuilt: new Date().getFullYear(),
      type: 'Single Family',
      features: [],
      listingDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setErrors({});
    setSaving(false);
    setPlaceDetails(null);
    onClose();
  };

  const formatCurrency = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits ? parseInt(digits).toLocaleString() : '';
  };

  const handlePriceChange = (value) => {
    const digits = value.replace(/\D/g, '');
    setFormData({ ...formData, price: digits });
  };

  const handleSquareFeetChange = (value) => {
    const digits = value.replace(/\D/g, '');
    setFormData({ ...formData, sqft: digits });
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({ 
        ...formData, 
        features: [...formData.features, newFeature.trim()] 
      });
      setNewFeature('');
    }
  };

  const removeFeature = (feature) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature)
    });
  };

  const toggleCommonFeature = (feature) => {
    if (formData.features.includes(feature)) {
      removeFeature(feature);
    } else {
      setFormData({
        ...formData,
        features: [...formData.features, feature]
      });
    }
  };

  const handleAddressSelect = (placeData) => {
    setFormData({ ...formData, address: placeData.address });
    setPlaceDetails(placeData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="text-green-600" size={24} />
            Add New Property
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Address with Google Places Autocomplete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Address *
            </label>
            <GooglePlacesAutocomplete
              value={formData.address}
              onChange={handleAddressSelect}
              placeholder="Start typing address..."
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
            {placeDetails && placeDetails.neighborhood && (
              <p className="mt-1 text-sm text-gray-600">
                Neighborhood: {placeDetails.neighborhood}
              </p>
            )}
          </div>

          {/* Price and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.price ? `$${formatCurrency(formData.price)}` : ''}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="$500,000"
                  style={{ fontSize: '16px' }}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  style={{ fontSize: '16px' }}
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Sqft Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bedrooms: Math.max(0, formData.bedrooms - 1) })}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-center"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bedrooms: formData.bedrooms + 1 })}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bathrooms: Math.max(0, formData.bathrooms - 0.5) })}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 relative">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-center"
                    step="0.5"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bathrooms: formData.bathrooms + 0.5 })}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Feet *
              </label>
              <div className="relative">
                <Square className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.sqft ? formatCurrency(formData.sqft) : ''}
                  onChange={(e) => handleSquareFeetChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.sqft ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2,000"
                  style={{ fontSize: '16px' }}
                />
              </div>
              {errors.sqft && (
                <p className="mt-1 text-sm text-red-600">{errors.sqft}</p>
              )}
            </div>
          </div>

          {/* Year Built and Listing Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) || new Date().getFullYear() })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.yearBuilt ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1800"
                max={new Date().getFullYear() + 1}
                style={{ fontSize: '16px' }}
              />
              {errors.yearBuilt && (
                <p className="mt-1 text-sm text-red-600">{errors.yearBuilt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={formData.listingDate}
                  onChange={(e) => setFormData({ ...formData, listingDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Features
            </label>
            
            {/* Common Features Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {commonFeatures.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleCommonFeature(feature)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.features.includes(feature)
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  } border`}
                >
                  {feature}
                </button>
              ))}
            </div>

            {/* Custom Feature Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add custom feature..."
                style={{ fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Selected Features */}
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.features.map(feature => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="hover:text-green-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Additional details about the property..."
              style={{ fontSize: '16px' }}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Property
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;