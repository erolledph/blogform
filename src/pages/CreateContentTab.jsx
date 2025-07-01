import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import SimpleMDE from 'react-simplemde-editor';
import { Save, Upload, ArrowLeft, ImageIcon } from 'lucide-react';
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

  // Separate state for array input fields to improve typing experience
  const [keywordsInput, setKeywordsInput] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Memoize SimpleMDE options to prevent re-initialization on every render
  const simpleMDEOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Write your content in Markdown...',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ]
  }), []);

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

        // Initialize array input fields with joined values
        setKeywordsInput((data.keywords || []).join(', '));
        setCategoriesInput((data.categories || []).join(', '));
        setTagsInput((data.tags || []).join(', '));
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
    
    // Handle title and slug updates in a single state update
    if (name === 'title' && !isEditing) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const parseArrayInput = (value) => {
    return value.split(',').map(item => item.trim()).filter(item => item);
  };

  const handleKeywordsBlur = () => {
    const keywordsArray = parseArrayInput(keywordsInput);
    setFormData(prev => ({
      ...prev,
      keywords: keywordsArray
    }));
  };

  const handleCategoriesBlur = () => {
    const categoriesArray = parseArrayInput(categoriesInput);
    setFormData(prev => ({
      ...prev,
      categories: categoriesArray
    }));
  };

  const handleTagsBlur = () => {
    const tagsArray = parseArrayInput(tagsInput);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
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

    // Ensure array fields are updated with current input values before submitting
    const finalFormData = {
      ...formData,
      keywords: parseArrayInput(keywordsInput),
      categories: parseArrayInput(categoriesInput),
      tags: parseArrayInput(tagsInput)
    };

    setLoading(true);

    try {
      const token = await getAuthToken();
      const url = `/.netlify/functions/admin-content`;
      
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { id, ...finalFormData }
        : finalFormData;

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/manage')}
            className="btn-ghost p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Content' : 'Create New Content'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isEditing ? 'Update your existing content' : 'Write and publish new content'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Content Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Content Details</h2>
            <p className="card-description">Enter the main content information</p>
          </div>
          <div className="card-content space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                <label className="block text-sm font-medium text-foreground mb-2">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content * (Markdown)
              </label>
              <SimpleMDE
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                options={simpleMDEOptions}
              />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Featured Image</h3>
            <p className="card-description">Add a featured image for your content</p>
          </div>
          <div className="card-content space-y-6">
            {formData.featuredImageUrl && (
              <div className="flex justify-center">
                <img
                  src={formData.featuredImageUrl}
                  alt="Featured"
                  className="max-w-md w-full h-48 object-cover rounded-lg border border-border shadow-sm"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
        </div>

        {/* Publish Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Publish Settings</h3>
            <p className="card-description">Configure publication settings</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                <label className="block text-sm font-medium text-foreground mb-2">
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
        </div>

        {/* SEO Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">SEO Settings</h3>
            <p className="card-description">Optimize your content for search engines</p>
          </div>
          <div className="card-content space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  onBlur={handleKeywordsBlur}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                rows={3}
                className="input-field resize-none"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="Brief description for search engines (150-160 characters recommended)"
              />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Organization</h3>
            <p className="card-description">Categorize and tag your content</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categories (comma separated)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  onBlur={handleCategoriesBlur}
                  placeholder="Web Development, Technology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onBlur={handleTagsBlur}
                  placeholder="react, javascript, tutorial"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-border">
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
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (isEditing ? 'Update Content' : 'Create Content')}
          </button>
        </div>
      </form>
    </div>
  );
}