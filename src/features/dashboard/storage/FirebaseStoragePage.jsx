import React, { useState, useEffect } from 'react';
import { ref, listAll, getMetadata, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/shared/DataTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Modal from '@/components/shared/Modal';
import { 
  Folder, 
  FileImage, 
  Download, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  AlertTriangle,
  HardDrive,
  Calendar,
  Eye
} from 'lucide-react';
import { formatBytes } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function FirebaseStoragePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, file: null });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [totalSize, setTotalSize] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Recursively list all files in the storage bucket including subfolders
      const storageRef = ref(storage);
      const allFiles = await listAllFilesRecursive(storageRef);
      
      // Sort by creation date (newest first)
      allFiles.sort((a, b) => b.timeCreated - a.timeCreated);
      
      setFiles(allFiles);
      
      // Calculate total size
      const total = allFiles.reduce((sum, file) => sum + file.size, 0);
      setTotalSize(total);
      
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error.message);
      toast.error('Failed to fetch files from storage');
    } finally {
      setLoading(false);
    }
  };

  // Recursive function to list all files including those in subfolders
  const listAllFilesRecursive = async (storageRef) => {
    const allFiles = [];
    
    try {
      const result = await listAll(storageRef);
      
      // Process files at current level
      const filePromises = result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          return {
            id: itemRef.fullPath,
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: new Date(metadata.timeCreated),
            downloadURL,
            ref: itemRef
          };
        } catch (error) {
          console.warn(`Error fetching metadata for ${itemRef.name}:`, error);
          return null;
        }
      });
      
      const currentLevelFiles = (await Promise.all(filePromises)).filter(Boolean);
      allFiles.push(...currentLevelFiles);
      
      // Recursively process subfolders
      const subfolderPromises = result.prefixes.map(async (prefixRef) => {
        try {
          const subfolderFiles = await listAllFilesRecursive(prefixRef);
          return subfolderFiles;
        } catch (error) {
          console.warn(`Error listing files in folder ${prefixRef.fullPath}:`, error);
          return [];
        }
      });
      
      const subfolderResults = await Promise.all(subfolderPromises);
      subfolderResults.forEach(subfolderFiles => {
        allFiles.push(...subfolderFiles);
      });
      
    } catch (error) {
      console.error(`Error listing files in ${storageRef.fullPath}:`, error);
    }
    
    return allFiles;
  };

  const handleDelete = async (file) => {
    try {
      await deleteObject(file.ref);
      toast.success('File deleted successfully');
      setDeleteModal({ isOpen: false, file: null });
      fetchFiles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handlePreview = (file) => {
    setPreviewModal({ isOpen: true, file });
  };

  const getFileIcon = (contentType) => {
    if (contentType?.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-600" />;
    }
    return <Folder className="h-5 w-5 text-gray-600" />;
  };

  const isImage = (contentType) => {
    return contentType?.startsWith('image/');
  };

  const columns = [
    {
      key: 'preview',
      title: 'Preview',
      sortable: false,
      render: (_, row) => (
        <div className="w-12 h-12 flex-shrink-0">
          {isImage(row.contentType) ? (
            <img
              src={row.downloadURL}
              alt={row.name}
              className="w-12 h-12 object-cover rounded border border-border cursor-pointer hover:opacity-80"
              onClick={() => handlePreview(row)}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-12 h-12 bg-muted rounded border border-border flex items-center justify-center ${isImage(row.contentType) ? 'hidden' : 'flex'}`}
          >
            {getFileIcon(row.contentType)}
          </div>
        </div>
      )
    },
    {
      key: 'name',
      title: 'File Name',
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="text-base font-medium text-foreground truncate max-w-xs">
            {value}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.contentType || 'Unknown type'}
          </div>
        </div>
      )
    },
    {
      key: 'size',
      title: 'Size',
      render: (value) => (
        <span className="text-base text-foreground">{formatBytes(value)}</span>
      )
    },
    {
      key: 'timeCreated',
      title: 'Created',
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-base text-foreground">
            {value.toLocaleDateString()}
          </span>
          <span className="text-sm text-muted-foreground">
            {value.toLocaleTimeString()}
          </span>
        </div>
      )
    },
    {
      key: 'fullPath',
      title: 'Path',
      render: (value) => (
        <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">
          {value}
        </code>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-1">
          {isImage(row.contentType) && (
            <button
              onClick={() => handlePreview(row)}
              className="text-blue-600 p-2 rounded hover:bg-blue-50"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <a
            href={row.downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 p-2 rounded hover:bg-green-50"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
          <a
            href={row.downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 p-2 rounded hover:bg-gray-50"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={() => setDeleteModal({ isOpen: true, file: row })}
            className="text-destructive p-2 rounded hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Firebase Storage</h1>
          <p className="text-lg text-muted-foreground">
            {files.length} files • {formatBytes(totalSize)} total
          </p>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="btn-secondary inline-flex items-center"
        >
          <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-blue-200 bg-blue-50">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-2">Total Files</p>
                <p className="text-3xl font-bold text-blue-900">{files.length}</p>
              </div>
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card border-green-200 bg-green-50">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Total Size</p>
                <p className="text-3xl font-bold text-green-900">{formatBytes(totalSize)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card border-purple-200 bg-purple-50">
          <div className="card-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-2">Images</p>
                <p className="text-3xl font-bold text-purple-900">
                  {files.filter(f => isImage(f.contentType)).length}
                </p>
              </div>
              <FileImage className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Storage Usage Warning */}
      <div className="card border-amber-200 bg-amber-50">
        <div className="card-content p-6">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Storage Usage Notice</h3>
              <div className="text-base text-amber-700 space-y-2">
                <p>
                  <strong>Current Usage:</strong> {formatBytes(totalSize)} of 5 GB Spark plan limit 
                  ({((totalSize / (5 * 1024 * 1024 * 1024)) * 100).toFixed(2)}% used)
                </p>
                <p>
                  <strong>Download Limit:</strong> 1 GB per day on the free Spark plan
                </p>
                <p>
                  If you exceed these limits, consider upgrading to the Blaze plan for pay-as-you-go pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="card border-red-200 bg-red-50">
          <div className="card-content p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Files</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button onClick={fetchFiles} className="btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-16">
            <Folder className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-4">No files found</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Upload some images through the content creation process to see them here.
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          data={files}
          columns={columns}
          searchable={true}
          sortable={true}
          pagination={true}
          pageSize={20}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, file: null })}
        title="Delete File"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-base text-foreground">
            Are you sure you want to delete "{deleteModal.file?.name}"?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The file will be permanently removed from Firebase Storage.
          </p>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setDeleteModal({ isOpen: false, file: null })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteModal.file)}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, file: null })}
        title={previewModal.file?.name}
        size="xl"
      >
        {previewModal.file && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={previewModal.file.downloadURL}
                alt={previewModal.file.name}
                className="max-w-full max-h-96 object-contain rounded-lg border border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-foreground">File Size:</span>
                <span className="ml-2 text-muted-foreground">{formatBytes(previewModal.file.size)}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Type:</span>
                <span className="ml-2 text-muted-foreground">{previewModal.file.contentType}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Created:</span>
                <span className="ml-2 text-muted-foreground">{previewModal.file.timeCreated.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Path:</span>
                <span className="ml-2 text-muted-foreground font-mono text-xs">{previewModal.file.fullPath}</span>
              </div>
            </div>
            <div className="flex justify-center space-x-4 pt-4">
              <a
                href={previewModal.file.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
              <a
                href={previewModal.file.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
