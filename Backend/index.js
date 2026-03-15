const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { Server } = require("socket.io");
const Message = require("./models/Message");

dotenv.config();

const app = express();        //https:localhost
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
});

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both dev server ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/product", require("./routes/productRoutes"));

// Add this for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API to get all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// API to manually post messages (if needed)
app.post("/api/messages", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// API to delete message (if within 1 hour)
app.delete("/api/messages/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    const deleteTime = req.query.deleteTime || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    const messageTime = new Date(message.timestamp).getTime();

    if (now - messageTime > oneHour) {
      return res.status(403).json({ error: "Cannot delete message after 1 hour" });
    }

    // Store the message temporarily before deleting
    const deletedMessageInfo = {
      id: req.params.id,
      deleteTime: deleteTime
    };

    await message.deleteOne();
    io.emit("delete_message", req.params.id, deletedMessageInfo); // Notify all clients with delete time
    res.json({ message: "Message deleted successfully", deleteTime: deleteTime });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Root API test
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Message events
  socket.on("send_message", async (msg) => {
    try {
      const saved = await Message.create({
        text: msg.text,
        sender: msg.sender || "Anonymous",
        replyTo: msg.replyTo || null,
        senderImage: msg.senderImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
        whatsappNumber: msg.whatsappNumber || "",
        deleteTime: msg.deleteTime
      });
      io.emit("receive_message", saved); // Broadcast to all clients
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });
  
  // Product events
  socket.on("new_product", (product) => {
    console.log("📦 New product received via socket:", product.title);
    io.emit("new_product", product); // Broadcast to all clients
  });
  
  socket.on("update_product", (product) => {
    console.log("🔄 Product update received via socket:", product._id);
    io.emit("update_product", product); // Broadcast to all clients
  });
  
  socket.on("delete_product", (productId) => {
    console.log("🗑️ Product delete received via socket:", productId);
    io.emit("delete_product", productId); // Broadcast to all clients
  });

  socket.on("delete_message", async (id) => {
    try {
      const message = await Message.findById(id);
      if (!message) return;

      const oneHour = 60 * 60 * 1000;
      const now = Date.now();
      const messageTime = new Date(message.timestamp).getTime();

      if (now - messageTime > oneHour) return;

      const deleteTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const deletedMessageInfo = {
        id: id,
        deleteTime: deleteTime
      };

      await message.deleteOne();
      io.emit("delete_message", id, deletedMessageInfo); // Notify all clients with delete time
    } catch (err) {
      console.error("❌ Error deleting message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));