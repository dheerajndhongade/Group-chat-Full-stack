const User = require("../models/user");
const Chat = require("../models/chat");

exports.getChats = async (req, res, next) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "ASC"]], // Order by creation time
    });

    // Respond with the list of chat messages
    res.status(200).json({ chats, message: "Chats retrieved successfully" });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Failed to retrieve chats" });
  }
};

exports.postChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    const newMessage = await req.user.createChat({ message });
    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
