/**
 * TestimonialList Component
 * Displays testimonials with search, filter, and management actions
 */

import { useState } from 'react';
import { Star, Search, Filter, Plus, Edit, Trash2, User } from 'lucide-react';
import { useTestimonials, useDeleteTestimonial } from '../../hooks/useTestimonials';
import { Testimonial } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface TestimonialListProps {
  onEdit: (testimonial: Testimonial) => void;
  onCreate: () => void;
}

export function TestimonialList({ onEdit, onCreate }: TestimonialListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: testimonials = [], isLoading, error } = useTestimonials();
  const deleteTestimonial = useDeleteTestimonial();

  const filteredTestimonials = testimonials.filter((testimonial: Testimonial) => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTestimonial.mutateAsync(deleteId);
      toast.success('Testimonial deleted successfully');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete testimonial');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      archived: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load testimonials</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Testimonials</h2>
          <p className="text-muted-foreground">
            Manage customer testimonials and reviews
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, company, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredTestimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No testimonials found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first testimonial'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTestimonials.map((testimonial: Testimonial) => (
            <Card key={testimonial.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {testimonial.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {testimonial.role}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </p>
                      <div className="mt-1">{renderStars(testimonial.rating)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {getStatusBadge(testimonial.status)}
                    {testimonial.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(testimonial)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(testimonial.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
