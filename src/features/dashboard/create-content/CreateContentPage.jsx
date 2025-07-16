import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useContentById } from '@/hooks/useContent';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
import SimpleMDE from 'react-simplemde-editor';
import InputField from '@/components/shared/InputField';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Save, ArrowLeft } from 'lucide-react';
import { generateSlug, parseArrayInput } from '@/utils/helpers';
import toast from 'react-hot-toast';
import 'easymde/dist/easymde.min.css';

export default function CreateContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const isEditing = Boolean(id);
  const { content: existingContent, loading: contentLoading } = useContentById(id);

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
  const [errors, setErrors] = useState({});

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
    if (isEditing && existingContent) {
      setFormData({
        title: existingContent.title || '',
        slug: existingContent.slug || '',
        content: existingContent.content || '',
        featuredImageUrl: existingContent.featuredImageUrl || '',
        metaDescription: existingContent.metaDescription || '',
        seoTitle: existingContent.seoTitle || '',
        keywords: existingContent.keywords || [],
        author: existingContent.author || '',
        categories: existingContent.categories || [],
        tags: existingContent.tags || [],
        status: existingContent.status || 'draft'
      });

      // Initialize array input fields with joined values
      setKeywordsInput((existingContent.keywords || []).join(', '));
      setCategoriesInput((existingContent.categories || []).join(', '));
      setTagsInput((existingContent.tags || []).join(', '));
    }
  }, [isEditing, existingContent]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
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
    
    if (!validateForm()) {
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

  if (contentLoading && isEditing) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header with Action Buttons */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard/manage')}
              className="btn-ghost p-3"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {isEditing ? 'Edit Content' : 'Create New Content'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isEditing ? 'Update your existing content' : 'Write and publish new content'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons at Top */}
        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-border">
          <button
            type="button"
            onClick={() => navigate('/dashboard/manage')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="content-form"
            disabled={loading || uploading}
            className="btn-primary"
          >
            <Save className="h-5 w-5 mr-3" />
            {loading ? 'Saving...' : (isEditing ? 'Update Content' : 'Create Content')}
          </button>
        </div>
      </div>

      <form id="content-form" onSubmit={handleSubmit}>
        {/* Two Column Layout for Wide Screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Content Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Content Details</h2>
                <p className="card-description text-lg">Enter the main content information</p>
              </div>
              <div className="card-content space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <InputField
                    label="Title"
                    name="title"
                    required
                    placeholder="Enter content title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                  />

                  <InputField
                    label="Slug"
                    name="slug"
                    required
                    placeholder="url-friendly-slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    error={errors.slug}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-foreground mb-4">
                    Content <span className="text-destructive">*</span>
                  </label>
                  <SimpleMDE
                    value={formData.content}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, content: value }));
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: '' }));
                      }
                    }}
                    options={simpleMDEOptions}
                  />
                  {errors.content && (
                    <p className="mt-2 text-sm text-destructive">{errors.content}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Featured Image</h3>
                <p className="card-description text-lg">Add a featured image for your content</p>
              </div>
              <div className="card-content space-y-8">
                {formData.featuredImageUrl && (
                  <div className="flex justify-center mb-8">
                    <img
                      src={formData.featuredImageUrl}
                      alt="Featured"
                      className="max-w-lg w-full h-64 object-cover rounded-lg border border-border shadow-sm"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-medium text-foreground mb-4">
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
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                  </div>

                  <InputField
                    label="Or Image URL"
                    name="featuredImageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.featuredImageUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-8">
            {/* Publish Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Publish Settings</h3>
                <p className="card-description text-lg">Configure publication settings</p>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-medium text-foreground mb-4">
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

                  <InputField
                    label="Author"
                    name="author"
                    placeholder="Author name"
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">SEO Settings</h3>
                <p className="card-description text-lg">Optimize your content for search engines</p>
              </div>
              <div className="card-content space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <InputField
                    label="SEO Title"
                    name="seoTitle"
                    placeholder="SEO optimized title"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                  />

                  <div>
                    <label className="block text-base font-medium text-foreground mb-4">
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
                  <label className="block text-base font-medium text-foreground mb-4">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    rows={4}
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
                <p className="card-description text-lg">Categorize and tag your content</p>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-medium text-foreground mb-4">
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
                    <label className="block text-base font-medium text-foreground mb-4">
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
          </div>
        </div>
      </form>
    </div>
  );
}