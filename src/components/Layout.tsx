import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  LayoutDashboard, Users, Server, Layers, 
  FileInput, LogOut, Shield, BarChart3, HeartPulse, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { useKeyboardShortcuts, KeyboardShortcut } from '../hooks/useKeyboardShortcuts';
import { DevApiPanel } from './DevApiPanel';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const mainNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Servers', href: '/servers', icon: Server },
    { name: 'Health', href: '/health', icon: HeartPulse },
  ];

  const managementNav = [
    { name: 'Tiers', href: '/tiers', icon: Layers },
    { name: 'Requests', href: '/requests', icon: FileInput },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const shortcuts: KeyboardShortcut[] = [
    { key: 'd', altKey: true, handler: () => navigate('/'), description: 'Go to Dashboard' },
    { key: 'c', altKey: true, handler: () => navigate('/clients'), description: 'Go to Clients' },
    { key: 's', altKey: true, handler: () => navigate('/servers'), description: 'Go to Servers' },
    { key: 't', altKey: true, handler: () => navigate('/tiers'), description: 'Go to Tiers' },
    { key: 'r', altKey: true, handler: () => navigate('/requests'), description: 'Go to Requests' },
    { key: 'a', altKey: true, handler: () => navigate('/analytics'), description: 'Go to Analytics' },
    { key: '?', handler: () => setShortcutsOpen(true), description: 'Show keyboard shortcuts' },
  ];

  useKeyboardShortcuts(shortcuts);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: { name: string; href: string; icon: typeof LayoutDashboard }, closeMobile?: boolean) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <button
        key={item.name}
        onClick={() => {
          navigate(item.href);
          if (closeMobile) setMobileMenuOpen(false);
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors w-full text-left ${
          active
            ? 'bg-brand-primary-light text-brand-primary font-medium'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-brand-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
        {item.name}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 h-screen flex-col bg-white border-r border-border flex-shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl text-brand-main font-semibold">Hosting Platform</h2>
          <p className="text-sm text-muted-foreground mt-1">{user?.username}</p>
          <Badge variant="secondary" className="mt-1.5">
            {user?.roles?.includes('Admin') ? 'Admin' : 'User'}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1" role="navigation" aria-label="Main navigation">
          <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider font-medium">Overview</p>
          {mainNav.map(item => renderNavItem(item))}

          <Separator className="my-4" />

          <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider font-medium">Management</p>
          {managementNav.map(item => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <KeyboardShortcutsDialog
              groups={[
                { title: 'Navigation', shortcuts: shortcuts.filter(s => s.description.startsWith('Go to')) },
                { title: 'General', shortcuts: shortcuts.filter(s => !s.description.startsWith('Go to')) },
              ]}
            />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full text-left text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <h2 className="text-brand-main font-semibold">Hosting Platform</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <nav className="border-t bg-background p-4 space-y-1" role="navigation" aria-label="Mobile navigation">
              <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider font-medium">Overview</p>
              {mainNav.map(item => renderNavItem(item, true))}
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider font-medium">Management</p>
              {managementNav.map(item => renderNavItem(item, true))}
              <Separator className="my-4" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full text-left text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
                Logout
              </button>
            </nav>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" role="main">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Dev Panel - fixed position, outside main flow */}
      <DevApiPanel />
    </div>
  );
}