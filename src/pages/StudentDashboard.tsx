import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Video, GraduationCap, FileText, LogOut, TrendingUp } from 'lucide-react';
import { QuizHistory } from '@/components/student/QuizHistory';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalBooks: 0,
    totalVideos: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch stats
      const { data: coursesData } = await supabase.from('courses').select('id');
      const { data: booksData } = await supabase.from('books').select('id');
      const { data: videosData } = await supabase.from('videos').select('id');
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setStats({
        totalCourses: coursesData?.length || 0,
        completedCourses: progressData?.filter((p) => p.content_type === 'course').length || 0,
        totalBooks: booksData?.length || 0,
        totalVideos: videosData?.length || 0,
      });
    };

    fetchData();
  }, [user]);

  const progressPercentage = stats.totalCourses > 0 
    ? Math.round((stats.completedCourses / stats.totalCourses) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EduLearn</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || 'Student'}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Student Dashboard</h2>
          <p className="text-muted-foreground">Track your learning progress and access your courses</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Learning Progress
            </CardTitle>
            <CardDescription>
              You've completed {stats.completedCourses} out of {stats.totalCourses} courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground text-right">{progressPercentage}% Complete</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
              <p className="text-sm text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-secondary" />
                Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalBooks}</p>
              <p className="text-sm text-muted-foreground">Learning materials</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-accent" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalVideos}</p>
              <p className="text-sm text-muted-foreground">Video lessons</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-success" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Personal notes</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="flex-1"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="flex-1"
          >
            Quiz History
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your learning resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-start gap-2"
                    onClick={() => navigate('/courses')}
                  >
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Browse Courses</p>
                      <p className="text-sm text-muted-foreground">Explore all available courses</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-start gap-2"
                    onClick={() => navigate('/books')}
                  >
                    <BookOpen className="h-8 w-8 text-secondary" />
                    <div className="text-left">
                      <p className="font-semibold">My Library</p>
                      <p className="text-sm text-muted-foreground">Access books and materials</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-start gap-2"
                    onClick={() => navigate('/videos')}
                  >
                    <Video className="h-8 w-8 text-accent" />
                    <div className="text-left">
                      <p className="font-semibold">Video Lessons</p>
                      <p className="text-sm text-muted-foreground">Watch educational videos</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-start gap-2"
                    onClick={() => navigate('/quizzes')}
                  >
                    <FileText className="h-8 w-8 text-success" />
                    <div className="text-left">
                      <p className="font-semibold">Take Quizzes</p>
                      <p className="text-sm text-muted-foreground">Test your knowledge</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'history' && <QuizHistory />}
      </main>
    </div>
  );
}
