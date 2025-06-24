import { motion } from "framer-motion";
import { Edit, Trash2, Plus, Search, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { BASE_URL } from "../../utils/api";

const ProductsTable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("products");
      setProducts(res.data.data);
      setFilteredProducts(res.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = products.filter((product) =>
      product.productName?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  const handleImageClick = (images) => {
    setSelectedImages(images);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("❌ No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}products/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("✅ Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setFilteredProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        throw new Error(result.message || "API error");
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }
  };

  // Card component for mobile view
  const ProductCard = ({ product }) => (
    <motion.div
      className="bg-gray-800 mb-6 rounded-xl shadow-lg p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {product.images?.[0] ? (
            <div className="relative">
              <img
                src={`https://backend.pinkstories.ae${product.images[0].replace('/src', '')}`}
                alt={product.productName}
                className="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-gray-600"
                onClick={() => handleImageClick(product.images)}
              />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1 font-semibold">
                {product.images.length}
              </span>
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white text-lg">
              {product.productName}
            </h3>
            <p className="text-sm text-gray-400">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            title="Edit"
            className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <Edit size={18} />
          </button>
          <button
            title="Delete"
            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            onClick={() => handleDeleteProduct(product._id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-300">Category:</span>
            <p className="text-white">{product.category}</p>
          </div>
          <div>
            <span className="font-medium text-gray-300">Brand:</span>
            <p className="text-white">{product.brand}</p>
          </div>
          <div>
            <span className="font-medium text-gray-300">Price:</span>
            <p className="text-lg font-bold text-green-400">${product.price}</p>
          </div>
          <div>
            <span className="font-medium text-gray-300">Stock:</span>
            <p className={`font-semibold ${product.stockQuantity > 10 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stockQuantity}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-300">Weight:</span>
            <p className="text-white">{product.weight}</p>
          </div>
          <div>
            <span className="font-medium text-gray-300">Discount:</span>
            <p className="text-white">{product.discount || "-"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-300">Delivery:</span>
            <p className="text-white">{product.deliveryTime}</p>
          </div>
          <div>
            <span className="font-medium text-gray-300">Date Added:</span>
            <p className="text-white">{product.dateAdded?.slice(0, 10)}</p>
          </div>
        </div>
      </div>

      {product.sizeVariants && product.sizeVariants.length > 0 && (
        <div className="mt-3">
          <span className="font-medium text-gray-300">Sizes:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {product.sizeVariants.map((size, index) => (
              <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                {size}
              </span>
            ))}
          </div>
        </div>
      )}

      {product.colorVariants && product.colorVariants.length > 0 && (
        <div className="mt-3">
          <span className="font-medium text-gray-300">Colors:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {product.colorVariants.map((color, index) => (
              <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full">
                {color}
              </span>
            ))}
          </div>
        </div>
      )}

      {product.material && product.material.length > 0 && (
        <div className="mt-3">
          <span className="font-medium text-gray-300">Material:</span>
          <p className="text-white text-sm">{product.material.join(", ")}</p>
        </div>
      )}

      {product.shortDescription && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <span className="font-medium text-gray-300">Description:</span>
          <p className="text-gray-400 text-sm mt-1">{product.shortDescription}</p>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h2 className="text-3xl font-bold text-white">
            Product Management
          </h2>
          
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name..."
                className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={handleSearch}
                value={searchTerm}
              />
            </div>
            
            {/* View Mode Toggle for smaller screens */}
            <div className="flex bg-gray-800 rounded-xl p-1 lg:hidden">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "cards"
                    ? "bg-gray-700 text-blue-400 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-gray-700 text-blue-400 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Add Product Button and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          <div className="text-sm text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={20} className="mr-2" />
            Add New Product
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mt-4 p-4 rounded-xl bg-blue-900/20 border border-blue-800">
            <p className="text-blue-300">{message}</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Mobile/Tablet Card View */}
        <div className={`${viewMode === "table" ? "lg:hidden" : ""} ${viewMode === "cards" ? "block" : "hidden lg:hidden"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className={`${viewMode === "cards" ? "hidden" : "hidden lg:block"} overflow-x-auto`}>
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {[
                  "Product", "Details", "Pricing", "Inventory", "Variants", 
                  "Specifications", "Descriptions", "Actions"
                ].map((title) => (
                  <th
                    key={title}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-800/50 transition-colors">
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {product.images?.[0] ? (
                        <div className="relative">
                          <img
                            src={`https://backend.pinkstories.ae${product.images[0].replace('/src', '')}`}
                            alt={product.productName}
                            className="w-16 h-16 object-cover rounded-xl cursor-pointer border border-gray-600"
                            onClick={() => handleImageClick(product.images)}
                          />
                          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1 font-semibold">
                            {product.images.length}
                          </span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white"><span className="font-medium">Category:</span> {product.category}</p>
                      <p className="text-sm text-white"><span className="font-medium">Brand:</span> {product.brand}</p>
                      <p className="text-sm text-white"><span className="font-medium">Added:</span> {product.dateAdded?.slice(0, 10)}</p>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-green-400">${product.price}</p>
                      <p className="text-sm text-gray-400">
                        Discount: {product.discount || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Inventory */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className={`font-semibold ${product.stockQuantity > 10 ? 'text-green-400' : 'text-red-400'}`}>
                        Stock: {product.stockQuantity}
                      </p>
                      <p className="text-sm text-gray-400">Weight: {product.weight}</p>
                      <p className="text-sm text-gray-400">Delivery: {product.deliveryTime}</p>
                    </div>
                  </td>

                  {/* Variants */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {product.sizeVariants && product.sizeVariants.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-300 mb-1">Sizes:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.sizeVariants.slice(0, 3).map((size, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                                {size}
                              </span>
                            ))}
                            {product.sizeVariants.length > 3 && (
                              <span className="text-xs text-gray-500">+{product.sizeVariants.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {product.colorVariants && product.colorVariants.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-300 mb-1">Colors:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.colorVariants.slice(0, 3).map((color, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                                {color}
                              </span>
                            ))}
                            {product.colorVariants.length > 3 && (
                              <span className="text-xs text-gray-500">+{product.colorVariants.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Specifications */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {product.material && product.material.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-300">Material:</p>
                          <p className="text-sm text-gray-400">
                            {product.material.slice(0, 2).join(", ")}
                            {product.material.length > 2 && "..."}
                          </p>
                        </div>
                      )}
                      {product.careInstructions && (
                        <div>
                          <p className="text-xs font-medium text-gray-300">Care:</p>
                          <p className="text-sm text-gray-400 truncate max-w-xs">
                            {product.careInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Descriptions */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {product.productDescription && (
                        <div>
                          <p className="text-xs font-medium text-gray-300">Description:</p>
                          <p className="text-sm text-gray-400 truncate max-w-xs">
                            {product.productDescription}
                          </p>
                        </div>
                      )}
                      {product.shortDescription && (
                        <div>
                          <p className="text-xs font-medium text-gray-300">Short Desc:</p>
                          <p className="text-sm text-gray-400 truncate max-w-xs">
                            {product.shortDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        title="Edit Product"
                        className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        title="Delete Product"
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? `No products match "${searchTerm}"` : "No products available"}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Image Modal */}
      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-5xl p-4"
    >
      <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Product Images ({selectedImages.length})
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Image Display */}
        <div className="p-4 sm:p-6">
          <motion.img
            key={selectedImages[0]}
            src={`https://backend.pinkstories.ae${selectedImages[0].replace('/src', '')}`}
            alt="Selected Product"
            className="w-full max-h-[70vh] object-contain rounded-xl border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Thumbnails */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-gray-700">
          <div className="flex overflow-x-auto gap-3">
            {selectedImages.map((img, index) => (
              <img
                key={index}
                src={`https://backend.pinkstories.ae${img.replace('/src', '')}`}
                alt={`Thumb ${index + 1}`}
                onClick={() => {
                  const reordered = [...selectedImages];
                  const [selected] = reordered.splice(index, 1);
                  setSelectedImages([selected, ...reordered]);
                }}
                className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border transition-transform cursor-pointer
                  ${
                    index === 0
                      ? "border-blue-500 scale-105"
                      : "border-gray-600 hover:border-blue-500"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
)}

    </motion.div>
  );
};

export default ProductsTable;














