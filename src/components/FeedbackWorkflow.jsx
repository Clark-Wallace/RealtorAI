import { useState } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, Users, Home, 
  MessageSquare, Save, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import ClientSelector from './ClientSelector';
import PropertySelector from './PropertySelector';
import FeedbackForm from './FeedbackForm';
import { useData } from '../context/DataContext';
import { useNotification } from './NotificationSystem';

const FeedbackWorkflow = ({ onComplete }) => {
  const { addFeedback } = useData();
  const { notify } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({
    clientId: null,
    propertyId: null,
    manualFeedback: {
      overallRating: 0,
      interestedLevel: '',
      priceOpinion: '',
      likes: [],
      dislikes: [],
      showingDuration: 30,
      realtorNotes: '',
      preferences: {}
    }
  });

  const steps = [
    { id: 1, label: 'Select Client', icon: Users },
    { id: 2, label: 'Select Property', icon: Home },
    { id: 3, label: 'Add Feedback', icon: MessageSquare },
    { id: 4, label: 'Review & Save', icon: Save }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return workflowData.clientId !== null;
      case 2:
        return workflowData.propertyId !== null;
      case 3:
        const feedback = workflowData.manualFeedback;
        const hasPreferences = Object.values(feedback.preferences || {}).some(prefs => prefs.length > 0);
        return (feedback.likes.length > 0 || feedback.dislikes.length > 0 || hasPreferences) &&
               feedback.overallRating > 0 && 
               feedback.interestedLevel &&
               feedback.priceOpinion;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFeedbackUpdate = (feedbackData) => {
    setWorkflowData({
      ...workflowData,
      manualFeedback: feedbackData
    });
    // Auto-advance to review step
    if (currentStep === 3 && canProceed()) {
      handleNext();
    }
  };

  const handleSave = async () => {
    const feedbackEntry = {
      clientId: workflowData.clientId,
      propertyId: workflowData.propertyId,
      overallRating: workflowData.manualFeedback.overallRating,
      interestedLevel: workflowData.manualFeedback.interestedLevel,
      priceOpinion: workflowData.manualFeedback.priceOpinion,
      likes: workflowData.manualFeedback.likes,
      dislikes: workflowData.manualFeedback.dislikes,
      showingDuration: workflowData.manualFeedback.showingDuration,
      realtorNotes: workflowData.manualFeedback.realtorNotes,
      preferences: workflowData.manualFeedback.preferences,
      createdAt: new Date().toISOString(),
      source: 'guided-workflow'
    };

    await addFeedback(feedbackEntry);
    
    notify.success('Feedback saved successfully!', {
      description: 'The property feedback has been recorded.',
      duration: 5000
    });
    
    if (onComplete) {
      onComplete(feedbackEntry);
    } else {
      // Reset workflow
      setCurrentStep(1);
      setWorkflowData({
        clientId: null,
        propertyId: null,
        manualFeedback: {
          overallRating: 0,
          interestedLevel: '',
          priceOpinion: '',
          likes: [],
          dislikes: [],
          showingDuration: 30,
          realtorNotes: '',
          preferences: {}
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  disabled={!isCompleted && !isActive}
                  className={`flex flex-col items-center gap-2 ${
                    isCompleted ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${isActive ? 'bg-blue-600 text-white scale-110' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
        {/* Step 1: Select Client */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Select a Client</h2>
            <p className="text-gray-600">Choose the client who viewed the property.</p>
            <ClientSelector
              value={workflowData.clientId}
              onChange={(clientId) => setWorkflowData({ ...workflowData, clientId })}
            />
          </div>
        )}

        {/* Step 2: Select Property */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Select a Property</h2>
            <p className="text-gray-600">Choose the property that was shown.</p>
            <PropertySelector
              value={workflowData.propertyId}
              onChange={(propertyId) => setWorkflowData({ ...workflowData, propertyId })}
            />
          </div>
        )}

        {/* Step 3: Add Feedback */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Property Feedback</h2>
            <p className="text-gray-600">Record the client's feedback and preferences.</p>
            <FeedbackForm
              initialData={workflowData.manualFeedback}
              onSubmit={handleFeedbackUpdate}
              submitLabel="Continue to Review"
              clientId={workflowData.clientId}
              propertyId={workflowData.propertyId}
            />
          </div>
        )}

        {/* Step 4: Review & Save */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Star size={64} className="mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Feedback</h2>
              <p className="text-gray-600 mb-8">
                Everything looks good! Your feedback is ready to save.
              </p>
            </div>
            
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Feedback Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Overall Rating:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < workflowData.manualFeedback.overallRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Interest Level:</span>
                  <p className="font-medium capitalize">{workflowData.manualFeedback.interestedLevel.replace(/[-_]/g, ' ')}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Price Opinion:</span>
                  <p className="font-medium capitalize">{workflowData.manualFeedback.priceOpinion.replace(/[-_]/g, ' ')}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Showing Duration:</span>
                  <p className="font-medium">{workflowData.manualFeedback.showingDuration} minutes</p>
                </div>
              </div>
              
              {workflowData.manualFeedback.likes.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Likes:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {workflowData.manualFeedback.likes.map((like, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {like}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {workflowData.manualFeedback.dislikes.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Dislikes:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {workflowData.manualFeedback.dislikes.map((dislike, i) => (
                      <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {dislike}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {workflowData.manualFeedback.realtorNotes && (
                <div>
                  <span className="text-gray-600 text-sm">Notes:</span>
                  <p className="mt-1 text-gray-800">{workflowData.manualFeedback.realtorNotes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Edit Feedback
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all text-lg font-medium"
              >
                Save Feedback
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        {currentStep < 4 && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              !canProceed()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedbackWorkflow;