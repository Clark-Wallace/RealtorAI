import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if prompt was dismissed recently
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const daysSinceDismissed = (new Date() - dismissedDate) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds or 3 page views
      const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
      localStorage.setItem('pageViews', pageViews.toString());
      
      if (pageViews >= 3) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after delay if not installed
    if (isIOSDevice && !isInstalled) {
      const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
      localStorage.setItem('pageViews', pageViews.toString());
      
      if (pageViews >= 3) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!isIOS && deferredPrompt) {
      // Show the install prompt for Android/Desktop
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', new Date().toISOString());
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Smartphone className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Add to Home Screen</h3>
                <p className="text-sm text-gray-600">Install RealtorAI for quick access</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">1</span>
              </div>
              <div>
                <p className="text-gray-900 flex items-center gap-2">
                  Tap the <Share className="inline" size={18} /> share button
                </p>
                <p className="text-sm text-gray-600">In Safari's bottom toolbar</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">2</span>
              </div>
              <div>
                <p className="text-gray-900">Scroll down and tap "Add to Home Screen"</p>
                <p className="text-sm text-gray-600">You may need to scroll in the share menu</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">3</span>
              </div>
              <div>
                <p className="text-gray-900">Tap "Add" to install</p>
                <p className="text-sm text-gray-600">RealtorAI will appear on your home screen</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Why install?</strong> Get instant access, work offline, and receive 
              notifications for new property matches.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="text-blue-600" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Install RealtorAI</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add to your home screen for quick access and offline use
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;