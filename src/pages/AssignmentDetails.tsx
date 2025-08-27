import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Award } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  points_possible?: number;
  created_at: string;
  course_id: string;
}

interface Course {
  id: string;
  title: string;
}

interface Submission {
  id: string;
  student_id: string;
  content?: string;
  grade?: number;
  submitted_at: string;
  feedback?: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

const AssignmentDetails = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!user || !assignmentId) return;

      try {
        // Fetch assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', assignmentId)
          .single();

        if (assignmentError) {
          console.error('Error fetching assignment:', assignmentError);
          toast({
            title: "Error",
            description: "Failed to load assignment",
            variant: "destructive",
          });
          navigate("/courses");
          return;
        }

        setAssignment(assignmentData);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', assignmentData.course_id)
          .single();

        if (courseError) {
          console.error('Error fetching course:', courseError);
        } else {
          setCourse(courseData);
        }

        // Fetch submissions for this assignment
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId);

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
        } else {
          // Fetch profiles for students who submitted
          if (submissionsData && submissionsData.length > 0) {
            const studentIds = submissionsData.map(s => s.student_id);
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .in('id', studentIds);

            const submissionsWithProfiles = submissionsData.map(submission => ({
              ...submission,
              profiles: profilesData?.find(profile => profile.id === submission.student_id) || {
                first_name: '',
                last_name: '',
                email: 'Unknown'
              }
            }));

            setSubmissions(submissionsWithProfiles);
          } else {
            setSubmissions([]);
          }
        }

      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load assignment data",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchAssignmentData();
  }, [user, assignmentId, toast, navigate]);

  if (loading || !user || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Assignment not found</h1>
            <Button onClick={() => navigate("/courses")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/courses/${assignment.course_id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {course?.title || 'Course'}
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{assignment.title}</h1>
              <p className="text-muted-foreground mb-4">{assignment.description || "No description available"}</p>
              <div className="flex gap-4">
                <Badge variant="secondary">
                  <Award className="mr-1 h-3 w-3" />
                  {assignment.points_possible || 0} points
                </Badge>
                {assignment.due_date && (
                  <Badge variant={isOverdue ? "destructive" : "secondary"}>
                    <Clock className="mr-1 h-3 w-3" />
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {submissions.length} submissions
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>
                  Student submissions for this assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No submissions yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Submissions will appear here once students submit their work</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">
                                {submission.profiles?.first_name || submission.profiles?.last_name 
                                  ? `${submission.profiles.first_name || ''} ${submission.profiles.last_name || ''}`.trim()
                                  : submission.profiles?.email || 'Unknown Student'
                                }
                              </h3>
                              <p className="text-sm text-muted-foreground">{submission.profiles?.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Submitted: {new Date(submission.submitted_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {submission.grade !== null ? (
                                <Badge variant="secondary">
                                  {submission.grade}/{assignment.points_possible || 0}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Ungraded</Badge>
                              )}
                            </div>
                          </div>
                          {submission.content && (
                            <div className="mt-2">
                              <p className="text-sm">
                                <strong>Submission:</strong> {submission.content}
                              </p>
                            </div>
                          )}
                          {submission.feedback && (
                            <div className="mt-2 p-3 bg-muted rounded">
                              <p className="text-sm">
                                <strong>Feedback:</strong> {submission.feedback}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </p>
                </div>
                {assignment.due_date && (
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(assignment.due_date).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Points Possible</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.points_possible || 0} points
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Submissions</p>
                  <p className="text-sm text-muted-foreground">
                    {submissions.length} submitted
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;