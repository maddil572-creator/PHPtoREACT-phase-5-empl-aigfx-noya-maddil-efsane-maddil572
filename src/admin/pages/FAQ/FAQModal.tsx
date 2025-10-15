/**
 * FAQModal Component
 * Modal for creating and editing FAQ items
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateFAQ, useUpdateFAQ } from '../../hooks/useFAQs';
import { FAQ } from '../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const faqSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  answer: z.string().min(20, 'Answer must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['draft', 'published']),
  order: z.number().min(0, 'Order must be 0 or greater'),
  featured: z.boolean().default(false),
});

type FAQFormData = z.infer<typeof faqSchema>;

interface FAQModalProps {
  open: boolean;
  onClose: () => void;
  faq: FAQ | null;
}

const defaultCategories = [
  'General',
  'Pricing & Payment',
  'Design Process',
  'File Formats & Usage',
  'Communication & Support',
  'Technical',
  'Delivery & Timeline',
  'Revisions & Changes'
];

export function FAQModal({ open, onClose, faq }: FAQModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();

  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: '',
      status: 'draft',
      order: 0,
      featured: false,
    },
  });

  useEffect(() => {
    if (faq) {
      form.reset({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        status: faq.status as 'draft' | 'published',
        order: faq.order || 0,
        featured: faq.featured || false,
      });
      
      // Check if category is custom
      if (!defaultCategories.includes(faq.category)) {
        setCustomCategory(faq.category);
        setShowCustomCategory(true);
      }
    } else {
      form.reset({
        question: '',
        answer: '',
        category: '',
        status: 'draft',
        order: 0,
        featured: false,
      });
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  }, [faq, form]);

  const onSubmit = async (data: FAQFormData) => {
    setIsSubmitting(true);

    try {
      const faqData = {
        ...data,
        category: showCustomCategory ? customCategory : data.category,
      };

      if (faq) {
        await updateFAQ.mutateAsync({ id: faq.id, ...faqData });
        toast.success('FAQ updated successfully');
      } else {
        await createFAQ.mutateAsync(faqData);
        toast.success('FAQ created successfully');
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{faq ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
          <DialogDescription>
            {faq ? 'Update the FAQ information below.' : 'Add a new frequently asked question to help your customers.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What is your question?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a clear, concise question that customers commonly ask.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed answer..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a comprehensive answer that fully addresses the question.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Category *</FormLabel>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showCustomCategory}
                  onCheckedChange={setShowCustomCategory}
                />
                <span className="text-sm">Use custom category</span>
              </div>

              {showCustomCategory ? (
                <Input
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured FAQ</FormLabel>
                    <FormDescription>
                      Featured FAQs appear prominently on the FAQ page
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : faq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}