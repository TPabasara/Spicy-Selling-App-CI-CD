"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Product, Category } from "@/types";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    compare_price: "",
    stock_quantity: "",
    unit: "",
    category_id: "",
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const response = await api.get("/products/", { params: { limit: 100 } });
    setProducts(response.data.items);
  };

  const fetchCategories = async () => {
    const response = await api.get("/categories/");
    setCategories(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      compare_price: formData.compare_price
        ? parseFloat(formData.compare_price)
        : null,
      stock_quantity: parseInt(formData.stock_quantity),
      category_id: parseInt(formData.category_id),
    };

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      unit: product.unit,
      category_id: product.category_id.toString(),
      is_featured: product.is_featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      short_description: "",
      price: "",
      compare_price: "",
      stock_quantity: "",
      unit: "",
      category_id: "",
      is_featured: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editingProduct ? "Edit" : "Add"} Product
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="input-field"
              >
                <option value="">Select</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit *</label>
              <input
                type="text"
                required
                placeholder="e.g., 100g"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (LKR) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Compare Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.compare_price}
                onChange={(e) =>
                  setFormData({ ...formData, compare_price: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock *</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    short_description: e.target.value,
                  })
                }
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">
                {editingProduct ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-stone-50">
              <th className="text-left p-4 text-sm font-medium">Product</th>
              <th className="text-left p-4 text-sm font-medium">Price</th>
              <th className="text-left p-4 text-sm font-medium">Stock</th>
              <th className="text-right p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-stone-50">
                <td className="p-4">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.unit}</p>
                </td>
                <td className="p-4">LKR {product.price.toLocaleString()}</td>
                <td className="p-4">{product.stock_quantity}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-primary-600 hover:text-primary-700 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
