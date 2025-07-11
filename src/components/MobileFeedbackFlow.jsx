import { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, Star, Home, 
  MapPin, DollarSign, Clock, MessageSquare, Heart,
  ThumbsUp, ThumbsDown, TrendingUp, Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from './NotificationSystem';
import ClientSelector from './ClientSelector';
import PropertySelector from './PropertySelector';
import QuickPreferences from './QuickPreferences';

const MobileFeedbackFlow = () => {
  const { addFeedback } = useData();
  const { notify } = useNotification();
  
  // Flow state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    clientId: '',
    propertyId: '',
    overallRating: 0,
    interestedLevel: '',
    quickFeedback: [],
    preferences: {},
    realtorNotes: ''
  });

  // Steps configuration
  const steps = [
    { id: 'client', title: 'Select Client', icon: Home },
    { id: 'property', title: 'Select Property', icon: MapPin },
    { id: 'rating', title: 'Rate Property', icon: Star },
    { id: 'interest', title: 'Interest Level', icon: TrendingUp },
    { id: 'feedback', title: 'Quick Feedback', icon: Heart },
    { id: 'preferences', title: 'Preferences', icon: Sparkles },
    { id: 'notes', title: 'Add Notes', icon: MessageSquare }
  ];

  // Quick feedback options
  const quickFeedbackOptions = {
    positive: [
      { id: 'great-location', label: 'Great Location', icon: MapPin },
      { id: 'good-value', label: 'Good Value', icon: DollarSign },
      { id: 'move-in-ready', label: 'Move-in Ready', icon: Home },
      { id: 'perfect-size', label: 'Perfect Size', icon: Check }
    ],
    negative: [
      { id: 'overpriced', label: 'Overpriced', icon: DollarSign },
      { id: 'needs-work', label: 'Needs Work', icon: Home },
      { id: 'too-small', label: 'Too Small', icon: Home },
      { id: 'bad-location', label: 'Bad Location', icon: MapPin }
    ]
  };

  // Interest level options
  const interestLevels = [
    { value: 'not-interested', label: 'Not Interested', color: 'gray', emoji: '😐' },
    { value: 'somewhat', label: 'Somewhat Interested', color: 'yellow', emoji: '🤔' },
    { value: 'interested', label: 'Interested', color: 'blue', emoji: '😊' },
    { value: 'very-interested', label: 'Very Interested', color: 'green', emoji: '😍' },
    { value: 'ready-to-offer', label: 'Ready to Offer!', color: 'purple', emoji: '🎯' }
  ];

  // Handle step navigation
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle quick feedback
  const toggleQuickFeedback = (feedbackId) => {
    const current = formData.quickFeedback || [];
    const updated = current.includes(feedbackId)
      ? current.filter(id => id !== feedbackId)
      : [...current, feedbackId];
    
    updateFormData('quickFeedback', updated);
    
    // Haptic feedback
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  // Submit feedback
  const handleSubmit = async () => {
    try {
      // Transform quick feedback into likes/dislikes
      const likes = [];
      const dislikes = [];
      
      formData.quickFeedback.forEach(feedbackId => {
        const positive = quickFeedbackOptions.positive.find(opt => opt.id === feedbackId);
        const negative = quickFeedbackOptions.negative.find(opt => opt.id === feedbackId);
        
        if (positive) likes.push(positive.label);
        if (negative) dislikes.push(negative.label);
      });

      const feedbackData = {
        clientId: parseInt(formData.clientId),
        propertyId: parseInt(formData.propertyId),
        overallRating: formData.overallRating,
        interestedLevel: formData.interestedLevel,
        likes,
        dislikes,
        preferences: formData.preferences,
        realtorNotes: formData.realtorNotes,
        createdAt: new Date().toISOString(),
        source: 'mobile-flow'
      };

      addFeedback(feedbackData);
      
      notify.success('Feedback saved!', {
        description: 'Property feedback has been recorded successfully.',
        duration: 3000
      });

      // Haptic success feedback
      if (window.navigator?.vibrate) {
        window.navigator.vibrate([50, 50, 50]);
      }

      // Reset form
      setFormData({
        clientId: '',
        propertyId: '',
        overallRating: 0,
        interestedLevel: '',
        quickFeedback: [],
        preferences: {},
        realtorNotes: ''
      });
      setCurrentStep(0);

    } catch (error) {
      notify.error('Failed to save feedback', {
        description: error.message
      });
    }
  };

  // Check if step is complete
  const isStepComplete = (stepId) => {
    switch (stepId) {
      case 'client': return !!formData.clientId;
      case 'property': return !!formData.propertyId;
      case 'rating': return formData.overallRating > 0;
      case 'interest': return !!formData.interestedLevel;
      case 'feedback': return true; // Optional
      case 'preferences': return true; // Optional
      case 'notes': return true; // Optional
      default: return false;
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep || isStepComplete(step.id);
          
          return (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`
                relative flex flex-col items-center gap-1 transition-all
                ${isActive ? 'scale-110' : ''}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isActive 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : isComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                {isComplete && !isActive ? (
                  <Check size={16} />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              {isActive && (
                <span className="absolute -bottom-6 text-xs font-medium text-gray-700 whitespace-nowrap">
                  {step.title}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-10">
        <div className="p-6">
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <StepIcon className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            {/* Client Selection */}
            {currentStep === 0 && (
              <ClientSelector
                value={formData.clientId}
                onChange={(value) => updateFormData('clientId', value)}
                compact
              />
            )}

            {/* Property Selection */}
            {currentStep === 1 && (
              <PropertySelector
                value={formData.propertyId}
                onChange={(value) => updateFormData('propertyId', value)}
                compact
              />
            )}

            {/* Rating */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600">How would you rate this property overall?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => updateFormData('overallRating', rating)}
                      className={`
                        w-14 h-14 rounded-lg transition-all
                        ${rating <= formData.overallRating
                          ? 'bg-yellow-500 text-white shadow-lg scale-110'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }
                      `}
                    >
                      <Star size={28} fill={rating <= formData.overallRating ? 'white' : 'none'} />
                    </button>
                  ))}
                </div>
                {formData.overallRating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {formData.overallRating === 5 ? 'Excellent!' : 
                     formData.overallRating === 4 ? 'Very Good' :
                     formData.overallRating === 3 ? 'Good' :
                     formData.overallRating === 2 ? 'Fair' : 'Poor'}
                  </p>
                )}
              </div>
            )}

            {/* Interest Level */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <p className="text-gray-600 mb-4">What's the client's interest level?</p>
                {interestLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateFormData('interestedLevel', level.value)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${formData.interestedLevel === level.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.emoji}</span>
                        <span className="font-medium">{level.label}</span>
                      </div>
                      {formData.interestedLevel === level.value && (
                        <Check className="text-purple-600" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Feedback */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-gray-600">Select what applies to this property:</p>
                
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                    <ThumbsUp size={16} />
                    Positive Aspects
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickFeedbackOptions.positive.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.quickFeedback.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleQuickFeedback(option.id)}
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            ${isSelected
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={isSelected ? 'text-green-600' : 'text-gray-400'} />
                            <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                    <ThumbsDown size={16} />
                    Concerns
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickFeedbackOptions.negative.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.quickFeedback.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleQuickFeedback(option.id)}
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            ${isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={isSelected ? 'text-red-600' : 'text-gray-400'} />
                            <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {currentStep === 5 && (
              <div>
                <p className="text-gray-600 mb-4">Track detailed preferences (optional):</p>
                <QuickPreferences
                  onUpdate={(prefs) => updateFormData('preferences', prefs)}
                  initialPreferences={formData.preferences}
                />
              </div>
            )}

            {/* Notes */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <p className="text-gray-600">Any additional notes or observations?</p>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  rows="6"
                  placeholder="Add any additional observations, follow-up actions, or context..."
                  value={formData.realtorNotes}
                  onChange={(e) => updateFormData('realtorNotes', e.target.value)}
                  style={{ fontSize: '16px' }}
                />
                
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Feedback Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• Rating: {formData.overallRating}/5 stars</p>
                    <p>• Interest: {interestLevels.find(l => l.value === formData.interestedLevel)?.label || 'Not set'}</p>
                    <p>• Quick feedback: {formData.quickFeedback.length} items</p>
                    <p>• Preferences tracked: {Object.values(formData.preferences).flat().length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!isStepComplete(currentStepData.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${isStepComplete(currentStepData.id)
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Check size={20} />
                Save Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFeedbackFlow;