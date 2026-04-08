import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import {
  initializeSessionController,
  getSessionStatusController,
  disconnectSessionController,
  sendMessageController,
  sendMediaMessageController,
  editMessageController,
  deleteMessageController,
  listMessagesController,
  listContactsController,
  convertContactToLeadController,
  deleteContactController,
  updateContactNameController,
  refreshProfilePicController,
  refreshAllProfilePicsController,
} from "../../Dependencies/WhatsApp/composition";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
});

export const whatsappRouter = Router();

whatsappRouter.use(authMiddleware);

whatsappRouter.post("/sessions/init", initializeSessionController.handle);
whatsappRouter.get("/sessions/status", getSessionStatusController.handle);
whatsappRouter.post("/sessions/disconnect", disconnectSessionController.handle);
whatsappRouter.get("/contacts", listContactsController.handle);
whatsappRouter.patch("/contacts/:contactId/name", updateContactNameController.handle);
whatsappRouter.delete("/contacts/:contactId", deleteContactController.handle);
whatsappRouter.post("/contacts/:contactId/refresh-pic", refreshProfilePicController.handle);
whatsappRouter.post("/contacts/refresh-all-pics", refreshAllProfilePicsController.handle);
whatsappRouter.get("/messages/:contactId", listMessagesController.handle);
whatsappRouter.post("/messages/send", sendMessageController.handle);
whatsappRouter.post("/messages/send-media", upload.single("file"), sendMediaMessageController.handle);
whatsappRouter.patch("/messages/:messageId", editMessageController.handle);
whatsappRouter.delete("/messages/:messageId", deleteMessageController.handle);
whatsappRouter.post("/contacts/convert-to-lead", convertContactToLeadController.handle);
