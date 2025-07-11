import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Plus, X, Star, TrendingUp, Save, CheckCircle, AlertCircle, Sparkles, FileText } from 'lucide-react';
import QuickPreferences from './QuickPreferences';

const FeedbackForm = ({ onSubmit, initialData = {} }) => {
  // Form state
  const [likes, setLikes] = useState(initialData.likes || []);
  const [dislikes, setDislikes] = useState(initialData.dislikes || []);
  const [currentLike, setCurrentLike] = useState('');
  const [currentDislike, setCurrentDislike] = useState('');
  const [realtorNotes, setRealtorNotes] = useState(initialData.realtorNotes || '');
  const [overallRating, setOverallRating] = useState(initialData.overallRating || 3);
  const [interestedLevel, setInterestedLevel] = useState(initialData.interestedLevel || 'medium');
  const [priceOpinion, setPriceOpinion] = useState(initialData.priceOpinion || 'fair');
  const [showingDuration, setShowingDuration] = useState(initialData.showingDuration || 30);
  const [preferences, setPreferences] = useState(initialData.preferences || {});
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'detailed'
  
  // UI state
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Common suggestions
  const commonLikes = [
    "Open floor plan",
    "Natural light",
    "Updated kitchen",
    "Large backyard",
    "Master suite",
    "Hardwood floors",
    "High ceilings",
    "Modern appliances",
    "Great location",
    "Quiet neighborhood"
  ];
  
  const commonDislikes = [
    "Small kitchen",
    "Outdated bathroom",
    "Poor lighting",
    "No garage",
    "Busy street",
    "Small bedrooms",
    "Old carpet",
    "Limited storage",
    "Needs repairs",
    "HOA fees"
  ];

  // Add/remove likes and dislikes
  const addLike = (like = currentLike) => {
    if (like.trim() && !likes.includes(like.trim())) {
      setLikes([...likes, like.trim()]);
      setCurrentLike('');
      // iOS haptic feedback
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    }
  };

  const removeLike = (index) => {
    setLikes(likes.filter((_, i) => i !== index));
  };

  const addDislike = (dislike = currentDislike) => {
    if (dislike.trim() && !dislikes.includes(dislike.trim())) {
      setDislikes([...dislikes, dislike.trim()]);
      setCurrentDislike('');
      // iOS haptic feedback
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    }
  };

  const removeDislike = (index) => {
    setDislikes(dislikes.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    const hasPreferences = Object.values(preferences).some(prefs => prefs.length > 0);
    if (likes.length === 0 && dislikes.length === 0 && !hasPreferences) {
      newErrors.feedback = 'Please add at least one preference, like, or dislike';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    const feedbackData = {
      likes,
      dislikes,
      realtorNotes,
      overallRating,
      priceOpinion,
      interestedLevel,
      showingDuration: parseInt(showingDuration),
      preferences
    };

    try {
      await onSubmit(feedbackData);
      
      // Success haptic feedback
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 50, 50]);
      }
      
      // Reset form
      setLikes([]);
      setDislikes([]);
      setCurrentLike('');
      setCurrentDislike('');
      setRealtorNotes('');
      setOverallRating(3);
      setInterestedLevel('medium');
      setPriceOpinion('fair');
      setShowingDuration(30);
      setPreferences({});
      setErrors({});
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} className="text-purple-600" />
            Property Feedback
          </h3>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'quick'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles size={18} />
              Quick Preferences
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'detailed'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={18} />
              Detailed Feedback
            </button>
          </div>
        </div>
        
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-800 font-medium">Feedback saved successfully!</span>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Quick Preferences Tab */}
          {activeTab === 'quick' && (
            <div className="space-y-6">
              <QuickPreferences 
                onUpdate={setPreferences}
                initialPreferences={preferences}
              />
              
              {/* Quick Rating Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    Overall Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setOverallRating(rating)}
                        className={`min-w-[48px] min-h-[48px] rounded-lg transition-all ${
                          rating <= overallRating
                            ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Star size={24} fill={rating <= overallRating ? 'white' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Level */}
                <div>
                  <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    Interest Level
                  </label>
                  <select 
                    className="w-full min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={interestedLevel}
                    onChange={(e) => setInterestedLevel(e.target.value)}
                    style={{ fontSize: '16px' }}
                  >
                    <option value="low">Low Interest</option>
                    <option value="medium">Medium Interest</option>
                    <option value="high">High Interest</option>
                    <option value="very high">Very High Interest - Ready to Offer!</option>
                  </select>
                </div>
              </div>
              
              {/* Realtor Notes for Quick Tab */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Quick Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  rows="3"
                  placeholder="Add quick observations or follow-up notes..."
                  value={realtorNotes}
                  onChange={(e) => setRealtorNotes(e.target.value)}
                  style={{ fontSize: '16px', minHeight: '80px' }}
                />
              </div>
            </div>
          )}
          
          {/* Detailed Feedback Tab */}
          {activeTab === 'detailed' && (
            <div className="space-y-6">
              {/* Likes Section */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <ThumbsUp size={16} className="text-green-500" />
              What They Liked
            </label>
            
            {/* Quick Suggestions */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {commonLikes.map(like => (
                  <button
                    key={like}
                    onClick={() => addLike(like)}
                    disabled={likes.includes(like)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-full text-sm transition-all ${
                      likes.includes(like)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 active:scale-95'
                    }`}
                    style={{ fontSize: '14px' }}
                  >
                    + {like}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Manual Entry */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="Add custom feedback..."
                value={currentLike}
                onChange={(e) => setCurrentLike(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLike()}
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={() => addLike()}
                className="min-w-[48px] min-h-[48px] bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center"
              >
                <Plus size={24} />
              </button>
            </div>
            
            {/* Current Likes */}
            <div className="space-y-2">
              {likes.map((like, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 group">
                  <span className="text-green-800" style={{ fontSize: '16px' }}>{like}</span>
                  <button
                    onClick={() => removeLike(index)}
                    className="min-w-[36px] min-h-[36px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center opacity-70 group-hover:opacity-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dislikes Section */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <ThumbsDown size={16} className="text-red-500" />
              What They Didn't Like
            </label>
            
            {/* Quick Suggestions */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {commonDislikes.map(dislike => (
                  <button
                    key={dislike}
                    onClick={() => addDislike(dislike)}
                    disabled={dislikes.includes(dislike)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-full text-sm transition-all ${
                      dislikes.includes(dislike)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 active:scale-95'
                    }`}
                    style={{ fontSize: '14px' }}
                  >
                    + {dislike}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Manual Entry */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                placeholder="Add custom feedback..."
                value={currentDislike}
                onChange={(e) => setCurrentDislike(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDislike()}
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={() => addDislike()}
                className="min-w-[48px] min-h-[48px] bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center"
              >
                <Plus size={24} />
              </button>
            </div>
            
            {/* Current Dislikes */}
            <div className="space-y-2">
              {dislikes.map((dislike, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-200 group">
                  <span className="text-red-800" style={{ fontSize: '16px' }}>{dislike}</span>
                  <button
                    onClick={() => removeDislike(index)}
                    className="min-w-[36px] min-h-[36px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center opacity-70 group-hover:opacity-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Error Message */}
            {errors.feedback && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.feedback}
              </p>
            )}
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Star size={16} className="text-yellow-500" />
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setOverallRating(rating)}
                  className={`min-w-[48px] min-h-[48px] rounded-lg transition-all ${
                    rating <= overallRating
                      ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Star size={24} fill={rating <= overallRating ? 'white' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Interest Level */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              Interest Level
            </label>
            <select 
              className="w-full min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              value={interestedLevel}
              onChange={(e) => setInterestedLevel(e.target.value)}
              style={{ fontSize: '16px' }}
            >
              <option value="low">Low Interest</option>
              <option value="medium">Medium Interest</option>
              <option value="high">High Interest</option>
              <option value="very high">Very High Interest - Ready to Offer!</option>
            </select>
          </div>

          {/* Price Opinion */}
          <div>
            <label className="block text-sm font-medium mb-3">Price Opinion</label>
            <select 
              className="w-full min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              value={priceOpinion}
              onChange={(e) => setPriceOpinion(e.target.value)}
              style={{ fontSize: '16px' }}
            >
              <option value="too high">Too High 📈</option>
              <option value="slightly high">Slightly High 📊</option>
              <option value="fair">Fair Price ✅</option>
              <option value="good deal">Good Deal 💰</option>
              <option value="great deal">Great Deal! 🎯</option>
            </select>
          </div>

          {/* Showing Duration */}
          <div>
            <label className="block text-sm font-medium mb-3">Showing Duration (minutes)</label>
            <input
              type="number"
              className="w-full min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              value={showingDuration}
              onChange={(e) => setShowingDuration(e.target.value)}
              min="5"
              max="120"
              style={{ fontSize: '16px' }}
            />
          </div>

              {/* Realtor Notes */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Realtor Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  rows="4"
                  placeholder="Add your observations, follow-up actions, or additional context..."
                  value={realtorNotes}
                  onChange={(e) => setRealtorNotes(e.target.value)}
                  style={{ fontSize: '16px', minHeight: '120px' }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full min-h-[56px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition-all font-medium text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;