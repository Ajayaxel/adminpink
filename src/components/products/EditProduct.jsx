import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/api";
import { useNavigate, useParams } from 'react-router-dom';
import api from "../../utils/api"; // ✅ Axios instance

const EditProductForm = () => {
      const { id } = useParams(); // get product ID from URL
        // Category options
  const categories = [
    { value: "", label: "Select Category" },
    { value: "party wears", label: "PARTY WEARS" },
    { value: "semi party wear", label: "SEMI-PARTY WEARS" },
    { value: "co-ord sets", label: "CO-ORD SETS" },
    { value: "indo-western outfits", label: "INDO-WESTERN OUTFITS" },
    { value: "kurta", label: "KURTA" },
    { value: "saree", label: "SAREE" },
   
  ];
      
  const [formData, setFormData] = useState({
    sku: "",
    brand: "",
    weight: "",
    productName: "",
    category: "",
    deliveryTime: "",
    shortDescription: "",
    productDescription: "",
    careInstructions: "",
    stockQuantity: 0,
    price: 0,
    discount: 0,
    colorVariants: [""],
    material: [""],
    sizeVariantIndia: [], // Changed from nested to separate array
    sizeVariantPakistan: [], // Changed from nested to separate array
    images: [],
    // Fashion-specific fields
    neck: "",
    topDesignStyling: "",
    topFabric: "",
    bottomFabric: "",
    dupattaFabric: "",
    weavePattern: "",
    stitch: "",
    printOrPattern: "",
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

 
  //fetch data of product

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data.data;
       
        

        // Ensure all fields are set, including nested and array fields
        setFormData({
          sku: product.sku || "",
          brand: product.brand || "",
          weight: product.weight || "",
          productName: product.productName || "",
          category: product.category || "",
          deliveryTime: product.deliveryTime || "",
          shortDescription: product.shortDescription || "",
          productDescription: product.productDescription || "",
          careInstructions: product.careInstructions || "",
          stockQuantity: product.stockQuantity || 0,
          price: product.price || 0,
          discount: product.discount || 0,
          colorVariants: Array.isArray(product.colorVariants) ? product.colorVariants : [""],
          material: Array.isArray(product.material) ? product.material : [""],
          // Handle both old nested format and new separate arrays
          sizeVariantIndia: product.sizeVariantIndia 
            ? (Array.isArray(product.sizeVariantIndia) ? product.sizeVariantIndia : [])
            : (Array.isArray(product.sizeVariants?.indian) ? product.sizeVariants.indian : []),
          sizeVariantPakistan: product.sizeVariantPakistan 
            ? (Array.isArray(product.sizeVariantPakistan) ? product.sizeVariantPakistan : [])
            : (Array.isArray(product.sizeVariants?.pakistan) ? product.sizeVariants.pakistan : []),
          images: product.images || [], // Keep as array for FormData submission
          neck: product.neck || "",
          topDesignStyling: product.topDesignStyling || "",
          topFabric: product.topFabric || "",
          bottomFabric: product.bottomFabric || "",
          dupattaFabric: product.dupattaFabric || "",
          weavePattern: product.weavePattern || "",
          stitch: product.stitch || "",
          printOrPattern: product.printOrPattern || "",
        });

        // Set preview images (assuming product.images contains URLs)
        setPreviewImages(product.images || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        setMessage("❌ Failed to fetch product data. Please try again.");
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["colorVariants", "material"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value.split(",") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Updated handleSizeChange function to work with separate arrays
  const handleSizeChange = (region, size) => {
    const arrayName = region === "india" ? "sizeVariantIndia" : "sizeVariantPakistan";
    
    setFormData((prev) => {
      const currentSizes = [...prev[arrayName]];
      let updatedSizes;
      
      if (currentSizes.includes(size)) {
        // Remove the size if it's already selected
        updatedSizes = currentSizes.filter((s) => s !== size);
      } else {
        // Add the size if it's not selected
        updatedSizes = [...currentSizes, size];
      }

      return {
        ...prev,
        [arrayName]: updatedSizes,
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create new preview URLs for the new files
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    
    setFormData((prev) => {
      // Check if previous images exist
      const existingImages = prev.images || [];
      const hasExistingImages = existingImages.length > 0;
      
      if (hasExistingImages) {
        // Append new images to existing ones
        return {
          ...prev,
          images: [...existingImages, ...files]
        };
      } else {
        // No existing images, set new images
        // Clean up any existing preview URLs first
        previewImages.forEach(preview => {
          if (typeof preview === 'string' && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });
        
        return {
          ...prev,
          images: files
        };
      }
    });
    
    setPreviewImages((prev) => {
      // Check if previous preview images exist
      const hasExistingPreviews = prev.length > 0;
      
      if (hasExistingPreviews) {
        // Append new previews to existing ones
        return [...prev, ...newPreviews];
      } else {
        // No existing previews, set new previews
        return newPreviews;
      }
    });
  };
  
  const handleRemoveImage = (indexToRemove) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("❌ No token found. Please log in.");
      return;
    }

    try {
      const form = new FormData();

      for (const key in formData) {
        if (key === "images") {
          formData.images.forEach((file) => form.append("images", file));
        } else if (key === "sizeVariantIndia") {
          // Handle separate size arrays
          form.append("sizeVariantsIndia", formData.sizeVariantIndia.join(","));
                  } else if (key === "sizeVariantPakistan") {
          // Handle separate size arrays
          form.append("sizeVariantsPakistan", formData.sizeVariantPakistan.join(","));
        } else if (Array.isArray(formData[key])) {
          form.append(key, formData[key].join(","));
        } else {
          form.append(key, formData[key]);
        }
      }

      const response = await fetch(`${BASE_URL}products/edit/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("✅ Product Updated successfully!");
        setFormData({
          sku: "",
          brand: "",
          weight: "",
          productName: "",
          category: "",
          deliveryTime: "",
          shortDescription: "",
          productDescription: "",
          careInstructions: "",
          stockQuantity: 0,
          price: 0,
          discount: 0,
          colorVariants: [""],
          material: [""],
          sizeVariantIndia: [], // Updated reset values
          sizeVariantPakistan: [], // Updated reset values
          images: [],
          neck: "",
          topDesignStyling: "",
          topFabric: "",
          bottomFabric: "",
          dupattaFabric: "",
          weavePattern: "",
          stitch: "",
          printOrPattern: "",
        });
        setPreviewImages([]);
        // Navigate to /products
        navigate("/products");
      } else {
        throw new Error(result.message || "API error");
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }
  };

  const indianSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
  const pakistanSizes = ["36", "38", "40", "42", "44", "46"];

  const fashionFields = [
    { name: "neck", label: "Neck" },
    { name: "topDesignStyling", label: "Top Design Styling" },
    { name: "topFabric", label: "Top Fabric" },
    { name: "bottomFabric", label: "Bottom Fabric" },
    { name: "dupattaFabric", label: "Dupatta Fabric" },
    { name: "weavePattern", label: "Weave Pattern" },
    { name: "stitch", label: "Stitch" },
    { name: "printOrPattern", label: "Print or Pattern" },
  ];

  const basicFields = [
    { name: "sku", label: "SKU", icon: "🏷️" },
    { name: "brand", label: "Brand", icon: "🏢" },
    { name: "weight", label: "Weight (g)", icon: "⚖️" },
    { name: "productName", label: "Product Name", icon: "📦" },
    { name: "category", label: "Category", icon: "📂" },
    { name: "deliveryTime", label: "Delivery Time", icon: "🚚" },
  ];

  const descriptionFields = [
    { name: "shortDescription", label: "Short Description", icon: "📝" },
    { name: "productDescription", label: "Product Description", icon: "📄" },
    { name: "careInstructions", label: "Care Instructions", icon: "🧴" },
  ];

  const pricingFields = [
    { name: "stockQuantity", label: "Stock Quantity", type: "number", icon: "📊" },
    { name: "price", label: "Price", type: "number", icon: "💰" },
    { name: "discount", label: "Discount (%)", type: "number", icon: "🏷️" },
  ];

  return (
    <div className="h-screen overflow-auto bg-gray-900 p-4">
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-white to-blue-900 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent mb-4">
            Edit Product
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Update and manage your product inventory with our comprehensive form
          </p>
        </div>

        {/* Main Form Container */}
        <div className=" backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700 p-6 sm:p-8 lg:p-12 ">
          <div className="space-y-12">
            
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {basicFields.map(({ name, label, icon, type = "text" }) => (
                  <div key={name} className="group">
                    <label className="flex items-center space-x-2 mb-3 text-sm font-medium text-gray-300">
                      <span>{icon}</span>
                      <span>{label}</span>
                      {(name === "productName" || name === "price") && <span className="text-red-400">*</span>}
                    </label>
                    
                    {/* Special handling for category field */}
                    {name === "category" ? (
                      <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10 appearance-none cursor-pointer"
                        required
                      >
                        {categories.map((category) => (
                          <option 
                            key={category.value} 
                            value={category.value}
                            className="bg-gray-800 text-white"
                          >
                            {category.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                        placeholder={`Enter ${label.toLowerCase()}`}
                        required={name === "productName" || name === "price"}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Product Descriptions</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {descriptionFields.map(({ name, label, icon }) => (
                  <div key={name} className="group">
                    <label className="flex items-center space-x-2 mb-3 text-sm font-medium text-gray-300">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </label>
                    <textarea
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10 resize-none"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Stock Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Pricing & Stock</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {pricingFields.map(({ name, label, type, icon }) => (
                  <div key={name} className="group">
                    <label className="flex items-center space-x-2 mb-3 text-sm font-medium text-gray-300">
                      <span>{icon}</span>
                      <span>{label}</span>
                      {name === "price" && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                      placeholder={`Enter ${label.toLowerCase()}`}
                      required={name === "price"}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Product Variants</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {["colorVariants", "material"].map((field) => (
                  <div key={field} className="group">
                    <label className="flex items-center space-x-2 mb-3 text-sm font-medium text-gray-300">
                      <span>{field === "colorVariants" ? "🎨" : "🧵"}</span>
                      <span>{field === "colorVariants" ? "Color Variants" : "Materials"}</span>
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field].join(",")}
                      onChange={handleChange}
                      placeholder="Enter comma-separated values (e.g., Red, Blue, Green)"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                    />
                  </div>
                ))}
              </div>

              {/* Size Variants - Updated to work with separate arrays */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-white mb-4">
                    <span>🇮🇳</span>
                    <span>Indian Sizes</span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {indianSizes.map((size) => (
                      <label key={size} className="flex items-center justify-center space-x-2 bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/50">
                        <input
                          type="checkbox"
                          checked={formData.sizeVariantIndia.includes(size)}
                          onChange={() => handleSizeChange("india", size)}
                          className="sr-only"
                        />
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          formData.sizeVariantIndia.includes(size) 
                            ? 'text-purple-400' 
                            : 'text-gray-300'
                        }`}>
                          {size}
                        </span>
                        {formData.sizeVariantIndia.includes(size) && (
                          <span className="text-purple-400">✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-white mb-4">
                    <span>🇵🇰</span>
                    <span>Pakistan Sizes</span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {pakistanSizes.map((size) => (
                      <label key={size} className="flex items-center justify-center space-x-2 bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/50">
                        <input
                          type="checkbox"
                          checked={formData.sizeVariantPakistan.includes(size)}
                          onChange={() => handleSizeChange("pakistan", size)}
                          className="sr-only"
                        />
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          formData.sizeVariantPakistan.includes(size) 
                            ? 'text-purple-400' 
                            : 'text-gray-300'
                        }`}>
                          {size}
                        </span>
                        {formData.sizeVariantPakistan.includes(size) && (
                          <span className="text-purple-400">✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fashion Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">5</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Fashion Details</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {fashionFields.map(({ name, label }) => (
                  <div key={name} className="group">
                    <label className="flex items-center space-x-2 mb-3 text-sm font-medium text-gray-300">
                      <span>👗</span>
                      <span>{label}</span>
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">6</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Product Images</h2>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 border-dashed">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-lg font-medium text-white mb-2 block">Upload Product Images</span>
                    <span className="text-gray-400 mb-4 block">Choose multiple images to showcase your product</span>
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    <span className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-xl hover:from-purple-600 hover:to-purple-600 transition-all duration-300">
                      Select Images
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {previewImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <span>🖼️</span>
                    <span>Image Preview</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {previewImages.map((src, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={src.includes("blob:") ? src : `https://backend.pinkstories.ae${src.replace('/src', '')}`}
                        alt={`preview-${index}`}
                        className="w-full h-32 object-cover rounded-xl border border-white/20 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="text-red-400 bg-white/10 px-3 py-1 rounded-lg hover:bg-red-600 hover:text-white transition duration-200 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-white border border-black text-black font-bold py-4 px-8 rounded-[10px] text-lg shadow-2xl hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                <span className="flex items-center justify-center space-x-2">
                  
                  <span>Update Product to Inventory</span>
               
                </span>
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="mt-8 p-6 rounded-2xl backdrop-blur-sm border border-white/20 text-center">
              <p className={`text-lg font-semibold ${
                message.startsWith("✅") 
                  ? "text-green-400 bg-green-500/10" 
                  : "text-red-400 bg-red-500/10"
              } p-4 rounded-xl`}>
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditProductForm;




