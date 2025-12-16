import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Tenants() {
  const [, setLocation] = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.tenants.list(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading workspaces...</p>
      </div>
    );
  }

  const tenants = data?.tenants || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select Workspace</h1>
          <p className="text-gray-600 mt-2">Choose a workspace to continue</p>
        </div>

        {tenants.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                You don't have any workspaces yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tenants.map((tenant: any) => (
              <Card
                key={tenant.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/dashboard/${tenant.id}`)}
              >
                <CardHeader>
                  <CardTitle>{tenant.name}</CardTitle>
                  <CardDescription>{tenant.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Role: {tenant.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
