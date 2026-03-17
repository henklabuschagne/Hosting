import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  storageKey: string;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function OnboardingTour({ 
  steps, 
  storageKey, 
  autoStart = false,
  onComplete 
}: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(storageKey);
    if (!hasSeenTour && autoStart) {
      setIsActive(true);
    }
  }, [storageKey, autoStart]);

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const placement = step.placement || 'bottom';
        
        let top = 0;
        let left = 0;

        switch (placement) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 10;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - 10;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 10;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 10;
            break;
        }

        setPosition({ top, left });
        
        // Highlight the element
        element.classList.add('tour-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Remove highlight from all elements
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    onComplete?.();
  };

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <Card 
        className="fixed z-50 w-80 shadow-xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, 0)',
        }}
      >
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{step.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} / {steps.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{step.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={handleSkip}
              aria-label="Close tour"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
            >
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="size-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add tour highlight styles */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 0.5rem;
          transition: box-shadow 0.3s ease;
        }
      `}</style>
    </>
  );
}

export function useTour(storageKey: string) {
  const [showTour, setShowTour] = useState(false);

  const startTour = () => {
    localStorage.removeItem(storageKey);
    setShowTour(true);
  };

  const hasSeenTour = () => {
    return localStorage.getItem(storageKey) === 'true';
  };

  return {
    showTour,
    startTour,
    hasSeenTour,
  };
}
