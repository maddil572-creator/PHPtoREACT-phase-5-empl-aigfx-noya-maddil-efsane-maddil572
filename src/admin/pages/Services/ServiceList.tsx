/**
 * ServiceList Component
 * Displays all services in a grid/table with CRUD actions
 */

import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, DollarSign, Clock, Star } from 'lucide-react';
import { useServices, useDeleteService } from '../../hooks/useServices';
import { Service } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ServiceModal } from './ServiceModal';

export function ServiceList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  const { data: services = [], isLoading, error } = useServices();
  const deleteService = useDeleteService();

  const filteredServices = services.filter((service: Service) => {
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.tagline.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query)
    );
  });

  const handleDelete = async () => {
    if (!deletingServiceId) return;

    try {
      await deleteService.mutateAsync(deletingServiceId);
      toast.success('Service deleted successfully');
      setDeletingServiceId(null);
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const getLowestPrice = (service: Service): number => {
    if (!service.pricingTiers || service.pricingTiers.length === 0) return 0;
    return Math.min(...service.pricingTiers.map(tier => tier.price));
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load services. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Services Management</h1>
            <p className="text-gray-600 mt-1">Manage all service offerings</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services by name, tagline, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No services found matching your search.' : 'No services yet.'}
          </p>
          {!searchQuery && (
            <Button
              className="mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Your First Service
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: Service) => (
            <Card key={service.id} className="relative group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {service.tagline}
                      </CardDescription>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {service.popular && (
                    <Badge className="bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {service.active ? (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-500 text-gray-700">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {service.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>Starting at ${getLowestPrice(service)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{service.deliveryTime}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    Features ({service.features.length}):
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-primary font-medium">
                        +{service.features.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-4 border-t mt-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    Pricing Tiers: {service.pricingTiers.length}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {service.pricingTiers.map((tier, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tier.name}: ${tier.price}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingService(service)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setDeletingServiceId(service.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        service={null}
      />

      <ServiceModal
        open={!!editingService}
        onClose={() => setEditingService(null)}
        service={editingService}
      />

      <AlertDialog
        open={!!deletingServiceId}
        onOpenChange={(open) => !open && setDeletingServiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
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
