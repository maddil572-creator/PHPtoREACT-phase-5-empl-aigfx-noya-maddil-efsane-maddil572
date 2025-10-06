/**
 * PortfolioModal Component
 * Modal wrapper for portfolio form
 */

import { Portfolio } from '../../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PortfolioForm } from './PortfolioForm';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio | null;
}

export function PortfolioModal({ isOpen, onClose, portfolio }: PortfolioModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {portfolio ? 'Edit Portfolio Project' : 'Create New Portfolio Project'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6 max-h-[calc(90vh-5rem)]">
          <PortfolioForm
            portfolio={portfolio}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
