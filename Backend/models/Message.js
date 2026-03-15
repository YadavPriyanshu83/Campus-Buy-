const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, default: "Anonymous" },
  senderImage: { type: String, default: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" },
  whatsappNumber: { type: String, default: "" },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
