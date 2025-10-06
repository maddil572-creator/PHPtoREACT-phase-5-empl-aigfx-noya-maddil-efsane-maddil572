import { useState } from 'react';
import { MediaFile } from '../../utils/api';
import { useMediaLibrary, useDeleteMedia } from '../../hooks/useMedia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaItem } from './MediaItem';
import { UploadDialog } from './UploadDialog';
import { Upload, Search, Filter, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function MediaLibrary() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  const { data: mediaData, isLoading, refetch } = useMediaLibrary(page, limit, typeFilter);
  const deleteMutation = useDeleteMedia();

  const files = mediaData?.files || [];
  const filteredFiles = files.filter(file =>
    searchQuery === '' ||
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      await deleteMutation.mutateAsync(fileToDelete);
      toast.success('File deleted successfully');
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteClick = (id: number) => {
    setFileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleViewFile = (file: MediaFile) => {
    setSelectedFile(file);
    setViewDialogOpen(true);
  };

  const copyFileUrl = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.url);
      toast.success('URL copied to clipboard');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your media files
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="application">Documents</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No files found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Get started by uploading your first file'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredFiles.length} of {mediaData?.total || 0} files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <MediaItem
                key={file.id}
                file={file}
                onDelete={handleDeleteClick}
                onView={handleViewFile}
              />
            ))}
          </div>

          {mediaData && mediaData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {mediaData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(mediaData.totalPages, p + 1))}
                disabled={page === mediaData.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-6">
              <div className="rounded-lg border overflow-hidden bg-muted/50">
                {selectedFile.mimeType.startsWith('image/') ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.altText || selectedFile.originalName}
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                ) : selectedFile.mimeType.startsWith('video/') ? (
                  <video
                    src={selectedFile.url}
                    controls
                    className="w-full h-auto max-h-[500px]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Preview not available</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">File Name</Label>
                  <p className="text-sm font-medium">{selectedFile.originalName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">File Size</Label>
                  <p className="text-sm">{formatFileSize(selectedFile.fileSize)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant="secondary">{selectedFile.mimeType}</Badge>
                </div>
                {selectedFile.width && selectedFile.height && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Dimensions</Label>
                    <p className="text-sm">{selectedFile.width} × {selectedFile.height}px</p>
                  </div>
                )}
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Uploaded</Label>
                  <p className="text-sm">{formatDate(selectedFile.uploadedAt)}</p>
                </div>
                {selectedFile.altText && (
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs text-muted-foreground">Alt Text</Label>
                    <p className="text-sm">{selectedFile.altText}</p>
                  </div>
                )}
                {selectedFile.caption && (
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs text-muted-foreground">Caption</Label>
                    <p className="text-sm">{selectedFile.caption}</p>
                  </div>
                )}
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={selectedFile.url}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="sm" onClick={copyFileUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
