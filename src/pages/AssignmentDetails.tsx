import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, FileText, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  points_possible?: number;
  created_at: string;
  course_id: string;
  course?: {
    title: string;
    teacher_id: string;
  };
}

interface Submission {
  id: string;
  student_id: string;
  assignment_id: string;
  content?: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
  student?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

const AssignmentDetails = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentData = async () => {
    if (!assignmentId || !user) return;

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
        return;
      }

      // Fetch course details separately
      const { data: courseData } = await supabase
        .from('courses')
        .select('title, teacher_id')
        .eq('id', assignmentData.course_id)
        .single();

      setAssignment({
        ...assignmentData,
        course: courseData || { title: "Unknown Course", teacher_id: "" },
      });

      // If user is a teacher, fetch all submissions
      if (profile?.role === 'teacher') {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: false });

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
        } else {
          // Fetch student profiles for each submission
          const submissionsWithStudents = await Promise.all(
            (submissionsData || []).map(async (submission) => {
              const { data: studentData } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', submission.student_id)
                .single();

              return {
                ...submission,
                student: studentData || { first_name: "", last_name: "", email: "Unknown" },
              };
            })
          );
          setSubmissions(submissionsWithStudents);
        }
      }

      // If user is a student, fetch their submission
      if (profile?.role === 'student') {
        const { data: userSubmissionData, error: userSubmissionError } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', user.id)
          .maybeSingle();

        if (userSubmissionError) {
          console.error('Error fetching user submission:', userSubmissionError);
        } else if (userSubmissionData) {
          setUserSubmission(userSubmissionData);
          setSubmissionContent(userSubmissionData.content || "");
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
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!user || !assignmentId || !submissionContent.trim()) return;

    setSubmitting(true);
    try {
      if (userSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('submissions')
          .update({
            content: submissionContent,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', userSubmission.id);

        if (error) {
          console.error('Error updating submission:', error);
          toast({
            title: "Error",
            description: "Failed to update submission",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        // Create new submission
        const { error } = await supabase
          .from('submissions')
          .insert({
            student_id: user.id,
            assignment_id: assignmentId,
            content: submissionContent,
          });

        if (error) {
          console.error('Error creating submission:', error);
          toast({
            title: "Error",
            description: "Failed to submit assignment",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Assignment submitted successfully",
        });
      }

      // Refresh data
      await fetchAssignmentData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade,
          feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) {
        console.error('Error grading submission:', error);
        toast({
          title: "Error",
          description: "Failed to grade submission",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });

      // Refresh data
      await fetchAssignmentData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive",
      });
    }
  };

  const getSubmissionStatus = (submission: Submission | null, dueDate?: string) => {
    if (!submission) return { status: "not-submitted", label: "Not Submitted", icon: Clock, variant: "secondary" as const };
    
    if (submission.grade !== null && submission.grade !== undefined) {
      return { status: "graded", label: "Graded", icon: CheckCircle, variant: "default" as const };
    }
    
    if (dueDate && new Date(submission.submitted_at) > new Date(dueDate)) {
      return { status: "late", label: "Submitted Late", icon: AlertCircle, variant: "destructive" as const };
    }
    
    return { status: "submitted", label: "Submitted", icon: CheckCircle, variant: "default" as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Assignment not found</h2>
          <Button onClick={() => navigate('/assignments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const submissionStatus = getSubmissionStatus(userSubmission, assignment.due_date);
  const isOverdue = assignment.due_date && new Date() > new Date(assignment.due_date);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/assignments')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{assignment.title}</h1>
              <p className="text-muted-foreground mb-4">
                {assignment.description || "No description provided"}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{assignment.course?.title}</span>
                </div>
                {assignment.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(assignment.due_date)}</span>
                  </div>
                )}
                {assignment.points_possible && (
                  <span>{assignment.points_possible} points</span>
                )}
              </div>
            </div>
            
            {profile?.role === 'student' && (
              <div className="ml-4">
                <Badge variant={submissionStatus.variant} className="flex items-center gap-1">
                  <submissionStatus.icon className="w-3 h-3" />
                  {submissionStatus.label}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {profile?.role === 'student' ? (
          // Student View - Submission Interface
          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
              <CardDescription>
                {userSubmission 
                  ? `Last submitted: ${formatDate(userSubmission.submitted_at)}`
                  : "Submit your work for this assignment"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userSubmission?.grade !== null && userSubmission?.grade !== undefined && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-800">Grade: {userSubmission.grade}/{assignment.points_possible}</h3>
                    {userSubmission.graded_at && (
                      <span className="text-sm text-green-600">
                        Graded: {formatDate(userSubmission.graded_at)}
                      </span>
                    )}
                  </div>
                  {userSubmission.feedback && (
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">Feedback:</p>
                      <p className="text-green-700">{userSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {isOverdue && !userSubmission && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">This assignment is overdue</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="submission">Your Answer</Label>
                <Textarea
                  id="submission"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Enter your submission here..."
                  rows={8}
                  disabled={userSubmission?.grade !== null && userSubmission?.grade !== undefined}
                />
              </div>

              {(userSubmission?.grade === null || userSubmission?.grade === undefined) && (
                <Button 
                  onClick={handleSubmitAssignment}
                  disabled={submitting || !submissionContent.trim()}
                  className="w-full"
                >
                  {submitting 
                    ? "Submitting..." 
                    : userSubmission 
                      ? "Update Submission" 
                      : "Submit Assignment"
                  }
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          // Teacher View - Submissions Management
          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="submissions">
                Submissions ({submissions.length})
              </TabsTrigger>
              <TabsTrigger value="details">Assignment Details</TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="space-y-4">
              {submissions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                  </CardContent>
                </Card>
              ) : (
                submissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {submission.student?.first_name && submission.student?.last_name
                              ? `${submission.student.first_name} ${submission.student.last_name}`
                              : submission.student?.email || 'Unknown Student'
                            }
                          </CardTitle>
                          <CardDescription>
                            Submitted: {formatDate(submission.submitted_at)}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <Badge variant="default">
                              {submission.grade}/{assignment.points_possible} pts
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending Grade</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Submission:</Label>
                          <div className="mt-1 p-3 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {submission.content || "No content provided"}
                            </p>
                          </div>
                        </div>

                        {submission.feedback && (
                          <div>
                            <Label className="text-sm font-medium">Previous Feedback:</Label>
                            <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm">{submission.feedback}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => {
                              const grade = prompt("Enter grade (0-" + assignment.points_possible + "):");
                              const feedback = prompt("Enter feedback:");
                              if (grade !== null && feedback !== null) {
                                handleGradeSubmission(submission.id, parseInt(grade), feedback);
                              }
                            }}
                          >
                            {submission.grade !== null && submission.grade !== undefined ? "Update Grade" : "Grade"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Course:</Label>
                    <p>{assignment.course?.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created:</Label>
                    <p>{formatDate(assignment.created_at)}</p>
                  </div>
                  {assignment.due_date && (
                    <div>
                      <Label className="text-sm font-medium">Due Date:</Label>
                      <p>{formatDate(assignment.due_date)}</p>
                    </div>
                  )}
                  {assignment.points_possible && (
                    <div>
                      <Label className="text-sm font-medium">Points Possible:</Label>
                      <p>{assignment.points_possible}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;