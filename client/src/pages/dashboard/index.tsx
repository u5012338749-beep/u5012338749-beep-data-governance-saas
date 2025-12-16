import { useLocation, useParams } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const tenantId = params.id;

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Data Governance</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage your data governance workspace</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation(`/datasets/${tenantId}`)}
          >
            <CardHeader>
              <CardTitle>Datasets</CardTitle>
              <CardDescription>Manage your data collections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">View and manage datasets</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation(`/jobs/${tenantId}`)}
          >
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
              <CardDescription>Manage data processing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Create and run jobs</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation(`/members/${tenantId}`)}
          >
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage workspace members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Invite and manage team</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation(`/api-keys/${tenantId}`)}
          >
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Generate and manage keys</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
