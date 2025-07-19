import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import SimpleMDE from 'react-simplemde-editor';
import InputField from '@/components/shared/InputField';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Save, ArrowLeft, DollarSign, Percent, Upload, X, ImageIcon } from 'lucide-react';
import { generateSlug, parseArrayInput } from '@/utils/helpers';
import toast from 'react-hot-toast';
import 'easymde/dist/easymde.min.css';

export default function CreateProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    percentOff: '',
    imageUrls: [], // Changed from imageUrl to imageUrls array
    productUrl: '',
    category: '',
    tags: [],
    status: 'draft'
  });

  // Separate state for array input fields
  const [tagsInput, setTagsInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Memoize SimpleMDE options
  const simpleMDEOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Write your product description in Markdown...',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', '|',
      'guide'
    ]
  }), []);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id, isEditing]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          percentOff: data.percentOff?.toString() || '',
          imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []), // Handle migration from single imageUrl
          productUrl: data.productUrl || '',
          category: data.category || '',
          tags: data.tags || [],
          status: data.status || 'draft'
        });

        setTagsInput((data.tags || []).join(', '));
      } else {
        toast.error('Product not found');
        navigate('/dashboard/manage-products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.percentOff && (isNaN(parseFloat(formData.percentOff)) || parseFloat(formData.percentOff) < 0 || parseFloat(formData.percentOff) > 100)) {
      newErrors.percentOff = 'Percent off must be between 0 and 100';
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
    
    // Handle name and slug updates
    if (name === 'name' && !isEditing) {
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

  const handleTagsBlur = () => {
    const tagsArray = parseArrayInput(tagsInput);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check if adding these files would exceed the 5 image limit
    const currentImageCount = formData.imageUrls.length;
    const totalImages = currentImageCount + files.length;
    
    if (totalImages > 5) {
      toast.error(`You can only upload up to 5 images. You currently have ${currentImageCount} images.`);
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const fileName = `products/${timestamp}-${randomId}-${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const newImageUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newImageUrls]
      }));
      
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      // Clear the input so the same files can be selected again if needed
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
    toast.success('Image removed');
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const percentOff = parseFloat(formData.percentOff) || 0;
    if (percentOff > 0) {
      return price - (price * (percentOff / 100));
    }
    return price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const finalFormData = {
      ...formData,
      price: parseFloat(formData.price),
      percentOff: parseFloat(formData.percentOff) || 0,
      tags: parseArrayInput(tagsInput)
    };

    setLoading(true);

    try {
      const token = await getAuthToken();
      const url = `/.netlify/functions/admin-product`;
      
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
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        navigate('/dashboard/manage-products');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice();
  const savings = parseFloat(formData.price) - discountedPrice;

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="page-title">
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </h1>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/dashboard/manage-products')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading || uploading}
            className="btn-primary"
          >
            <Save className="h-5 w-5 mr-3" />
            {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Product Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Product Details</h2>
              </div>
              <div className="card-content space-y-6">
                <div className="grid-responsive-2">
                  <InputField
                    label="Product Name"
                    name="name"
                    required
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
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
                    Description <span className="text-destructive">*</span>
                  </label>
                  <SimpleMDE
                    value={formData.description}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, description: value }));
                      if (errors.description) {
                        setErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    options={simpleMDEOptions}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-destructive">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Product Images</h3>
                <p className="card-description">Upload up to 5 images for your product</p>
              </div>
              <div className="card-content space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-base font-medium text-foreground mb-4">
                    Upload Images ({formData.imageUrls.length}/5)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="input-field"
                      disabled={uploading || formData.imageUrls.length >= 5}
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>
                  {formData.imageUrls.length >= 5 && (
                    <p className="mt-2 text-sm text-amber-600">
                      Maximum of 5 images reached. Remove an image to upload more.
                    </p>
                  )}
                </div>

                {/* Image Preview Grid */}
                {formData.imageUrls.length > 0 && (
                  <div>
                    <h4 className="text-base font-medium text-foreground mb-4">Uploaded Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.imageUrls.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {formData.imageUrls.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-base text-muted-foreground mb-2">No images uploaded yet</p>
                    <p className="text-sm text-muted-foreground">
                      Upload up to 5 images to showcase your product
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-8">
            {/* Pricing */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Pricing</h3>
              </div>
              <div className="card-content space-y-6">
                <InputField
                  label="Price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  icon={DollarSign}
                />

                <InputField
                  label="Percent Off"
                  name="percentOff"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.percentOff}
                  onChange={handleInputChange}
                  error={errors.percentOff}
                  icon={Percent}
                />

                {/* Price Preview */}
                {formData.price && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2">Price Preview</h4>
                    <div className="space-y-1">
                      {formData.percentOff && parseFloat(formData.percentOff) > 0 ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">
                              ${discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-sm line-through text-muted-foreground">
                              ${parseFloat(formData.price).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm text-red-600">
                            {formData.percentOff}% off • Save ${savings.toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-bold text-foreground">
                          ${parseFloat(formData.price).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Publish Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Publish Settings</h3>
              </div>
              <div className="card-content space-y-6">
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
                  label="Category"
                  name="category"
                  placeholder="e.g., Electronics, Clothing, Books"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Organization */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Organization</h3>
              </div>
              <div className="card-content">
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
                    placeholder="electronics, gadget, popular"
                  />
                </div>
              </div>
            </div>

            {/* External Link */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">External Link</h3>
              </div>
              <div className="card-content">
                <InputField
                  label="Product URL"
                  name="productUrl"
                  type="url"
                  placeholder="https://example.com/product-page"
                  value={formData.productUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}