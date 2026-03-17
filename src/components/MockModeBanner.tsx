import { Database, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isMockMode } from '../src/config';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function MockModeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('mockModeBannerDismissed');
    if (isMockMode() && !dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('mockModeBannerDismissed', 'true');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <Alert className="border-brand-secondary bg-brand-primary-light mb-6">
      <div className="flex items-start gap-3">
        <Database className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
        <AlertDescription className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-brand-main">
                Mock Mode Active
              </p>
              <p className="text-sm text-brand-primary">
                You're using demo data. All changes are automatically saved to localStorage and 
                persist across page reloads. Use the Dev Panel to reset to defaults.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 h-6 w-6 p-0"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
