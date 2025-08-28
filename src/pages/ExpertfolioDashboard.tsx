import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Settings } from "lucide-react";

const ExpertfolioDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            Expertfolio Dashboard
          </h1>
          <p className="text-muted-foreground">
            Enterprise-grade audit logs and file management
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1,234</div>
                <div className="text-sm text-muted-foreground">Total Logs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">56</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">User logged in</span>
                <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">File uploaded</span>
                <span className="text-xs text-muted-foreground ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Settings updated</span>
                <span className="text-xs text-muted-foreground ml-auto">10 min ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                View and manage system audit logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Management
              </CardTitle>
              <CardDescription>
                Upload and manage files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Manage Files
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExpertfolioDashboardPage;