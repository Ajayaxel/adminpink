import { motion } from "framer-motion";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api"; // ✅ Axios instance
import { BASE_URL } from "../../utils/api";


const ProductsTable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
    const [message, setMessage] = useState("");
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("products");
      setProducts(res.data.data);
      setFilteredProducts(res.data.data);
      // console.log(res.data);
      
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
  
  

  return (
    
    <motion.div
      className="bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-xl p-6 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Product List
        </h2>
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>
      </div>

      {/* Add Product Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddProduct}
          className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {[
                "Image", "Name", "SKU", "Category", "Brand", "Price", "Discount", "Stock",
                "Weight", "Size Variants", "Color Variants", "Material",
                "Delivery Time", "Product Description", "Date Added", "Short Desc", "Care Instructions", "Actions"
              ].map((title) => (
                <th
                  key={title}
                  className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold whitespace-nowrap"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">
                  {product.images?.[0] ? (
                    <div className="relative">
                      <img
                        src={`https://backend.pinkstories.ae${product.images[0].replace('/src', '')}`}
                        alt={product.productName}
                        className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                        onClick={() => handleImageClick(product.images)}
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full px-2 py-1">
                        {product.images.length}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{product.productName}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.sku}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.category}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.brand}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">${product.price}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.discount || "-"}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{product.stockQuantity}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.weight}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{Array.isArray(product.sizeVariants) && product.sizeVariants.length > 0 ? product.sizeVariants.join(", ") : ""}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{Array.isArray(product.colorVariants) && product.colorVariants.length > 0 ? product.colorVariants.join(", "): ""}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{Array.isArray(product.material) && product.material.length > 0 ? product.material.join(", ") : ""}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.deliveryTime}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.productDescription}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.dateAdded?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.shortDescription}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.careInstructions}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-3">
                  <button
                    title="Edit"
                    className="text-blue-500 hover:text-blue-400"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    title="Delete"
                    className="text-red-500 hover:text-red-400"
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

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 border border-gray-400 p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Product Images</h3>
            <div className="grid grid-cols-3 gap-4">
              {selectedImages.map((img, index) => (
                <img
                key={index}
                src={`https://backend.pinkstories.ae${img.replace('/src', '')}`}
                alt={`Product Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              ))}
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  
  );
};

export default ProductsTable;














