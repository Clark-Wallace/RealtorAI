import { useState, useEffect, useRef } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

const GooglePlacesAutocomplete = ({ value, onChange, placeholder = "Start typing address...", className = "" }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock Google Places API - In production, this would use the actual Google Places API
  const mockGooglePlacesSearch = async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (query.length < 3) return [];
    
    // Mock suggestions with realistic addresses
    const mockSuggestions = [
      {
        place_id: '1',
        description: `${query} Street, San Francisco, CA 94110`,
        structured_formatting: {
          main_text: `${query} Street`,
          secondary_text: 'San Francisco, CA 94110'
        },
        terms: [
          { value: `${query} Street` },
          { value: 'San Francisco' },
          { value: 'CA' }
        ]
      },
      {
        place_id: '2',
        description: `${query} Avenue, Los Angeles, CA 90210`,
        structured_formatting: {
          main_text: `${query} Avenue`,
          secondary_text: 'Los Angeles, CA 90210'
        },
        terms: [
          { value: `${query} Avenue` },
          { value: 'Los Angeles' },
          { value: 'CA' }
        ]
      },
      {
        place_id: '3',
        description: `${query} Drive, San Diego, CA 92101`,
        structured_formatting: {
          main_text: `${query} Drive`,
          secondary_text: 'San Diego, CA 92101'
        },
        terms: [
          { value: `${query} Drive` },
          { value: 'San Diego' },
          { value: 'CA' }
        ]
      }
    ];
    
    return mockSuggestions;
  };

  // Mock place details - In production, this would fetch full details from Google
  const mockGetPlaceDetails = async (placeId, description) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Extract components from description
    const parts = description.split(', ');
    const streetAddress = parts[0];
    const city = parts[1];
    const stateZip = parts[2] || '';
    const [state, zipCode] = stateZip.split(' ');
    
    return {
      formatted_address: description,
      address_components: [
        { long_name: streetAddress, short_name: streetAddress, types: ['street_address'] },
        { long_name: city, short_name: city, types: ['locality'] },
        { long_name: state, short_name: state, types: ['administrative_area_level_1'] },
        { long_name: zipCode, short_name: zipCode, types: ['postal_code'] }
      ],
      geometry: {
        location: {
          lat: 37.7749 + Math.random() * 0.1,
          lng: -122.4194 + Math.random() * 0.1
        }
      },
      place_id: placeId,
      neighborhood: city === 'San Francisco' ? 'Mission District' : 'Downtown'
    };
  };

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue && inputValue.length >= 3) {
        searchPlaces(inputValue);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const searchPlaces = async (query) => {
    setIsLoading(true);
    setError('');
    
    try {
      // In production, check if Google Places API is loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        // Real Google Places implementation would go here
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { 
            input: query,
            types: ['address'],
            componentRestrictions: { country: 'us' }
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              setSuggestions(predictions);
            }
          }
        );
      } else {
        // Use mock data for development
        const results = await mockGooglePlacesSearch(query);
        setSuggestions(results);
      }
      setShowSuggestions(true);
    } catch (err) {
      console.error('Places search error:', err);
      setError('Unable to search addresses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (suggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    
    try {
      let placeDetails;
      
      if (window.google && window.google.maps && window.google.maps.places) {
        // Real implementation would use PlacesService
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails(
          { placeId: suggestion.place_id },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              onChange({
                address: place.formatted_address,
                placeId: place.place_id,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                },
                components: place.address_components,
                neighborhood: place.vicinity
              });
            }
          }
        );
      } else {
        // Use mock data
        placeDetails = await mockGetPlaceDetails(suggestion.place_id, suggestion.description);
        onChange({
          address: placeDetails.formatted_address,
          placeId: placeDetails.place_id,
          coordinates: placeDetails.geometry.location,
          components: placeDetails.address_components,
          neighborhood: placeDetails.neighborhood
        });
      }
    } catch (err) {
      console.error('Place details error:', err);
      // Still update with basic info
      onChange({
        address: suggestion.description,
        placeId: suggestion.place_id
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          style={{ fontSize: '16px' }}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                index === selectedIndex ? 'bg-gray-50' : ''
              }`}
            >
              <MapPin size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                </div>
                <div className="text-sm text-gray-600">
                  {suggestion.structured_formatting?.secondary_text || suggestion.description.split(',').slice(1).join(',')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Google Places attribution (required by Terms of Service) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-12 text-xs text-gray-500 text-right">
          Powered by Google Places
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;