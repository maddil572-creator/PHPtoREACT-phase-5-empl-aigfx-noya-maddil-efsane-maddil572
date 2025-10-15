<?php
/**
 * Media Manager Class
 * Handles file uploads, image processing, and media management
 */

require_once __DIR__ . '/../config/database.php';

class MediaManager {
    private $db;
    private $uploadPath;
    private $allowedTypes;
    private $maxFileSize;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->uploadPath = UPLOAD_PATH;
        $this->allowedTypes = ALLOWED_FILE_TYPES;
        $this->maxFileSize = MAX_FILE_SIZE;
        
        // Ensure upload directory exists
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
        
        // Create subdirectories
        $subdirs = ['images', 'documents', 'videos', 'thumbnails'];
        foreach ($subdirs as $subdir) {
            $path = $this->uploadPath . '/' . $subdir;
            if (!is_dir($path)) {
                mkdir($path, 0755, true);
            }
        }
    }
    
    /**
     * Upload file
     */
    public function uploadFile($file, $userId, $altText = '', $caption = '', $folder = 'uploads') {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'error' => $validation['error']
                ];
            }
            
            // Generate unique filename
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $filename = $this->generateUniqueFilename($extension);
            
            // Determine subfolder based on file type
            $subfolder = $this->getSubfolderByType($extension);
            $fullPath = $this->uploadPath . '/' . $subfolder . '/' . $filename;
            $relativePath = $subfolder . '/' . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
                return [
                    'success' => false,
                    'error' => 'Failed to move uploaded file'
                ];
            }
            
            // Set file permissions
            chmod($fullPath, 0644);
            
            // Get file info
            $fileSize = filesize($fullPath);
            $mimeType = mime_content_type($fullPath);
            
            // Get image dimensions if it's an image
            $width = null;
            $height = null;
            if (strpos($mimeType, 'image/') === 0) {
                $imageInfo = getimagesize($fullPath);
                if ($imageInfo) {
                    $width = $imageInfo[0];
                    $height = $imageInfo[1];
                    
                    // Generate thumbnail for images
                    $this->generateThumbnail($fullPath, $filename, $extension);
                }
            }
            
            // Save to database
            $stmt = $this->db->prepare("
                INSERT INTO media (
                    filename, original_name, file_path, url, mime_type, file_size,
                    width, height, alt_text, caption, uploaded_by, folder, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $url = '/backend/uploads/' . $relativePath;
            
            $stmt->execute([
                $filename,
                $file['name'],
                $relativePath,
                $url,
                $mimeType,
                $fileSize,
                $width,
                $height,
                $altText,
                $caption,
                $userId,
                $folder
            ]);
            
            $mediaId = $this->db->lastInsertId();
            
            // Log activity
            $this->logActivity($userId, 'file_uploaded', 'media', $mediaId, "File uploaded: {$file['name']}");
            
            return [
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'id' => $mediaId,
                    'filename' => $filename,
                    'original_name' => $file['name'],
                    'url' => $url,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                    'width' => $width,
                    'height' => $height,
                    'alt_text' => $altText,
                    'caption' => $caption
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get media files with pagination
     */
    public function getMediaFiles($page = 1, $limit = 20, $type = null, $userId = null) {
        try {
            $offset = ($page - 1) * $limit;
            
            // Build query
            $whereConditions = [];
            $params = [];
            
            if ($type) {
                $whereConditions[] = "mime_type LIKE ?";
                $params[] = $type . '%';
            }
            
            if ($userId) {
                $whereConditions[] = "uploaded_by = ?";
                $params[] = $userId;
            }
            
            $whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get total count
            $countQuery = "SELECT COUNT(*) FROM media $whereClause";
            $stmt = $this->db->prepare($countQuery);
            $stmt->execute($params);
            $total = $stmt->fetchColumn();
            
            // Get files
            $query = "
                SELECT m.*, u.name as uploader_name 
                FROM media m 
                LEFT JOIN users u ON m.uploaded_by = u.id 
                $whereClause 
                ORDER BY m.created_at DESC 
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $files = $stmt->fetchAll();
            
            return [
                'success' => true,
                'data' => [
                    'files' => $files,
                    'pagination' => [
                        'total' => (int)$total,
                        'page' => (int)$page,
                        'limit' => (int)$limit,
                        'pages' => ceil($total / $limit)
                    ]
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to get media files: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get media file by ID
     */
    public function getMediaById($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT m.*, u.name as uploader_name 
                FROM media m 
                LEFT JOIN users u ON m.uploaded_by = u.id 
                WHERE m.id = ?
            ");
            
            $stmt->execute([$id]);
            $media = $stmt->fetch();
            
            if (!$media) {
                return [
                    'success' => false,
                    'error' => 'Media file not found'
                ];
            }
            
            return [
                'success' => true,
                'data' => $media
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to get media file: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Update media metadata
     */
    public function updateMedia($id, $altText = null, $caption = null, $userId = null) {
        try {
            $updates = [];
            $params = [];
            
            if ($altText !== null) {
                $updates[] = "alt_text = ?";
                $params[] = $altText;
            }
            
            if ($caption !== null) {
                $updates[] = "caption = ?";
                $params[] = $caption;
            }
            
            if (empty($updates)) {
                return [
                    'success' => false,
                    'error' => 'No updates provided'
                ];
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $id;
            
            $query = "UPDATE media SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            if ($userId) {
                $this->logActivity($userId, 'media_updated', 'media', $id, 'Media metadata updated');
            }
            
            return [
                'success' => true,
                'message' => 'Media updated successfully'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to update media: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Delete media file
     */
    public function deleteMedia($id, $userId = null) {
        try {
            // Get media info
            $stmt = $this->db->prepare("SELECT * FROM media WHERE id = ?");
            $stmt->execute([$id]);
            $media = $stmt->fetch();
            
            if (!$media) {
                return [
                    'success' => false,
                    'error' => 'Media file not found'
                ];
            }
            
            // Delete physical file
            $filePath = $this->uploadPath . '/' . $media['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            // Delete thumbnail if exists
            $thumbnailPath = $this->uploadPath . '/thumbnails/thumb_' . $media['filename'];
            if (file_exists($thumbnailPath)) {
                unlink($thumbnailPath);
            }
            
            // Delete from database
            $stmt = $this->db->prepare("DELETE FROM media WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($userId) {
                $this->logActivity($userId, 'media_deleted', 'media', $id, "Media deleted: {$media['original_name']}");
            }
            
            return [
                'success' => true,
                'message' => 'Media deleted successfully'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to delete media: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE => 'File is too large (server limit)',
                UPLOAD_ERR_FORM_SIZE => 'File is too large (form limit)',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
            ];
            
            return [
                'valid' => false,
                'error' => $errors[$file['error']] ?? 'Unknown upload error'
            ];
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return [
                'valid' => false,
                'error' => 'File is too large. Maximum size: ' . $this->formatBytes($this->maxFileSize)
            ];
        }
        
        // Check file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedTypes)) {
            return [
                'valid' => false,
                'error' => 'File type not allowed. Allowed types: ' . implode(', ', $this->allowedTypes)
            ];
        }
        
        // Check MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = [
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'gif' => ['image/gif'],
            'svg' => ['image/svg+xml'],
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'mp4' => ['video/mp4'],
            'avi' => ['video/x-msvideo'],
            'mov' => ['video/quicktime']
        ];
        
        if (isset($allowedMimes[$extension]) && !in_array($mimeType, $allowedMimes[$extension])) {
            return [
                'valid' => false,
                'error' => 'File type does not match extension'
            ];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Generate unique filename
     */
    private function generateUniqueFilename($extension) {
        return uniqid() . '_' . time() . '.' . $extension;
    }
    
    /**
     * Get subfolder by file type
     */
    private function getSubfolderByType($extension) {
        $imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
        $videoTypes = ['mp4', 'avi', 'mov', 'wmv'];
        
        if (in_array($extension, $imageTypes)) {
            return 'images';
        } elseif (in_array($extension, $videoTypes)) {
            return 'videos';
        } else {
            return 'documents';
        }
    }
    
    /**
     * Generate thumbnail for images
     */
    private function generateThumbnail($sourcePath, $filename, $extension) {
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
            return false;
        }
        
        $thumbnailPath = $this->uploadPath . '/thumbnails/thumb_' . $filename;
        $thumbnailWidth = 300;
        $thumbnailHeight = 300;
        
        try {
            // Get original image info
            $imageInfo = getimagesize($sourcePath);
            if (!$imageInfo) {
                return false;
            }
            
            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            
            // Calculate new dimensions (maintain aspect ratio)
            $ratio = min($thumbnailWidth / $originalWidth, $thumbnailHeight / $originalHeight);
            $newWidth = (int)($originalWidth * $ratio);
            $newHeight = (int)($originalHeight * $ratio);
            
            // Create image resources
            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                    $source = imagecreatefromjpeg($sourcePath);
                    break;
                case 'png':
                    $source = imagecreatefrompng($sourcePath);
                    break;
                case 'gif':
                    $source = imagecreatefromgif($sourcePath);
                    break;
                default:
                    return false;
            }
            
            if (!$source) {
                return false;
            }
            
            // Create thumbnail
            $thumbnail = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preserve transparency for PNG and GIF
            if ($extension === 'png' || $extension === 'gif') {
                imagealphablending($thumbnail, false);
                imagesavealpha($thumbnail, true);
                $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
                imagefill($thumbnail, 0, 0, $transparent);
            }
            
            // Resize image
            imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
            
            // Save thumbnail
            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                    imagejpeg($thumbnail, $thumbnailPath, 85);
                    break;
                case 'png':
                    imagepng($thumbnail, $thumbnailPath, 8);
                    break;
                case 'gif':
                    imagegif($thumbnail, $thumbnailPath);
                    break;
            }
            
            // Clean up
            imagedestroy($source);
            imagedestroy($thumbnail);
            
            return true;
            
        } catch (Exception $e) {
            error_log("Thumbnail generation failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
    
    /**
     * Log activity
     */
    private function logActivity($userId, $action, $entity, $entityId, $description, $changes = null) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO activity_logs (user_id, action, entity, entity_id, description, changes, ip_address, user_agent, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $userId,
                $action,
                $entity,
                $entityId,
                $description,
                $changes ? json_encode($changes) : null,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
            
        } catch (PDOException $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}