import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiKeys() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const tenantId = params.id!;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['apiKeys', tenantId],
    queryFn: () => api.apiKeys.list(tenantId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.apiKeys.create(tenantId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', tenantId] });
      setNewKey(response.apiKey.key);
      setShowForm(false);
      setFormData({ name: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.apiKeys.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', tenantId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const apiKeys = data?.apiKeys || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">API Keys</h1>
          <Button variant="outline" onClick={() => setLocation(`/dashboard/${tenantId}`)}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage API Keys</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New API Key'}
          </Button>
        </div>

        {newKey && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>New API Key Created</CardTitle>
              <CardDescription className="text-blue-900">
                Save this key securely. You won't be able to see it again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm break-all">
                {newKey}
              </div>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setNewKey(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Production API Key"
                    required
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create API Key'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {apiKeys.map((apiKey: any) => (
            <Card key={apiKey.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{apiKey.name}</p>
                    <p className="text-sm text-gray-500 font-mono mt-1">{apiKey.key}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(apiKey.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {apiKeys.length === 0 && !showForm && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No API keys yet. Create one to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
