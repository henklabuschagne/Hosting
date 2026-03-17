import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Users } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'roles' | 'form'>('roles');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleQuickLogin = async (user: string) => {
    setError('');
    setIsLoading(true);
    try {
      await login(user, user === 'admin' ? 'Admin123!' : 'User123!');
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-primary-light to-brand-secondary-light">
      <div className="w-full max-w-5xl space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl text-brand-main">Hosting Platform</h1>
          <p className="text-muted-foreground">Management System</p>
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {view === 'roles' ? (
          <>
            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-brand-primary">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-brand-primary-light rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-brand-primary" />
                  </div>
                  <CardTitle>Administrator</CardTitle>
                  <CardDescription>Full system access with management capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      Manage servers and clients
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      Configure pricing tiers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      Health monitoring and alerts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      Full analytics access
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => handleQuickLogin('admin')}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-brand-primary">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-brand-primary-light rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-brand-primary" />
                  </div>
                  <CardTitle>Standard User</CardTitle>
                  <CardDescription>View-only access to platform data</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      View dashboard and analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      Browse server and client details
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                      View health status
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-warning" />
                      No admin or management access
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleQuickLogin('user')}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login as User'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button variant="link" onClick={() => setView('form')} className="text-brand-primary">
                Login with credentials instead
              </Button>
            </div>
          </>
        ) : (
          /* Email/Password Login Form */
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                {/* Test Credentials Info Box */}
                <div className="p-4 bg-brand-primary-light rounded-lg border border-brand-secondary">
                  <p className="text-sm font-medium text-brand-main mb-2">Test Credentials:</p>
                  <div className="text-xs text-brand-primary space-y-1">
                    <p>Admin: admin / Admin123!</p>
                    <p>User: user / User123!</p>
                  </div>
                </div>

                {view === 'form' && (
                  <div className="text-center">
                    <Button variant="link" onClick={() => setView('roles')} className="text-brand-primary">
                      Back to role selection
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}