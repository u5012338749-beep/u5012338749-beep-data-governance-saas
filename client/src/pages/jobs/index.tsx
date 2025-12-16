import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Jobs() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const tenantId = params.id!;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'data-import',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', tenantId],
    queryFn: () => api.jobs.list(tenantId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.jobs.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', tenantId] });
      setShowForm(false);
      setFormData({ name: '', description: '', type: 'data-import' });
    },
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => api.jobs.run(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', tenantId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const jobs = data?.jobs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Button variant="outline" onClick={() => setLocation(`/dashboard/${tenantId}`)}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Jobs</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Job'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Job</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 rounded-md border border-gray-300 px-3"
                  >
                    <option value="data-import">Data Import</option>
                    <option value="data-export">Data Export</option>
                    <option value="validation">Validation</option>
                    <option value="transformation">Transformation</option>
                  </select>
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Job'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.name}</CardTitle>
                <CardDescription>{job.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> {job.type}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Active:</span> {job.isActive ? 'Yes' : 'No'}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => runMutation.mutate(job.id)}
                    disabled={runMutation.isPending}
                  >
                    Run Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && !showForm && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No jobs yet. Create one to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
