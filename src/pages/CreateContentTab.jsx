import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import SimpleMDE from 'react-simplemde-editor';
import { Save, Upload, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import 'easymde/dist/easymde.min.css';

export default function CreateContentTab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    featuredImageUrl: '',
    metaDescription: '',
    seoTitle: '',
    keywords: [],
    author: '',
    categories: [],
    tags: [],
    status: 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchContent();
    }
  }, [id, isEditing]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          featuredImageUrl: data.featuredImageUrl || '',
          metaDescription: data.metaDescription || '',
          seoTitle: data.seoTitle || '',
          keywords: data.keywords || [],
          author: data.author || '',
          categories: data.categories || [],
          tags: data.tags || [],
          status: data.status || 'draft'
        });
      } else {
        toast.error('Content not found');
        navigate('/dashboard/manage');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleArrayInputChange = (e, field) => {
    const value = e.target.value;
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploading(true);

    try {
      const timestamp = Date.now();
      const fileName = `images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({
        ...prev,
        featuredImageUrl: downloadURL
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const token = await getAuthToken();
      const url = isEditing 
        ? `/.netlify/functions/admin-content`
        : `/.netlify/functions/admin-content`;
      
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(isEditing ? 'Content updated successfully' : 'Content created successfully');
        navigate('/dashboard/manage');
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/manage')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Content' : 'Create New Content'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isEditing ? 'Update your existing content' : 'Write and publish new content'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    required
                    className="input-field"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="url-friendly-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content * (Markdown)
                  </label>
                  <SimpleMDE
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    options={{
                      spellChecker: false,
                      placeholder: 'Write your content in Markdown...',
                      toolbar: [
                        'bold', 'italic', 'heading', '|',
                        'quote', 'unordered-list', 'ordered-list', '|',
                        'link', 'image', '|',
                        'preview', 'side-by-side', 'fullscreen', '|',
                        'guide'
                      ]
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="input-field"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    className="input-field"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Author name"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
              
              <div className="space-y-4">
                {formData.featuredImageUrl && (
                  <div>
                    <img
                      src={formData.featuredImageUrl}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="url"
                    name="featuredImageUrl"
                    className="input-field"
                    value={formData.featuredImageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    className="input-field"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    rows={3}
                    className="input-field"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => handleArrayInputChange(e, 'keywords')}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories (comma separated)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.categories.join(', ')}
                    onChange={(e) => handleArrayInputChange(e, 'categories')}
                    placeholder="Web Development, Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayInputChange(e, 'tags')}
                    placeholder="react, javascript, tutorial"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/manage')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (isEditing ? 'Update Content' : 'Create Content')}
          </button>
        </div>
      </form>
    </div>
  );
}