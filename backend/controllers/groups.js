const Group = require("../models/group");
const User = require("../models/user");
const Chat = require("../models/chat");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const File = require("../models/file");

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     acl: "public-read",
//     key: function (req, file, cb) {
//       cb(null, `uploads/${Date.now()}_${file.originalname}`);
//     },
//   }),
// });

exports.postGroup = async (req, res) => {
  const { groupName, users } = req.body;
  const currentUserId = req.user.id;

  try {
    const group = await Group.create({ groupname: groupName });

    // Find user instances based on provided usernames
    let userInstances = await User.findAll({
      where: {
        username: users,
      },
    });

    // Add the current user as the group admin and member
    const currentUser = await User.findByPk(currentUserId);
    userInstances.push(currentUser);

    // Add users to the group as members
    await group.setMembers(userInstances);

    // Add the current user as an admin
    await group.addAdmins(currentUser);

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getGroups = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: "Members",
          through: { attributes: [] },
          attributes: ["id", "username"],
          where: { id: currentUserId },
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Groups retrieved successfully",
      groups,
    });
  } catch (error) {
    console.error("Error retrieving groups:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getChatsForGroup = async (req, res) => {
  const currentUserId = req.user.id;
  const { groupId } = req.params;

  try {
    const group = await Group.findOne({
      where: { id: groupId },
      include: [
        {
          model: User,
          as: "Members",
          attributes: ["id"],
          through: { attributes: [] },
          where: { id: currentUserId },
        },
        {
          model: User,
          as: "Admins",
          attributes: ["id", "username"],
          through: { attributes: [] },
        },
      ],
    });

    if (!group) {
      return res
        .status(404)
        .json({ message: "Group not found or user not a member" });
    }

    const chats = await Chat.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["username"] }],
      order: [["createdAt", "ASC"]],
    });

    const groupDetails = {
      name: group.groupname,
      members: group.Members || [],
      admins: group.Admins || [],
      isAdmin: (group.Admins || []).some((admin) => admin.id === currentUserId),
    };

    res.json({ chats, groupDetails });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addUserToGroup = async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  console.log("kkkkkkkkkkk", userId);

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await group.addMembers(user);

    res.status(200).json({ message: "User added successfully" });
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.makeUserAdmin = async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await group.addAdmins(user);

    res.status(200).json({ message: "User made admin successfully" });
  } catch (error) {
    console.error("Error making user admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeUserFromGroup = async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  console.log("aaaaaaaaa", userId);

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await group.removeMembers(user);

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: "Members",
          attributes: ["id", "username", "email", "phno"],
        },
        {
          model: User,
          as: "Admins",
          attributes: ["id", "username", "email", "phno"],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupDetails = {
      name: group.groupname,
      members: group.Members,
      admins: group.Admins,
    };

    res.json(groupDetails);
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = req.file.location;
    const fileName = req.file.originalname;
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    // Save file URL to the database associated with the group
    const file = await File.create({ url: fileUrl, groupId });

    const chat = await Chat.create({
      groupId,
      userId: currentUserId,
      message: `File uploaded: ${fileName}-${fileUrl}`,
    });

    res
      .status(201)
      .json({ success: true, file: { url: fileUrl, filename: fileName } });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
