import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';

interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  students: Array<{
    id: string;
    name: string;
    score: number;
    percentage: number;
    completedAt: string;
  }>;
}

export function QuizAnalytics() {
  const [analytics, setAnalytics] = useState<QuizAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizAnalytics();
  }, []);

  const fetchQuizAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all quizzes with their attempts
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          quiz_attempts (
            id,
            user_id,
            score,
            total_questions,
            completed_at,
            profiles (
              full_name
            )
          )
        `);

      if (error) {
        console.error('Error fetching quizzes:', error);
        return;
      }

      if (!quizzes) return;

      const analyticsData: QuizAnalytics[] = quizzes.map(quiz => {
        const attempts = quiz.quiz_attempts || [];
        const totalAttempts = attempts.length;
        const averageScore = totalAttempts > 0 
          ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
          : 0;
        const averagePercentage = totalAttempts > 0 
          ? attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / totalAttempts 
          : 0;

        const students = attempts.map(attempt => ({
          id: attempt.user_id,
          name: attempt.profiles?.full_name || 'Unknown',
          score: attempt.score,
          percentage: Math.round((attempt.score / attempt.total_questions) * 100),
          completedAt: attempt.completed_at
        }));

        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          totalAttempts,
          averageScore: Math.round(averageScore * 10) / 10,
          completionRate: Math.round(averagePercentage),
          students
        };
      });

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quiz Performance Overview
          </CardTitle>
          <CardDescription>
            Track student performance and quiz completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.length}</div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {analytics.reduce((sum, quiz) => sum + quiz.totalAttempts, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {analytics.length > 0 
                  ? Math.round(analytics.reduce((sum, quiz) => sum + quiz.completionRate, 0) / analytics.length)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics.map((quiz) => (
        <Card key={quiz.quizId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{quiz.quizTitle}</CardTitle>
                <CardDescription>
                  {quiz.totalAttempts} attempts • Average: {quiz.completionRate}%
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {quiz.totalAttempts} students
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {quiz.students.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Average Performance</span>
                      <span>{quiz.completionRate}%</span>
                    </div>
                    <Progress value={quiz.completionRate} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quiz.students.map((student, index) => (
                        <TableRow key={`${student.id}-${index}`}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.score}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{student.percentage}%</span>
                              <Progress value={student.percentage} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(student.completedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No attempts yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
