import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Users, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  created_at: string;
  enrollments?: { count: number }[];
}

const Courses = () => {
  const { toast } = useToast();

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count)
        `);
      
      if (error) throw error;
      return data as Course[];
    }
  });

  if (error) {
    toast({
      title: "Error loading courses",
      description: "Please check if you're authenticated",
      variant: "destructive"
    });
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          </div>
          <p className="text-muted-foreground">Manage your course content and curriculum</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses?.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-card-foreground">{course.title}</CardTitle>
                  <CardDescription>{course.description || "No description available"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">
                      {course.enrollments?.[0]?.count || 0} students enrolled
                    </Badge>
                  </div>
                  <Button className="w-full">Manage Course</Button>
                </CardContent>
              </Card>
            ))}
            
            {(!courses || courses.length === 0) && !isLoading && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-6">Get started by creating your first course</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Courses;