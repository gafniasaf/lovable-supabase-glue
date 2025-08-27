import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Assignments = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
          <p className="text-gray-600">Create and manage student assignments</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Math Homework #3</CardTitle>
              <CardDescription>Algebra and equations practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge>Due: Dec 30</Badge>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">15/24 submissions</p>
              <Button className="w-full">Review Submissions</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Science Lab Report</CardTitle>
              <CardDescription>Chemical reactions experiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge>Due: Jan 5</Badge>
                <Badge variant="outline">Draft</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">0/18 submissions</p>
              <Button className="w-full">Edit Assignment</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Literature Essay</CardTitle>
              <CardDescription>Character analysis assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge>Due: Dec 28</Badge>
                <Badge variant="destructive">Overdue</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">28/32 submissions</p>
              <Button className="w-full">Grade Submissions</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button>Create New Assignment</Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assignments;