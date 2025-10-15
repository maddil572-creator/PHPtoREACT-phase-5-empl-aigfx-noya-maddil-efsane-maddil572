/**
 * FAQList Component
 * Displays all FAQ items with category management and CRUD actions
 */

import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, HelpCircle, FolderOpen } from 'lucide-react';
import { useFAQs, useDeleteFAQ } from '../../hooks/useFAQs';
import { FAQ } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { FAQModal } from './FAQModal';

export function FAQList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingFAQId, setDeletingFAQId] = useState<number | null>(null);

  const { data: faqs = [], isLoading, error } = useFAQs();
  const deleteFAQ = useDeleteFAQ();

  // Get unique categories
  const categories = Array.from(new Set(faqs.map((faq: FAQ) => faq.category)));

  const filteredFAQs = faqs.filter((faq: FAQ) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query);
    
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category for better display
  const groupedFAQs = filteredFAQs.reduce((acc: Record<string, FAQ[]>, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const handleDelete = async () => {
    if (!deletingFAQId) return;

    try {
      await deleteFAQ.mutateAsync(deletingFAQId);
      toast.success('FAQ deleted successfully');
      setDeletingFAQId(null);
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load FAQs. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">FAQ Management</h1>
            <p className="text-gray-600 mt-1">Manage frequently asked questions and categories</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs by question, answer, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total FAQs</p>
                  <p className="text-2xl font-bold">{faqs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Badge className="h-5 w-5 bg-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold">{faqs.filter((f: FAQ) => f.status === 'published').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Badge className="h-5 w-5 bg-gray-500" />
                <div>
                  <p className="text-sm font-medium">Draft</p>
                  <p className="text-2xl font-bold">{faqs.filter((f: FAQ) => f.status === 'draft').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredFAQs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery || categoryFilter !== 'all' ? 'No FAQs found matching your criteria.' : 'No FAQs yet.'}
          </p>
          {!searchQuery && categoryFilter === 'all' && (
            <Button
              className="mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Your First FAQ
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {category}
                  <Badge variant="secondary">{categoryFAQs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Question</TableHead>
                      <TableHead className="w-[40%]">Answer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryFAQs.map((faq: FAQ) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium">
                          <p className="line-clamp-2">{faq.question}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {faq.answer}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={faq.status === 'published' ? 'default' : 'secondary'}
                          >
                            {faq.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {faq.order || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingFAQ(faq)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingFAQId(faq.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FAQModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        faq={null}
      />

      <FAQModal
        open={!!editingFAQ}
        onClose={() => setEditingFAQ(null)}
        faq={editingFAQ}
      />

      <AlertDialog
        open={!!deletingFAQId}
        onOpenChange={(open) => !open && setDeletingFAQId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the FAQ
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}