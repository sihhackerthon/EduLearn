import { useEffect, useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, LogOut, BookOpen, Video, Users, FileQuestion, Plus } from 'lucide-react';
import { UploadBookDialog } from '@/components/admin/UploadBookDialog';
import { UploadVideoDialog } from '@/components/admin/UploadVideoDialog';
import { CreateCourseDialog } from '@/components/admin/CreateCourseDialog';
import { CreateQuizDialog } from '@/components/admin/CreateQuizDialog';
import { QuizAnalytics } from '@/components/admin/QuizAnalytics';
import { UserStatistics } from '@/components/admin/UserStatistics';
import { ContentManagement } from '@/components/admin/ContentManagement';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalVideos: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
  });
  
  const [uploadBookOpen, setUploadBookOpen] = useState(false);
  const [uploadVideoOpen, setUploadVideoOpen] = useState(false);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
      const { data: booksData } = await supabase.from('books').select('id');
      const { data: videosData } = await supabase.from('videos').select('id');
      const { data: coursesData } = await supabase.from('courses').select('id');
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');
      const { data: quizzesData } = await supabase.from('quizzes').select('id');

      setStats({
        totalBooks: booksData?.length || 0,
        totalVideos: videosData?.length || 0,
        totalCourses: coursesData?.length || 0,
        totalStudents: studentsData?.length || 0,
        totalQuizzes: quizzesData?.length || 0,
      });
    };

    fetchData();
  }, [user]);

  const refreshStats = async () => {
    if (!user) return;
    const { data: booksData } = await supabase.from('books').select('id');
    const { data: videosData } = await supabase.from('videos').select('id');
    const { data: coursesData } = await supabase.from('courses').select('id');
    const { data: studentsData } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');
    const { data: quizzesData } = await supabase.from('quizzes').select('id');

    setStats({
      totalBooks: booksData?.length || 0,
      totalVideos: videosData?.length || 0,
      totalCourses: coursesData?.length || 0,
      totalStudents: studentsData?.length || 0,
      totalQuizzes: quizzesData?.length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EduLearn Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || 'Admin'}
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
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage content and monitor platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalBooks}</p>
              <p className="text-sm text-muted-foreground">Total books uploaded</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-secondary" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalVideos}</p>
              <p className="text-sm text-muted-foreground">Total video lessons</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-accent" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
              <p className="text-sm text-muted-foreground">Active courses</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-success" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileQuestion className="h-5 w-5 text-primary" />
                Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">Created quizzes</p>
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
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('analytics')}
            className="flex-1"
          >
            Quiz Analytics
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="flex-1"
          >
            User Statistics
          </Button>
          <Button
            variant={activeTab === 'content' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('content')}
            className="flex-1"
          >
            Content Management
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Content Management Actions */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Upload and manage learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setUploadBookOpen(true)}
                  >
                    <Plus className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Upload Book</p>
                      <p className="text-sm opacity-90">Add new book material</p>
                    </div>
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setUploadVideoOpen(true)}
                  >
                    <Plus className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Upload Video</p>
                      <p className="text-sm opacity-90">Add video lesson</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setCreateCourseOpen(true)}
                  >
                    <Plus className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Create Course</p>
                      <p className="text-sm opacity-90">Build new course</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center gap-2"
                    onClick={() => setCreateQuizOpen(true)}
                  >
                    <Plus className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Create Quiz</p>
                      <p className="text-sm opacity-90">Design assessment</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'analytics' && <QuizAnalytics />}
        {activeTab === 'users' && <UserStatistics />}
        {activeTab === 'content' && <ContentManagement />}

        <UploadBookDialog 
          open={uploadBookOpen} 
          onOpenChange={setUploadBookOpen}
          onSuccess={refreshStats}
        />
        <UploadVideoDialog 
          open={uploadVideoOpen} 
          onOpenChange={setUploadVideoOpen}
          onSuccess={refreshStats}
        />
        <CreateCourseDialog 
          open={createCourseOpen} 
          onOpenChange={setCreateCourseOpen}
          onSuccess={refreshStats}
        />
        <CreateQuizDialog 
          open={createQuizOpen} 
          onOpenChange={setCreateQuizOpen}
          onSuccess={refreshStats}
        />
      </main>
    </div>
  );
}
