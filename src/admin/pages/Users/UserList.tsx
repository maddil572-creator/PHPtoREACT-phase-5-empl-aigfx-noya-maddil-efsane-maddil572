import { useState } from 'react';
import { Search, Filter, UserCog, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/admin/hooks/useUsers';
import type { Role } from '@/user/types';
import { UserRoleModal } from './UserRoleModal';
import { useToast } from '@/hooks/use-toast';

const roleColors: Record<Role, string> = {
  user: 'bg-blue-500',
  editor: 'bg-green-500',
  viewer: 'bg-yellow-500',
  admin: 'bg-red-500',
};

export function UserList() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();

  const { users, pagination, loading, updateUserRole, deleteUser, refetch } = useUsers({
    search,
    role: roleFilter,
    page,
    limit: 20,
  });

  const handleRoleUpdate = async (userId: string, newRole: Role) => {
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      setSelectedUser(null);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users and their roles</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {pagination.total} total users
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | '')}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.verified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{user.tokenBalance} tokens</span>
                        <span>•</span>
                        <span>{user.totalOrders} orders</span>
                        <span>•</span>
                        <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <UserRoleModal
          userId={selectedUser}
          currentUser={users.find((u) => u.id === selectedUser)!}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleRoleUpdate}
        />
      )}
    </div>
  );
}
