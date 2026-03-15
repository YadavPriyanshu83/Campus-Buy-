import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  setProducts,
  setLoading,
  setError,
  setCurrentPage,
  addProduct,
  updateProduct,
  removeProduct,
  addNotification,
} from "../utils/appSlice";
import HomeHeader from "../Component/HomeHeader";
import { useAuth, getAuthToken } from "../utils/authUtils";

// Initialize socket connection
const socket = io("http://localhost:5000");

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((store) => store.app);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentProductImages, setCurrentProductImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productToDelete, setProductToDelete] = useState(null);
  const { isAuthenticated, user, token } = useAuth();

  // Filter states
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceSort, setPriceSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "All",
    "Electronics",
    "Furniture",
    "Books",
    "Fashion",
    "Vehicles",
  ];

  // Function to show delete confirmation dialog
  const showDeleteConfirmation = (product) => {
    console.log("Product to delete:", product);
    console.log("Product ID:", product._id);
    setProductToDelete(product);
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setProductToDelete(null);
  };

  // Filter products based on selected criteria
  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price sorting
    if (priceSort === "low-to-high") {
      filtered = filtered.sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
    } else if (priceSort === "high-to-low") {
      filtered = filtered.sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price)
      );
    }

    setFilteredProducts(filtered);
  };

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, priceSort]);

  // Handle filter changes
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handlePriceSort = (sortOrder) => {
    setPriceSort(sortOrder);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceSort("");
  };

  // Function to handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete || !isAuthenticated || !token) {
      dispatch(
        addNotification({
          type: "error",
          message: "You must be logged in to delete a product",
        })
      );
      return;
    }

    try {
      // Ensure we have a valid product ID
      if (!productToDelete._id || typeof productToDelete._id !== "string") {
        console.error("Invalid product ID:", productToDelete._id);
        dispatch(
          addNotification({
            type: "error",
            message: "Invalid product ID",
          })
        );
        setProductToDelete(null);
        return;
      }

      // Add network error handling with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const productId = productToDelete._id.trim();
      console.log("Deleting product:", productId);
      console.log("Product object:", JSON.stringify(productToDelete));
      console.log("Using token:", token.substring(0, 10) + "...");

      // Try using the API_BASE_URL constant instead of hardcoded URL
      const apiUrl = "http://localhost:5000/api/product/" + productId;
      console.log("API URL:", apiUrl);

      dispatch(
        addNotification({
          type: "info",
          message: "Attempting to delete product...",
        })
      );

      // Get the latest token
      const currentToken = getAuthToken();

      if (!currentToken) {
        dispatch(
          addNotification({
            type: "error",
            message: "Authentication token not found. Please log in again.",
          })
        );
        setProductToDelete(null);
        return;
      }

      console.log(
        "Using token for delete:",
        currentToken.substring(0, 10) + "..."
      );

      // Log the full request details for debugging
      console.log("Making DELETE request to:", apiUrl);
      console.log("With headers:", {
        Authorization: `Bearer ${currentToken.substring(0, 10)}...`,
        "Content-Type": "application/json",
      });

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors", // Explicitly set CORS mode
        cache: "no-cache", // Prevent caching issues
        signal: controller.signal, // Add abort controller signal
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers])
      );

      // Try to get the response text first to see what's being returned
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Handle different response statuses
      if (response.status === 401) {
        console.error("Authentication error: Token may be expired");
        dispatch(
          addNotification({
            type: "error",
            message: "Your session has expired. Please log in again.",
          })
        );
        setProductToDelete(null);
        return;
      } else if (response.status === 403) {
        console.error(
          "Authorization error: Not allowed to delete this product"
        );
        dispatch(
          addNotification({
            type: "error",
            message: "You don't have permission to delete this product",
          })
        );
        setProductToDelete(null);
        return;
      } else if (response.status === 404) {
        console.error("Product not found");
        dispatch(
          addNotification({
            type: "error",
            message: "Product not found or already deleted",
          })
        );
        setProductToDelete(null);
        return;
      } else if (!response.ok) {
        let errorMessage = "Failed to delete product";
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, use the text directly
          errorMessage = responseText || errorMessage;
        }
        console.error("Delete error details:", {
          status: response.status,
          text: responseText,
        });
        throw new Error(errorMessage);
      }

      // Clear the timeout since request completed successfully
      if (timeoutId) clearTimeout(timeoutId);

      // Product deleted successfully
      console.log("Product deleted successfully");
      dispatch(
        addNotification({
          type: "success",
          message: "Product deleted successfully",
        })
      );

      // Remove product from Redux store
      dispatch(removeProduct(productId));

      // Emit socket event for real-time updates
      socket.emit("delete_product", productId);

      // Close the confirmation dialog
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);

      // Clear the timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);

      // Handle specific network errors
      if (error.name === "AbortError") {
        dispatch(
          addNotification({
            type: "error",
            message:
              "Request timed out. Please check your internet connection and try again.",
          })
        );
      } else if (error.message === "Failed to fetch") {
        dispatch(
          addNotification({
            type: "error",
            message:
              "Network error. Please check your internet connection and try again.",
          })
        );
      } else {
        dispatch(
          addNotification({
            type: "error",
            message: error.message || "Failed to delete product",
          })
        );
      }

      // Close the confirmation dialog even on error
      setProductToDelete(null);
    }
  };

  // We're now importing getAuthToken directly from authUtils

  // Handle keyboard navigation for image preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();

        const totalImages = currentProductImages.length;
        if (totalImages <= 1) return;

        let newIndex = currentImageIndex;
        if (e.key === "ArrowRight") {
          newIndex = (currentImageIndex + 1) % totalImages;
        } else if (e.key === "ArrowLeft") {
          newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        }

        setCurrentImageIndex(newIndex);
        setSelectedImage(currentProductImages[newIndex]);
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentProductImages, currentImageIndex]);

  useEffect(() => {
    dispatch(setCurrentPage("home"));
    dispatch(setLoading(true));

    // Fetch initial products
    fetch("http://localhost:5000/api/product/all", {
      signal: AbortSignal.timeout(5000),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const limitedProducts = data.slice(0, 20);
        dispatch(setProducts(limitedProducts));
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        dispatch(setError("Failed to fetch products"));
      })
      .finally(() => dispatch(setLoading(false)));

    // Listen for real-time product updates
    socket.on("new_product", (product) => {
      dispatch(addProduct(product));
    });

    socket.on("update_product", (product) => {
      dispatch(updateProduct(product));
    });

    socket.on("delete_product", (productId) => {
      dispatch(removeProduct(productId));
    });

    return () => {
      socket.off("new_product");
      socket.off("update_product");
      socket.off("delete_product");
    };
  }, [dispatch]);

  return (
    <>
    <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] h-full">
      <HomeHeader />
      {/* Fullscreen Image Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.stopPropagation();
                e.preventDefault();

                const totalImages = currentProductImages.length;
                if (totalImages <= 1) return;

                let newIndex = currentImageIndex;
                if (e.key === "ArrowRight") {
                  newIndex = (currentImageIndex + 1) % totalImages;
                } else if (e.key === "ArrowLeft") {
                  newIndex =
                    (currentImageIndex - 1 + totalImages) % totalImages;
                }

                setCurrentImageIndex(newIndex);
                setSelectedImage(currentProductImages[newIndex]);
              } else if (e.key === "Escape") {
                setSelectedImage(null);
              }
            }}
            tabIndex={0}
          >
            {/* Left Arrow Navigation */}
            {currentProductImages.length > 1 && (
              <button
                className="absolute left-4 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-2 text-black text-2xl z-10 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  const totalImages = currentProductImages.length;
                  const newIndex =
                    (currentImageIndex - 1 + totalImages) % totalImages;
                  setCurrentImageIndex(newIndex);
                  setSelectedImage(currentProductImages[newIndex]);
                }}
              >
                ←
              </button>
            )}

            <motion.img
              src={selectedImage}
              alt="preview"
              className="max-w-[90vw] max-h-[90vh] rounded-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Right Arrow Navigation */}
            {currentProductImages.length > 1 && (
              <button
                className="absolute right-4 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-2 text-black text-2xl z-10 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  const totalImages = currentProductImages.length;
                  const newIndex = (currentImageIndex + 1) % totalImages;
                  setCurrentImageIndex(newIndex);
                  setSelectedImage(currentProductImages[newIndex]);
                }}
              >
                →
              </button>
            )}

            {/* Image Counter */}
            {currentProductImages.length > 1 && (
              <div className="absolute bottom-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {currentProductImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List */}
      <motion.div
        className="min-h-screen px-3 sm:px-4 py-4 pb-20 sm:pb-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        
        {/* main header is here */}
        <motion.div
          className="flex items-center justify-center gap-1 sm:gap-3"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{
            scale: [0.95, 1.02, 1],
            opacity: 1,
            y: [0, -4, 0],
          }}
          transition={{
            scale: { duration: 0.4 },
            y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
            opacity: { duration: 0.4 },
          }}
        >

          <motion.h1
            className="font-bold text-blue-900 tracking-wide p-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🛍️ MMMUT Buy & Sell
          </motion.h1>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          className="max-w-6xl mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-md border border-gray-200"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">
                Category:
              </span>
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category ||
                    (category === "All" && !selectedCategory)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {/* Price Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <select
                value={priceSort}
                onChange={(e) => handlePriceSort(e.target.value)}
                className="px-3 py-1 rounded-full text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Default</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || priceSort) && (
              <motion.button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-xs sm:text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {useSelector((store) => store.app.loading) && (
            <motion.div
              className="flex justify-center items-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {useSelector((store) => store.app.error) && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <span className="block sm:inline">
                {useSelector((store) => store.app.error)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product._id || index}
              className="bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden flex flex-col"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 32px rgba(60,60,180,0.12)",
              }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              {/* New Label for recently added products */}
              {new Date(product.createdAt).getTime() >
                Date.now() - 86400000 && (
                <motion.div
                  className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow font-bold px-3 py-1 rounded-bl-lg z-10"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  NEW
                </motion.div>
              )}

              {/* Product Images */}
              {product.images?.length > 0 ? (
                <motion.div
                  className="relative h-36 sm:h-40 md:h-48 mb-2 sm:mb-3 overflow-hidden rounded-lg bg-gray-100"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(product.images[0]);
                      setCurrentProductImages(product.images);
                      setCurrentImageIndex(0);
                    }}
                    loading="lazy"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                  />
                  {product.images.length > 1 && (
                    <motion.div
                      className="absolute bottom-2 right-2 flex space-x-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {product.images.slice(1, 4).map((img, i) => (
                        <motion.div
                          key={i}
                          className="w-8 h-8 rounded-md overflow-hidden border border-white cursor-pointer hover:opacity-80"
                          whileHover={{ scale: 1.1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(img);
                            setCurrentProductImages(product.images);
                            setCurrentImageIndex(i + 1); // +1 because these are images starting from index 1
                          }}
                        >
                          <img
                            src={img}
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                      {product.images.length > 4 && (
                        <motion.div
                          className="w-8 h-8 rounded-md bg-black bg-opacity-60 flex items-center justify-center text-white text-xs border border-white"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                        >
                          +{product.images.length - 4}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="h-36 sm:h-40 md:h-48 mb-2 sm:mb-3 bg-gray-100 rounded-lg flex items-center justify-center"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-gray-400">No image</span>
                </motion.div>
              )}

              {/* Product Info */}
              <motion.div
                className="flex-grow"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start mb-1">
                  <motion.h2
                    className="font-semibold text-indigo-700 text-base sm:text-lg line-clamp-1"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.title}
                  </motion.h2>
                  <motion.span
                    className="bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded capitalize"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.category || "Other"}
                  </motion.span>
                </div>

                <motion.p
                  className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {product.description}
                </motion.p>

                <div className="mt-auto pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <motion.p
                      className="text-green-600 font-medium text-base sm:text-lg"
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ₹{product.price}
                      {product.negotiable && (
                        <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                          (Negotiable)
                        </span>
                      )}
                    </motion.p>
                    <motion.p
                      className="text-[10px] sm:text-xs text-gray-400"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {new Date(product.createdAt).toLocaleDateString()}
                    </motion.p>
                  </div>

                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                    <div className="flex items-center gap-2">
                      {/* Seller Display Picture */}
                      <img
                        src={
                          product.user?.profileImage ||
                          "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                        }
                        alt={product.user?.name || "Seller"}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                      />
                      <div>
                        <motion.div
                          className="text-[10px] sm:text-xs font-medium text-gray-700"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {product.user?.name || "Unknown Seller"}
                        </motion.div>
                        <motion.div
                          className="text-[9px] sm:text-[10px] text-gray-500"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {product.user?.branch || "Branch not specified"}
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        className="text-indigo-600 text-[10px] sm:text-xs hover:underline font-medium"
                        whileHover={{ scale: 1.05, color: "#4338ca" }}
                        onClick={() => {
                          const whatsappNumber = product.user?.whatsapp;
                          if (whatsappNumber) {
                            // Remove any non-numeric characters and ensure it starts with country code
                            const cleanNumber = whatsappNumber.replace(
                              /[^0-9]/g,
                              ""
                            );
                            const message = encodeURIComponent(
                              `Hi! I'm interested in your product: ${product.title}`
                            );
                            window.open(
                              `https://wa.me/${cleanNumber}?text=${message}`,
                              "_blank"
                            );
                          } else {
                            alert(
                              "Seller has not provided WhatsApp contact information"
                            );
                          }
                        }}
                      >
                        Contact
                      </motion.button>

                      {/* Delete button - only visible to the product owner */}
                      {isAuthenticated &&
                        user &&
                        product.user &&
                        user._id === product.user._id && (
                          <motion.button
                            className="text-red-600 text-[10px] sm:text-xs hover:underline font-medium"
                            whileHover={{ scale: 1.05, color: "#dc2626" }}
                            onClick={() => showDeleteConfirmation(product)}
                          >
                            Delete
                          </motion.button>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!useSelector((store) => store.app.loading) &&
          products.length === 0 && (
            <motion.div
              className="text-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-gray-500">
                No products available at the moment.
              </p>
            </motion.div>
          )}
      </motion.div>

      {/* Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this product?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteProduct}
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      )}
      </section>
    </>
  );
}

export default Home;
