import { useState } from 'react';
import { Shield, CircleAlert as AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AdminUser, Role } from '@/user/types';

interface UserRoleModalProps {
  userId: string;
  currentUser: AdminUser;
  onClose: () => void;
  onUpdate: (userId: string, newRole: Role) => Promise<void>;
}

const roleDescriptions: Record<Role, string> = {
  user: 'Access to user portal only. Can view their own data and orders.',
  viewer: 'Read-only access to admin panel. Cannot make any changes.',
  editor: 'Can create and edit content (blogs, portfolio, services). Cannot manage users or settings.',
  admin: 'Full access to all features including user management and system settings.',
};

export function UserRoleModal({ userId, currentUser, onClose, onUpdate }: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(currentUser.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedRole === currentUser.role) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onUpdate(userId, selectedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Update User Role
          </DialogTitle>
          <DialogDescription>
            Change the role for {currentUser.name} ({currentUser.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{roleDescriptions[selectedRole]}</AlertDescription>
          </Alert>

          {selectedRole === 'admin' && currentUser.role !== 'admin' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: Granting admin access gives this user full control over the system,
                including the ability to manage other users and change critical settings.
              </AlertDescription>
            </Alert>
          )}

          {selectedRole !== 'admin' && currentUser.role === 'admin' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: Removing admin access will restrict this user's permissions. They will
                lose access to user management and system settings.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
