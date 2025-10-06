/**
 * PortfolioGrid Component
 * Displays portfolio items in a responsive grid with management actions
 */

import { useState } from 'react';
import { Loader2, Plus, Edit2, Trash2, Eye, Star, Archive } from 'lucide-react';
import { usePortfolios, useDeletePortfolio } from '../../hooks/usePortfolio';
import { Portfolio } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { PortfolioModal } from './PortfolioModal';

export function PortfolioGrid() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: portfolios = [], isLoading, error } = usePortfolios();
  const deletePortfolio = useDeletePortfolio();

  const handleEdit = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPortfolio(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePortfolio.mutateAsync(id);
      toast.success('Portfolio item deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete portfolio item');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPortfolio(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load portfolio items</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Management</h2>
          <p className="text-muted-foreground">
            Manage your portfolio showcase items
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No portfolio items yet</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {portfolio.featuredImage ? (
                  <img
                    src={portfolio.featuredImage}
                    alt={portfolio.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image
                  </div>
                )}
                {portfolio.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{portfolio.title}</CardTitle>
                  <Badge variant={
                    portfolio.status === 'active' ? 'default' :
                    portfolio.status === 'draft' ? 'secondary' : 'outline'
                  }>
                    {portfolio.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {portfolio.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Category:</span>
                    <Badge variant="outline">{portfolio.category}</Badge>
                  </div>

                  {portfolio.tags && portfolio.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {portfolio.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {portfolio.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{portfolio.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {portfolio.views || 0}
                    </div>
                    {portfolio.images && (
                      <div className="flex items-center gap-1">
                        {portfolio.images.length} images
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(portfolio)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(portfolio.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <PortfolioModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        portfolio={selectedPortfolio}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the portfolio item
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
