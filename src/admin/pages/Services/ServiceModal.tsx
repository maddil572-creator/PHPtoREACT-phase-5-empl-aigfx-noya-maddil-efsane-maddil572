/**
 * ServiceModal Component
 * Modal wrapper for ServiceForm
 */

import { Service } from '../../utils/api';
import { ServiceForm } from './ServiceForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

export function ServiceModal({ open, onClose, service }: ServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? 'Edit Service' : 'Create New Service'}
          </DialogTitle>
        </DialogHeader>
        <ServiceForm service={service} onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
