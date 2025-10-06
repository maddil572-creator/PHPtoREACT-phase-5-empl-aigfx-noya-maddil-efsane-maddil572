import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, FileImage } from 'lucide-react';
import { useUploadMedia, useBulkUploadMedia } from '../../hooks/useMedia';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
];

const uploadSchema = z.object({
  altText: z.string().optional(),
  caption: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadMedia();
  const bulkUploadMutation = useBulkUploadMedia();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`${file.name} has an unsupported file type.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UploadFormData) => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    try {
      setUploadProgress(0);

      if (selectedFiles.length === 1) {
        await uploadMutation.mutateAsync({
          file: selectedFiles[0],
          altText: data.altText,
          caption: data.caption,
        });
        setUploadProgress(100);
      } else {
        const uploadData = selectedFiles.map(file => ({
          file,
          altText: data.altText,
          caption: data.caption,
        }));

        const total = selectedFiles.length;
        let completed = 0;

        await bulkUploadMutation.mutateAsync(uploadData);
        completed = total;
        setUploadProgress((completed / total) * 100);
      }

      toast.success(
        selectedFiles.length === 1
          ? 'File uploaded successfully'
          : `${selectedFiles.length} files uploaded successfully`
      );

      reset();
      setSelectedFiles([]);
      setUploadProgress(0);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isUploading = uploadMutation.isPending || bulkUploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Media Files</DialogTitle>
          <DialogDescription>
            Upload images, videos, or PDFs. Maximum file size: 10MB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP, GIF, PDF, MP4 (max 10MB)
              </p>
              <Input
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
              >
                Choose Files
              </Button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                  >
                    <FileImage className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text (Optional)</Label>
              <Input
                id="altText"
                {...register('altText')}
                placeholder="Descriptive text for accessibility"
                disabled={isUploading}
              />
              {errors.altText && (
                <p className="text-sm text-destructive">{errors.altText.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                {...register('caption')}
                placeholder="Add a caption for this media"
                rows={3}
                disabled={isUploading}
              />
              {errors.caption && (
                <p className="text-sm text-destructive">{errors.caption.message}</p>
              )}
            </div>
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedFiles([]);
                onOpenChange(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || selectedFiles.length === 0}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
