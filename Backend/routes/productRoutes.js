const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/product/all
// Update the population to include profileImage and branch
// Add this to your /all endpoint
// GET all products for logged-in user
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching user products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find()
      .populate('user', 'name email profileImage branch whatsapp')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Update the /api/product/:id endpoint
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('user', 'name email profileImage branch whatsapp');
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// @route   POST /api/product/upload
router.post(
  "/upload",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("➡️ Upload route hit");

      const { title, description, category, condition, price, negotiable } =
        req.body;
      console.log("📦 Body Data:", req.body);
      console.log("🖼️ Files Uploaded:", req.files?.length || 0);

      // Field validation
      if (!title || !description || !category || !condition || !price) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one image is required" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const uploadedImages = [];
      for (const file of req.files) {
        const base64 = Buffer.from(file.buffer).toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "buyandsell_products",
        });

        console.log("✅ Image uploaded:", result.secure_url);
        uploadedImages.push(result.secure_url);
      }

      const newProduct = new Product({
        title,
        description,
        category,
        condition,
        price,
        negotiable: negotiable === "true" || negotiable === "on",
        images: uploadedImages,
        user: req.user._id,
      });

      await newProduct.save();
      console.log("📦 Product saved to DB");

      // No need to emit here as the client will emit the socket event

      res.status(201).json({
        message: "Product uploaded successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      res.status(500).json({ error: "Product upload failed." });
    }
  }
);

// @route   GET /api/product/user
router.get("/user", authMiddleware, async (req, res) => {
  try {
    console.log("GET /api/product/user hit");
    console.log("User ID from auth:", req.user ? req.user._id : 'No user');
    
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log("Found user products:", products.length);
    
    res.json(products);
  } catch (err) {
    console.error("Failed to fetch user products:", err.message);
    res.status(500).json({ error: "Failed to fetch user products" });
  }
});

// @route   GET /api/product/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('user', 'name email profileImage branch');
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// @route   DELETE /api/product/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("\n=== DELETE PRODUCT REQUEST ===\n");
    console.log("DELETE route hit for product ID:", req.params.id);
    console.log("User ID from auth:", req.user ? req.user._id : 'No user');
    console.log("Auth header:", req.headers.authorization ? 'Present' : 'Missing');
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error("Invalid product ID format:", req.params.id);
      return res.status(400).json({ error: "Invalid product ID format" });
    }
    
    const product = await Product.findById(req.params.id);
    console.log("Product found:", product ? "Yes" : "No");
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    console.log("Product user ID:", product.user.toString());
    console.log("Current user ID:", req.user._id.toString());
    
    // Check if the user is the owner of the product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this product" });
    }
    
    await product.deleteOne();
    console.log("Product deleted successfully:", req.params.id);
    
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Failed to delete product:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
