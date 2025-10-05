import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, Calendar, TrendingUp, Award } from 'lucide-react';

interface UserStats {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  monthlyGrowth: Array<{
    month: string;
    count: number;
  }>;
}

export function UserStatistics() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
    newUsersThisWeek: 0,
    recentUsers: [],
    monthlyGrowth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStatistics();
  }, []);

  const fetchUserStatistics = async () => {
    try {
      setLoading(true);
      
      // Get all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!allUsers) return;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const totalUsers = allUsers.length;
      const totalStudents = allUsers.filter(user => user.role === 'student').length;
      const totalAdmins = allUsers.filter(user => user.role === 'admin').length;
      const newUsersThisMonth = allUsers.filter(user => 
        new Date(user.created_at) >= startOfMonth
      ).length;
      const newUsersThisWeek = allUsers.filter(user => 
        new Date(user.created_at) >= startOfWeek
      ).length;

      // Get recent users (last 10)
      const recentUsers = allUsers.slice(0, 10).map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown',
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }));

      // Calculate monthly growth for the last 6 months
      const monthlyGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = allUsers.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= date && userDate < nextMonth;
        }).length;
        
        monthlyGrowth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count
        });
      }

      setStats({
        totalUsers,
        totalStudents,
        totalAdmins,
        newUsersThisMonth,
        newUsersThisWeek,
        recentUsers,
        monthlyGrowth
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
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
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-secondary" />
              <div>
                <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
                <div className="text-sm text-muted-foreground">New This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              <div>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold">{stats.newUsersThisWeek}</div>
                <div className="text-sm text-muted-foreground">New This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span>Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.totalStudents}</span>
                  <span className="text-sm text-muted-foreground">
                    ({stats.totalUsers > 0 ? Math.round((stats.totalStudents / stats.totalUsers) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={stats.totalUsers > 0 ? (stats.totalStudents / stats.totalUsers) * 100 : 0} 
                className="h-2" 
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-secondary"></div>
                  <span>Admins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.totalAdmins}</span>
                  <span className="text-sm text-muted-foreground">
                    ({stats.totalUsers > 0 ? Math.round((stats.totalAdmins / stats.totalUsers) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={stats.totalUsers > 0 ? (stats.totalAdmins / stats.totalUsers) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
            <CardDescription>User registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthlyGrowth.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(10, (month.count / Math.max(...stats.monthlyGrowth.map(m => m.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{month.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
