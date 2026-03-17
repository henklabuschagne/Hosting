import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Shield } from 'lucide-react';
import { ServerManagementAPI } from '../components/admin/ServerManagementAPI';
import { ClientManagementAPI } from '../components/admin/ClientManagementAPI';
import { PricingManagementAPI } from '../components/admin/PricingManagementAPI';

export function AdminPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Shield className="size-12 text-muted-foreground" />
              <div className="text-center">
                <h2>Access Denied</h2>
                <p className="text-muted-foreground">
                  You need admin privileges to access this page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage servers, clients, and pricing configurations
        </p>
      </div>

      <Tabs defaultValue="servers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="servers">Server Management</TabsTrigger>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="servers">
          <ServerManagementAPI />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagementAPI />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManagementAPI />
        </TabsContent>
      </Tabs>
    </div>
  );
}