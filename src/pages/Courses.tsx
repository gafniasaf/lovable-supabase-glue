import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Courses = () => {
  const { user, signOut } = useAuth();

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Please log in to view courses.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">Manage your course content and curriculum</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Mathematics 101</CardTitle>
              <CardDescription>Introduction to Algebra and Geometry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary">24 students enrolled</Badge>
                <Badge>Active</Badge>
              </div>
              <Button className="w-full">Manage Course</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Science Fundamentals</CardTitle>
              <CardDescription>Physics, Chemistry, and Biology basics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary">18 students enrolled</Badge>
                <Badge>Active</Badge>
              </div>
              <Button className="w-full">Manage Course</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Literature Studies</CardTitle>
              <CardDescription>Classic and modern literature analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary">32 students enrolled</Badge>
                <Badge>Active</Badge>
              </div>
              <Button className="w-full">Manage Course</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button>Add New Course</Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button onClick={signOut} variant="destructive">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Courses;