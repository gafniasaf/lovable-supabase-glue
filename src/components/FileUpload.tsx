import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Image, FileArchive } from 'lucide-react';

interface FileUploadProps {
  bucketName: string;
  folder: string;
  onUploadComplete: (files: FileInfo[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  existingFiles?: FileInfo[];
}

interface FileInfo {
  name: string;
  url: string;
  type: string;
  size: number;
  path: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  folder,
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'],
  existingFiles = []
}) => {
  const [files, setFiles] = useState<FileInfo[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return FileArchive;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newFiles: FileInfo[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!acceptedTypes.includes(fileExtension)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type`,
            variant: "destructive",
          });
          continue;
        }

        // Create unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${sanitizedName}`;
        const filePath = `${folder}/${fileName}`;

        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Upload file
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const fileInfo: FileInfo = {
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
          path: filePath
        };

        newFiles.push(fileInfo);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onUploadComplete(updatedFiles);

      toast({
        title: "Upload successful",
        description: `${newFiles.length} file(s) uploaded successfully`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (fileToRemove: FileInfo) => {
    try {
      // Delete from storage if it's not a pre-existing file
      if (fileToRemove.path) {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([fileToRemove.path]);

        if (error) {
          console.error('Delete error:', error);
        }
      }

      const updatedFiles = files.filter(file => file.path !== fileToRemove.path);
      setFiles(updatedFiles);
      onUploadComplete(updatedFiles);

      toast({
        title: "File removed",
        description: `${fileToRemove.name} has been removed`,
      });
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            Click to upload files or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedTypes.join(', ')} (max {maxFiles} files)
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({files.length}/{maxFiles})</h4>
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type);
            const progress = uploadProgress[file.name];
            
            return (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {progress !== undefined && progress < 100 && (
                      <Progress value={progress} className="mt-1 h-1" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file);
                    }}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Uploading files...</p>
        </div>
      )}
    </div>
  );
};