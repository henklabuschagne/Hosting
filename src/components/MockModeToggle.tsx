import { useState } from 'react';
import { Settings, Database, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { isMockMode, setMockMode } from '../src/config';
import { useAppStore } from '../hooks/useAppStore';

export function MockModeToggle() {
  const { actions } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mockModeEnabled, setMockModeEnabled] = useState(isMockMode());

  const handleToggleMockMode = () => {
    const newValue = !mockModeEnabled;
    setMockModeEnabled(newValue);
    
    if (newValue) {
      // Enabling mock mode
      setMockMode(true);
    } else {
      // Disabling mock mode
      setMockMode(false);
    }
  };

  const handleResetMockData = () => {
    actions.resetAllData();
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {mockModeEnabled ? (
            <>
              <Database className="h-4 w-4" />
              Mock Mode
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Live Mode
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Data Mode Settings</DialogTitle>
          <DialogDescription>
            Toggle between mock data mode and live API mode
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mock Mode Toggle */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="mock-mode" className="text-base">
                Mock Data Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use mock data instead of connecting to the backend API
              </p>
            </div>
            <Switch
              id="mock-mode"
              checked={mockModeEnabled}
              onCheckedChange={handleToggleMockMode}
            />
          </div>

          {/* Status Alert */}
          <Alert>
            <div className="flex items-start gap-3">
              {mockModeEnabled ? (
                <Database className="h-5 w-5 text-blue-500 mt-0.5" />
              ) : (
                <Globe className="h-5 w-5 text-green-500 mt-0.5" />
              )}
              <AlertDescription className="space-y-2">
                {mockModeEnabled ? (
                  <>
                    <p className="font-medium">Mock Mode Active</p>
                    <p className="text-sm">
                      All data is simulated and changes persist only in your browser session.
                      No real API calls will be made. Perfect for testing and demonstrations.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Live Mode Active</p>
                    <p className="text-sm">
                      Connected to the backend API. All changes will be saved to the database.
                      Requires a running backend server.
                    </p>
                  </>
                )}
              </AlertDescription>
            </div>
          </Alert>

          {/* Mock Data Info */}
          {mockModeEnabled && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="font-medium text-sm">Mock Data Includes:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 3 user accounts (admin, john.doe, jane.smith)</li>
                <li>• 3 server tiers (small, medium, large)</li>
                <li>• 11 servers across all tiers</li>
                <li>• 7 clients with hosting history</li>
                <li>• 3 tier requests</li>
                <li>• Server health metrics (7 days of data)</li>
                <li>• Health alerts and analytics</li>
              </ul>
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Login Credentials:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Username: <code className="px-1.5 py-0.5 bg-background rounded">admin</code></p>
                  <p>Password: <code className="px-1.5 py-0.5 bg-background rounded">any password</code></p>
                </div>
              </div>
            </div>
          )}

          {/* Reset Mock Data Button */}
          {mockModeEnabled && (
            <div className="flex items-center justify-between space-x-4 pt-2">
              <div className="flex-1 space-y-1">
                <Label className="text-base">Reset Mock Data</Label>
                <p className="text-sm text-muted-foreground">
                  Restore all mock data to its initial state
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetMockData}
              >
                Reset Data
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}