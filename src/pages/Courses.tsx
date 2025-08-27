import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Courses = () => {
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
              <CardDescription>Basic mathematics and algebra</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">24 students enrolled</p>
              <Button className="w-full">Manage Course</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Science Fundamentals</CardTitle>
              <CardDescription>Introduction to basic science concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">18 students enrolled</p>
              <Button className="w-full">Manage Course</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>English Literature</CardTitle>
              <CardDescription>Reading comprehension and writing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">32 students enrolled</p>
              <Button className="w-full">Manage Course</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button>Add New Course</Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Courses;