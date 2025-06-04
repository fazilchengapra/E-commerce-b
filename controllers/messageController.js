const Message = require("../model/Message");

// 📩 Create a new complaint message
exports.createMessage = async (req, res) => {
  try {
    const { subject, content } = req.body;
    const user = req.userId;

    const message = await Message.create({ user, subject, content });
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔍 Get logged-in user's messages
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✏️ Update a message by the user (if not replied yet)
exports.updateMyMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (message.replied) {
      return res.status(403).json({
        success: false,
        message: "You can't update a replied message",
      });
    }

    const { subject, content } = req.body;

    message.subject = subject || message.subject;
    message.content = content || message.content;

    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📥 Get all messages (admin)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Mark as Read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 💬 Reply to message
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { reply, replied: true },
      { new: true }
    );
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🗑️ Admin deletes a message
exports.deleteMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    await message.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🗑️ Bulk delete messages by ID array (Admin only)
exports.bulkDeleteMessages = async (req, res) => {
  try {
    const { ids } = req.body; // Array of message IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    const result = await Message.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} message(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
