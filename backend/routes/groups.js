let express = require("express");
let router = express.Router();
let groupController = require("../controllers/groups");
let authenticate = require("../middleware/auth");

router.get("/", authenticate.authenticate, groupController.getGroups);

router.post("/", authenticate.authenticate, groupController.postGroup);

router.get(
  "/:groupId/chats",
  authenticate.authenticate,
  groupController.getChatsForGroup
);

router.post(
  "/:groupId/adduser",
  authenticate.authenticate,
  groupController.addUserToGroup
);

router.post(
  "/:groupId/makeadmin",
  authenticate.authenticate,
  groupController.makeUserAdmin
);

router.post(
  "/:groupId/removeuser",
  authenticate.authenticate,
  groupController.removeUserFromGroup
);

router.get(
  "/:groupId/details",
  authenticate.authenticate,
  groupController.getGroupDetails
);

module.exports = router;
