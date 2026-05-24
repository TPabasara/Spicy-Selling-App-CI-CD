'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Category } from '@/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: '0',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, {
          name: formData.name,
          description: formData.description,
          sort_order: parseInt(formData.sort_order),
        });
        setSuccessMessage('Category updated successfully!');
      } else {
        await api.post('/admin/categories', {
          name: formData.name,
          description: formData.description,
          sort_order: parseInt(formData.sort_order),
        });
        setSuccessMessage('Category created successfully!');
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All products in this category will need to be reassigned.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setSuccessMessage('Category deleted!');
      fetchCategories();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', sort_order: '0' });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
        <button
          onClick={() => { setEditingCategory(null); resetForm(); setShowForm(true); }}
          className="btn-primary"
        >
          Add Category
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ✗ {errorMessage}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Edit' : 'Add'} Category
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Vanilla, Tea, Spices"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Describe this category..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="input-field w-32"
              />
              <p className="text-xs text-stone-400 mt-1">Lower numbers appear first</p>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-6 py-2 border rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-stone-50">
              <th className="text-left p-4 text-sm font-medium text-stone-600">Name</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Slug</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Products</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Order</th>
              <th className="text-right p-4 text-sm font-medium text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-stone-500">
                  No categories found. Create your first category!
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-stone-50">
                  <td className="p-4 font-medium text-stone-900">{category.name}</td>
                  <td className="p-4 text-sm text-stone-500">{category.slug}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                      {category.product_count} products
                    </span>
                  </td>
                  <td className="p-4 text-sm text-stone-600">{category.sort_order}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-primary-600 hover:text-primary-700 mr-3 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
