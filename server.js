const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("YOUR_MONGODB_ATLAS_URI")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const MessageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const Message = mongoose.model("Message", MessageSchema);

// Route
app.post("/contact", async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();

        res.json({ message: "Message saved successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error saving message" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
