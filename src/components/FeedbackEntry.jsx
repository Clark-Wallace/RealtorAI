import { useState, useEffect } from 'react';
import { AlertCircle, Workflow, FileText, Smartphone } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from './NotificationSystem';
import ClientSelector from './ClientSelector';
import PropertySelector from './PropertySelector';
import FeedbackForm from './FeedbackForm';
import FeedbackWorkflow from './FeedbackWorkflow';
import MobileFeedbackFlow from './MobileFeedbackFlow';

const FeedbackEntry = () => {
  const { addFeedback } = useData();
  const { notify } = useNotification();
  const [viewMode, setViewMode] = useState('workflow'); // 'workflow', 'form', or 'mobile'
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-switch to mobile flow on small screens
      if (window.innerWidth < 768 && viewMode === 'form') {
        setViewMode('mobile');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Form mode state
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [errors, setErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validate selections
  const validateSelections = () => {
    const newErrors = {};
    
    if (!selectedClient) {
      newErrors.client = 'Please select a client';
    }
    
    if (!selectedProperty) {
      newErrors.property = 'Please select a property';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle feedback submission in form mode
  const handleFeedbackSubmit = async (feedbackData) => {
    setShowValidation(true);
    
    if (!validateSelections()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      throw new Error('Please select client and property');
    }

    const newFeedback = {
      clientId: parseInt(selectedClient),
      propertyId: parseInt(selectedProperty),
      ...feedbackData
    };

    addFeedback(newFeedback);
    
    // Show success notification
    notify.success('Feedback saved successfully!', {
      description: 'The property feedback has been recorded.',
      duration: 5000
    });
    
    // Reset form
    setSelectedClient('');
    setSelectedProperty('');
    setErrors({});
    setShowValidation(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle workflow completion
  const handleWorkflowComplete = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* View Mode Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Property Feedback</h2>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setViewMode('workflow')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all whitespace-nowrap ${
              viewMode === 'workflow'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Workflow size={18} />
            <span className="text-sm sm:text-base">Guided</span>
          </button>
          <button
            onClick={() => setViewMode('form')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all whitespace-nowrap ${
              viewMode === 'form'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText size={18} />
            <span className="text-sm sm:text-base">Form</span>
          </button>
          {isMobile && (
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                viewMode === 'mobile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone size={18} />
              <span className="text-sm sm:text-base">Mobile</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-900">Feedback Saved Successfully!</h3>
            <p className="text-sm text-green-700">The property feedback has been recorded.</p>
          </div>
        </div>
      )}

      {/* Render based on view mode */}
      {viewMode === 'workflow' && (
        <FeedbackWorkflow onComplete={handleWorkflowComplete} />
      )}
      
      {viewMode === 'mobile' && (
        <MobileFeedbackFlow />
      )}
      
      {viewMode === 'form' && (
        <>
          {/* Validation Alert */}
          {showValidation && Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-red-900">Please fix the following errors:</h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Client and Property Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Client Selector */}
            <ClientSelector 
              value={selectedClient}
              onChange={setSelectedClient}
              error={showValidation ? errors.client : null}
            />
            
            {/* Property Selector */}
            <PropertySelector 
              value={selectedProperty}
              onChange={setSelectedProperty}
              error={showValidation ? errors.property : null}
            />
          </div>

          {/* Feedback Form */}
          <FeedbackForm 
            onSubmit={handleFeedbackSubmit}
            clientId={selectedClient}
            propertyId={selectedProperty}
          />
        </>
      )}
    </div>
  );
};

export default FeedbackEntry;