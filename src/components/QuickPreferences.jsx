import { useState } from 'react';
import { 
  Home, Utensils, Bed, Bath, Trees, Car, Zap, 
  DollarSign, MapPin, School, Shield, Volume2,
  Sun, Thermometer, Wifi, Heart, Package, Eye,
  ChevronDown, ChevronUp, Check, X, Info
} from 'lucide-react';

const QuickPreferences = ({ onUpdate, initialPreferences = {} }) => {
  const [expandedCategories, setExpandedCategories] = useState(['layout']);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [showTooltip, setShowTooltip] = useState(null);

  // Comprehensive preference categories with icons and suggestions
  const categories = {
    layout: {
      icon: Home,
      title: 'Layout & Space',
      color: 'blue',
      items: [
        'Open concept', 'Formal dining', 'Great room', 'Split bedrooms',
        'Home office', 'Bonus room', 'Finished basement', 'Mother-in-law suite',
        'High ceilings', 'Vaulted ceilings', 'Large windows', 'Natural light',
        'Flexible spaces', 'Storage room', 'Walk-in pantry', 'Mudroom'
      ]
    },
    kitchen: {
      icon: Utensils,
      title: 'Kitchen Features',
      color: 'orange',
      items: [
        'Island', 'Breakfast bar', 'Double oven', 'Gas stove',
        'Stainless appliances', 'Granite counters', 'Quartz counters', 'Wine fridge',
        'Walk-in pantry', 'Butler pantry', 'Eat-in kitchen', 'Kitchen nook',
        'Subway tile', 'Farmhouse sink', 'Pot filler', 'Coffee bar'
      ]
    },
    bedrooms: {
      icon: Bed,
      title: 'Bedrooms',
      color: 'purple',
      items: [
        'Main floor master', 'Master upstairs', 'Walk-in closet', 'Dual closets',
        'Sitting area', 'Ensuite bathroom', 'Private balcony', 'Bay windows',
        'Built-in storage', 'Jack and Jill bath', 'Guest suite', 'Nursery ready',
        'Ceiling fan', 'Blackout ready', 'Sound insulation', 'Natural light'
      ]
    },
    bathrooms: {
      icon: Bath,
      title: 'Bathrooms',
      color: 'cyan',
      items: [
        'Double vanity', 'Soaking tub', 'Walk-in shower', 'Separate tub/shower',
        'Rainfall shower', 'Steam shower', 'Heated floors', 'Bidet',
        'Linen closet', 'Natural light', 'Skylight', 'Updated fixtures',
        'Marble', 'Tile shower', 'Glass doors', 'Storage vanity'
      ]
    },
    outdoor: {
      icon: Trees,
      title: 'Outdoor Space',
      color: 'green',
      items: [
        'Large backyard', 'Private yard', 'Deck', 'Patio',
        'Pool', 'Hot tub', 'Fire pit', 'Outdoor kitchen',
        'Covered porch', 'Screened porch', 'Pergola', 'Garden space',
        'Mature trees', 'Privacy fence', 'Sprinkler system', 'Low maintenance'
      ]
    },
    parking: {
      icon: Car,
      title: 'Parking & Storage',
      color: 'gray',
      items: [
        '2-car garage', '3-car garage', 'Attached garage', 'Garage storage',
        'Workshop space', 'RV parking', 'Boat storage', 'Extra parking',
        'Circular driveway', 'Side entry garage', 'Heated garage', 'EV charging',
        'Storage shed', 'Attic storage', 'Basement storage', 'Built-ins'
      ]
    },
    systems: {
      icon: Zap,
      title: 'Systems & Efficiency',
      color: 'yellow',
      items: [
        'New HVAC', 'Dual zone', 'Smart thermostat', 'Central air',
        'Solar panels', 'Tankless water heater', 'Water softener', 'Whole house fan',
        'New roof', 'New windows', 'Good insulation', 'Energy efficient',
        'Generator', 'Security system', 'Smart home', 'Fiber internet'
      ]
    },
    location: {
      icon: MapPin,
      title: 'Location Preferences',
      color: 'red',
      items: [
        'Quiet street', 'Cul-de-sac', 'Corner lot', 'Golf course',
        'Water view', 'Mountain view', 'City view', 'Walkable',
        'Near shopping', 'Near restaurants', 'Public transit', 'Highway access',
        'Gated community', 'Active community', 'Low traffic', 'Sidewalks'
      ]
    },
    community: {
      icon: School,
      title: 'Community & Schools',
      color: 'indigo',
      items: [
        'Top schools', 'Elementary nearby', 'Private schools', 'School bus',
        'Parks nearby', 'Walking trails', 'Bike paths', 'Dog park',
        'Community pool', 'Tennis courts', 'Gym/fitness', 'Clubhouse',
        'Low HOA', 'No HOA', 'Active HOA', 'Family friendly'
      ]
    },
    dealBreakers: {
      icon: X,
      title: 'Deal Breakers',
      color: 'red',
      negative: true,
      items: [
        'Busy road', 'Train noise', 'Airport noise', 'Power lines',
        'Flood zone', 'Steep driveway', 'Dated systems', 'Major repairs',
        'High HOA fees', 'Rental restrictions', 'Small lot', 'No garage',
        'Carpet throughout', 'Low ceilings', 'No storage', 'Bad layout'
      ]
    }
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle preference
  const togglePreference = (category, item) => {
    const categoryPrefs = preferences[category] || [];
    const updated = categoryPrefs.includes(item)
      ? categoryPrefs.filter(p => p !== item)
      : [...categoryPrefs, item];
    
    const newPreferences = {
      ...preferences,
      [category]: updated
    };
    
    setPreferences(newPreferences);
    onUpdate(newPreferences);

    // Haptic feedback
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  // Get preference count for a category
  const getPreferenceCount = (category) => {
    return (preferences[category] || []).length;
  };

  // Get color classes for category
  const getColorClasses = (color, isNegative = false) => {
    const colors = {
      blue: isNegative ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600',
      orange: isNegative ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600',
      purple: isNegative ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600',
      cyan: isNegative ? 'bg-cyan-600' : 'bg-cyan-500 hover:bg-cyan-600',
      green: isNegative ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600',
      gray: isNegative ? 'bg-gray-600' : 'bg-gray-500 hover:bg-gray-600',
      yellow: isNegative ? 'bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600',
      red: isNegative ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600',
      indigo: isNegative ? 'bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600'
    };
    return colors[color] || colors.blue;
  };

  const getBgColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      orange: 'bg-orange-50 border-orange-200',
      purple: 'bg-purple-50 border-purple-200',
      cyan: 'bg-cyan-50 border-cyan-200',
      green: 'bg-green-50 border-green-200',
      gray: 'bg-gray-50 border-gray-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      red: 'bg-red-50 border-red-200',
      indigo: 'bg-indigo-50 border-indigo-200'
    };
    return colors[color] || colors.blue;
  };

  const getTextColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-700',
      orange: 'text-orange-700',
      purple: 'text-purple-700',
      cyan: 'text-cyan-700',
      green: 'text-green-700',
      gray: 'text-gray-700',
      yellow: 'text-yellow-700',
      red: 'text-red-700',
      indigo: 'text-indigo-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-purple-600" size={20} />
            <span className="font-medium text-gray-800">
              Quick Preference Tracker
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {Object.values(preferences).flat().length} preferences selected
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(categories).map(([key, category]) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(key);
          const count = getPreferenceCount(key);
          const selectedItems = preferences[key] || [];

          return (
            <div 
              key={key} 
              className={`rounded-lg border-2 transition-all ${
                isExpanded ? 'shadow-md' : ''
              } ${getBgColorClasses(category.color)}`}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(key)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors rounded-t-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-white ${getColorClasses(category.color, true)}`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">
                      {category.title}
                    </h3>
                    {count > 0 && (
                      <p className={`text-sm ${getTextColorClasses(category.color)}`}>
                        {count} selected
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {count > 0 && !isExpanded && (
                    <div className="flex -space-x-1">
                      {selectedItems.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className={`px-2 py-1 text-xs text-white rounded-full ${getColorClasses(category.color, true)}`}
                        >
                          {item.split(' ').slice(0, 2).join(' ')}
                        </div>
                      ))}
                      {selectedItems.length > 3 && (
                        <div className={`px-2 py-1 text-xs text-white rounded-full ${getColorClasses(category.color, true)}`}>
                          +{selectedItems.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => {
                      const isSelected = selectedItems.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => togglePreference(key, item)}
                          className={`
                            px-4 py-2 rounded-full text-sm font-medium
                            transition-all transform active:scale-95
                            ${isSelected 
                              ? `text-white ${getColorClasses(category.color)} shadow-md`
                              : `bg-white text-gray-700 hover:bg-gray-50 border border-gray-300`
                            }
                          `}
                        >
                          {isSelected && <Check size={14} className="inline mr-1" />}
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tips for category */}
                  {key === 'dealBreakers' && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg flex items-start gap-2">
                      <Info size={16} className="text-red-600 mt-0.5" />
                      <p className="text-sm text-red-800">
                        These are features that would make a property unsuitable for your client.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Check className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Must-Haves</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {Object.entries(preferences)
              .filter(([key]) => !categories[key].negative)
              .reduce((sum, [, items]) => sum + items.length, 0)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <X className="text-red-600" size={16} />
            <span className="text-sm font-medium text-red-800">Deal Breakers</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {preferences.dealBreakers?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickPreferences;