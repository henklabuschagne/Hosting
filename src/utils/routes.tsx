import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/Layout';
import { LoginPage } from '../components/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomePage } from '../pages/HomePage';
import { ClientsPageAPI } from '../pages/ClientsPageAPI';
import { ClientDetailPageAPI } from '../pages/ClientDetailPageAPI';
import { ServersPageAPI } from '../pages/ServersPageAPI';
import { ServerDetailPageAPI } from '../pages/ServerDetailPageAPI';
import { RequestsPage } from '../pages/RequestsPage';
import { TiersPage } from '../pages/TiersPage';
import { AnalyticsPageAPI } from '../pages/AnalyticsPageAPI';
import { AdminPage } from '../pages/AdminPage';
import { ServerHealthDashboard } from '../pages/ServerHealthDashboard';
import { HealthAlertsPage } from '../pages/HealthAlertsPage';
import { ServerHealthDetail } from '../components/health/ServerHealthDetail';
import { ServerHealthSettings } from '../components/health/ServerHealthSettings';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: HomePage },
      { path: 'clients', Component: ClientsPageAPI },
      { path: 'clients/:id', Component: ClientDetailPageAPI },
      { path: 'servers', Component: ServersPageAPI },
      { path: 'servers/:id', Component: ServerDetailPageAPI },
      { path: 'servers/:serverId/health', Component: ServerHealthDetail },
      { path: 'servers/:serverId/health/settings', Component: ServerHealthSettings },
      { path: 'tiers', Component: TiersPage },
      { path: 'requests', Component: RequestsPage },
      { path: 'analytics', Component: AnalyticsPageAPI },
      { path: 'health', Component: ServerHealthDashboard },
      { path: 'health/alerts', Component: HealthAlertsPage },
      { 
        path: 'admin', 
        element: (
          <ProtectedRoute requireAdmin>
            <AdminPage />
          </ProtectedRoute>
        )
      },
    ],
  },
]);