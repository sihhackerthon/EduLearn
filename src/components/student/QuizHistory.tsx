import { useEffect, useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Award, TrendingUp, BookOpen } from 'lucide-react';

interface QuizHistory {
  id: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  isPassed: boolean;
}

interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  passedQuizzes: number;
  totalScore: number;
}

export function QuizHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    averageScore: 0,
    passedQuizzes: 0,
    totalScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuizHistory();
    }
  }, [user]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          total_questions,
          completed_at,
          quiz_id,
          quizzes (
            title
          )
        `)
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz attempts:', error);
        return;
      }

      if (!attempts) return;

      const historyData: QuizHistory[] = attempts.map(attempt => {
        const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
        return {
          id: attempt.id,
          quizTitle: attempt.quizzes?.title || 'Unknown Quiz',
          score: attempt.score,
          totalQuestions: attempt.total_questions,
          percentage,
          completedAt: attempt.completed_at,
          isPassed: percentage >= 70 // Consider 70% as passing
        };
      });

      setHistory(historyData);

      // Calculate stats
      const totalQuizzes = historyData.length;
      const totalScore = historyData.reduce((sum, quiz) => sum + quiz.percentage, 0);
      const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
      const passedQuizzes = historyData.filter(quiz => quiz.isPassed).length;

      setStats({
        totalQuizzes,
        averageScore,
        passedQuizzes,
        totalScore
      });
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz History</CardTitle>
          <CardDescription>Loading your quiz history...</CardDescription>
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">Quizzes Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <div>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              <div>
                <div className="text-2xl font-bold">{stats.passedQuizzes}</div>
                <div className="text-sm text-muted-foreground">Passed Quizzes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalQuizzes > 0 ? Math.round((stats.passedQuizzes / stats.totalQuizzes) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz History</CardTitle>
          <CardDescription>
            Your complete quiz attempt history and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.quizTitle}</TableCell>
                    <TableCell>
                      {quiz.score}/{quiz.totalQuestions}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{quiz.percentage}%</span>
                        <Progress value={quiz.percentage} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={quiz.isPassed ? "default" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {quiz.isPassed ? (
                          <>
                            <Award className="h-3 w-3" />
                            Passed
                          </>
                        ) : (
                          'Failed'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(quiz.completedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No quiz attempts yet</p>
              <p className="text-sm">Start taking quizzes to see your history here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
