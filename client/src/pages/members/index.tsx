import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Members() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const tenantId = params.id!;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'admin' | 'member',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['members', tenantId],
    queryFn: () => api.members.list(tenantId),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: any) => api.members.invite(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', tenantId] });
      setShowForm(false);
      setFormData({ email: '', role: 'member' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => api.members.remove(tenantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', tenantId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const members = data?.members || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <Button variant="outline" onClick={() => setLocation(`/dashboard/${tenantId}`)}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Team</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Invite Member'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full h-10 rounded-md border border-gray-300 px-3"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {members.map((member: any) => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Role:</span>{' '}
                      <span className="capitalize">{member.role}</span>
                    </p>
                  </div>
                  {member.role !== 'owner' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMutation.mutate(member.user.id)}
                      disabled={removeMutation.isPending}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {members.length === 0 && !showForm && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No team members yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
