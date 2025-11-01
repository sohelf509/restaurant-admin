// src/components/MenuItemModal.jsx
import { useState, useEffect } from 'react';
import useMenuStore from '../store/menuStore';

const MenuItemModal = ({ isOpen, onClose, editItem = null }) => {
  const { addMenuItem, updateMenuItem, isLoading, error, clearError } = useMenuStore();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Main Course',
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [editItemId, setEditItemId] = useState(null); // ✅ Add this

  const categories = ['Starters', 'Main Course', 'Desserts', 'Drinks', 'Others'];

  useEffect(() => {
    if (editItem) {
      // ✅ Store the ID when modal opens
      const itemId = editItem.id || editItem._id;
      console.log('Edit item received, ID:', itemId);
      setEditItemId(itemId);
      
      setFormData({
        name: editItem.name || '',
        price: editItem.price || '',
        description: editItem.description || '',
        category: editItem.category || 'Main Course',
        isAvailable: editItem.isAvailable ?? true,
      });
      setImagePreview(editItem.imageUrl || null);
      setRemoveImage(false);
    } else {
      setEditItemId(null);
      resetForm();
    }
  }, [editItem, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Main Course',
      isAvailable: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setEditItemId(null); // ✅ Reset stored ID
    setValidationError('');
    clearError();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setValidationError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setValidationError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('Name is required');
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setValidationError('Please enter a valid price');
      return false;
    }

    if (!formData.category) {
      setValidationError('Please select a category');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    console.log('Form submitted with data:', formData);
    console.log('Edit item ID:', editItemId); // ✅ Use stored ID

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Create FormData object
    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('price', parseFloat(formData.price).toFixed(2));
    data.append('description', formData.description.trim());
    data.append('category', formData.category);
    data.append('isAvailable', String(formData.isAvailable));
    
    if (imageFile) {
      data.append('image', imageFile);
      console.log('Image file added:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size
      });
    } else if (removeImage && editItemId) { // ✅ Use stored ID
      data.append('removeImage', 'true');
      console.log('Image removal requested');
    }

    // DEBUG: Log all FormData entries
    console.log('=== FormData Contents ===');
    for (let pair of data.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
    console.log('========================');

    console.log('Submitting to:', editItemId ? 'UPDATE' : 'ADD');

    let result;
    if (editItemId) { // ✅ Use stored ID instead of editItem._id
      console.log('Updating with ID:', editItemId);
      result = await updateMenuItem(editItemId, data);
    } else {
      result = await addMenuItem(data);
    }

    console.log('Submit result:', result);

    if (result.success) {
      console.log('Item saved successfully, closing modal');
      resetForm();
      onClose();
    } else {
      console.error('Failed to save item:', result.error);
      setValidationError(result.error);
    }
  };

  if (!isOpen) return null;

  const displayError = validationError || error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              type="button"
            >
              ×
            </button>
          </div>

          {displayError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              <div className="flex items-center space-x-4">
                {imagePreview && !removeImage && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <span className="text-sm font-medium">
                    {imagePreview && !removeImage ? 'Change Image' : 'Choose Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Margherita Pizza"
                required
              />
            </div>

            {/* Price in INR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-lg">₹</span>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item description..."
              />
            </div>

            {/* Availability */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-gray-700">
                Available for order
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isLoading ? 'Saving...' : editItemId ? 'Update Item' : 'Add Item'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;