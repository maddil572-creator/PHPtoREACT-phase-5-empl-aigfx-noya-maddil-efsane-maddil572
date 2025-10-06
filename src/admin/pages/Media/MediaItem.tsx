import { useState } from 'react';
import { MediaFile } from '../../utils/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Download, Eye, FileText, Image, MoveVertical as MoreVertical, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface MediaItemProps {
  file: MediaFile;
  onDelete: (id: number) => void;
  onView: (file: MediaFile) => void;
}

export function MediaItem({ file, onDelete, onView }: MediaItemProps) {
  const [imageError, setImageError] = useState(false);

  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isPdf = file.mimeType === 'application/pdf';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(file.url);
    toast.success('URL copied to clipboard');
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (isImage && !imageError) {
      return (
        <img
          src={file.url}
          alt={file.altText || file.originalName}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
      );
    }

    if (isVideo) {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-muted">
          <Video className="h-16 w-16 text-muted-foreground" />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-muted">
          <FileText className="h-16 w-16 text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="w-full h-48 flex items-center justify-center bg-muted">
        <Image className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="cursor-pointer" onClick={() => onView(file)}>
        {renderPreview()}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate" title={file.originalName}>
            {file.originalName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {file.mimeType.split('/')[1].toUpperCase()}
            </Badge>
            <span>{formatFileSize(file.fileSize)}</span>
            {file.width && file.height && (
              <span>{file.width} × {file.height}</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(file)}
          className="h-8 px-2"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadFile}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(file.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
