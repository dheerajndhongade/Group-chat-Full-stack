const Group = require("../models/group");
const User = require("../models/user");
const Chat = require("../models/chat");

exports.postChat = async (req, res) => {
  const { groupId } = req.params;
  const { message } = req.body;
  const currentUserId = req.user.id;

  try {
    // Verify that the user is a member of the group
    const group = await Group.findByPk(groupId, {
      include: {
        model: User,
        as: "Members", // Specify the alias for the association
        attributes: [],
        where: { id: currentUserId },
        through: { attributes: [] },
      },
    });

    if (!group) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Create the chat message
    const chat = await Chat.create({
      groupId,
      userId: currentUserId,
      message,
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error("Error posting chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
