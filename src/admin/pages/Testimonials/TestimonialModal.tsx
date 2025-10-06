/**
 * TestimonialModal Component
 * Modal wrapper for testimonial form
 */

import { Testimonial } from '../../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TestimonialForm } from './TestimonialForm';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: Testimonial | null;
}

export function TestimonialModal({ isOpen, onClose, testimonial }: TestimonialModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
          </DialogTitle>
        </DialogHeader>
        <TestimonialForm
          testimonial={testimonial}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
