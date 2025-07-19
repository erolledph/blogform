import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
import { fromBlob } from 'image-resize-compress';
import InputField from './InputField';
import LoadingSpinner from './LoadingSpinner';
import { Upload, Image as ImageIcon, FileImage, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatBytes } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function ImageUploader({ 
  onUploadSuccess, 
  onUploadError,
  currentPath = '',
  className = '',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  quality = 80,
  maxWidth = 1920,
  maxHeight = 1080
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`Image size should be less than ${formatBytes(maxFileSize)}`);
      return;
    }

    setSelectedFile(file);
    
    // Generate default filename (remove extension and add timestamp)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    setNewFileName(`${nameWithoutExt}-${timestamp}`);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start compression preview
    await compressImage(file, true);
  };

  const compressImage = async (file, previewOnly = false) => {
    try {
      if (!previewOnly) {
        setCompressing(true);
      }

      const originalSize = file.size;
      
      // Compress and convert to WebP
      const compressedBlob = await fromBlob(
        file,
        quality,
        maxWidth,
        maxHeight,
        'webp'
      );

      const compressionRatio = ((originalSize - compressedBlob.size) / originalSize * 100).toFixed(1);
      
      setCompressionStats({
        originalSize,
        compressedSize: compressedBlob.size,
        compressionRatio,
        format: 'webp'
      });

      if (!previewOnly) {
        setCompressing(false);
      }

      return compressedBlob;
    } catch (error) {
      console.error('Error compressing image:', error);
      if (!previewOnly) {
        setCompressing(false);
        toast.error('Failed to compress image');
      }
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newFileName.trim()) {
      toast.error('Please select a file and enter a filename');
      return;
    }

    try {
      setCompressing(true);
      
      // Compress the image
      const compressedBlob = await compressImage(selectedFile);
      
      setCompressing(false);
      setUploading(true);

      // Create storage path
      const fileName = `${newFileName.trim()}.webp`;
      const fullPath = currentPath ? `${currentPath}/${fileName}` : `images/${fileName}`;
      const storageRef = ref(storage, fullPath);
      
      // Upload compressed image
      await uploadBytes(storageRef, compressedBlob, {
        contentType: 'image/webp',
        customMetadata: {
          originalName: selectedFile.name,
          originalSize: selectedFile.size.toString(),
          compressedSize: compressedBlob.size.toString(),
          compressionRatio: compressionStats.compressionRatio
        }
      });
      
      const downloadURL = await getDownloadURL(storageRef);
      
      toast.success('Image uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setNewFileName('');
      setCompressionStats(null);
      setPreviewUrl(null);
      
      // Clear file input
      const fileInput = document.getElementById('image-upload-input');
      if (fileInput) fileInput.value = '';

      // Callback for parent component
      if (onUploadSuccess) {
        onUploadSuccess({
          fileName,
          fullPath,
          downloadURL,
          size: compressedBlob.size,
          originalSize: selectedFile.size,
          compressionRatio: compressionStats.compressionRatio
        });
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setCompressing(false);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setNewFileName('');
    setCompressionStats(null);
    setPreviewUrl(null);
    
    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) fileInput.value = '';
  };

  const isProcessing = compressing || uploading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Selection */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upload & Compress Image</h3>
          <p className="card-description">
            Select an image to compress and convert to WebP format
          </p>
        </div>
        <div className="card-content space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-base font-medium text-foreground mb-4">
              Select Image File
            </label>
            <div className="relative">
              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="input-field"
                disabled={isProcessing}
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: JPEG, PNG, GIF, BMP, TIFF. Max size: {formatBytes(maxFileSize)}
            </p>
          </div>

          {/* Preview and Stats */}
          {selectedFile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div>
                <h4 className="text-base font-medium text-foreground mb-3">Preview</h4>
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Compression Stats */}
              <div>
                <h4 className="text-base font-medium text-foreground mb-3">Compression Preview</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileImage className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Original</span>
                    </div>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div>Size: {formatBytes(selectedFile.size)}</div>
                      <div>Format: {selectedFile.type}</div>
                    </div>
                  </div>

                  {compressionStats && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Compressed</span>
                      </div>
                      <div className="space-y-1 text-sm text-green-700">
                        <div>Size: {formatBytes(compressionStats.compressedSize)}</div>
                        <div>Format: WebP</div>
                        <div className="font-medium">
                          Saved: {compressionStats.compressionRatio}% 
                          ({formatBytes(compressionStats.originalSize - compressionStats.compressedSize)})
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filename Input */}
          {selectedFile && (
            <InputField
              label="New Filename (without extension)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter filename"
              disabled={isProcessing}
              className="max-w-md"
            />
          )}

          {/* Upload Button */}
          {selectedFile && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleUpload}
                disabled={isProcessing || !newFileName.trim()}
                className="btn-primary"
              >
                {compressing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-3" />
                    Compressing...
                  </>
                ) : uploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-3" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-3" />
                    Upload Compressed Image
                  </>
                )}
              </button>
              
              <button
                onClick={resetForm}
                disabled={isProcessing}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compression Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Compression Settings</h3>
          <p className="card-description">
            Current settings for image optimization
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium text-foreground mb-1">Quality</div>
              <div className="text-lg font-bold text-primary">{quality}%</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium text-foreground mb-1">Max Width</div>
              <div className="text-lg font-bold text-primary">{maxWidth}px</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium text-foreground mb-1">Max Height</div>
              <div className="text-lg font-bold text-primary">{maxHeight}px</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium text-foreground mb-1">Format</div>
              <div className="text-lg font-bold text-primary">WebP</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Optimization Info</p>
                <p className="text-sm text-blue-700">
                  Images are automatically compressed to WebP format with {quality}% quality. 
                  Large images are resized to fit within {maxWidth}x{maxHeight}px while maintaining aspect ratio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}