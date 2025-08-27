import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  enrolled_courses?: number;
}

const Students = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;

      try {
        // Get all student profiles
        const { data: studentProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');

        if (error) {
          console.error('Error fetching students:', error);
          toast({
            title: "Error",
            description: "Failed to load students",
            variant: "destructive",
          });
          return;
        }

        setStudents(studentProfiles || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [user, toast]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
          <p className="text-gray-600">Manage student accounts and enrollments</p>
        </div>
        
        {loadingStudents ? (
          <div className="text-center py-8">Loading students...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {students.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">No students found</p>
                </CardContent>
              </Card>
            ) : (
              students.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <CardTitle>
                      {student.first_name && student.last_name 
                        ? `${student.first_name} ${student.last_name}`
                        : student.email}
                    </CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="secondary">{student.role}</Badge>
                      <Badge variant="outline">
                        {student.enrolled_courses || 0} courses
                      </Badge>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <Button>Add New Student</Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Students;