import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../Presentation/Middlewares/auth";
import {
  initializeSessionController,
  getSessionStatusController,
  disconnectSessionController,
  listSessionsController,
  deleteSessionController,
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
  toggleContactFlagController,
  listIgnoredContactsController,
} from "../../Dependencies/WhatsApp/composition";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
});

export const whatsappRouter = Router();

whatsappRouter.use(authMiddleware);

// Session management (multi-session)
whatsappRouter.post("/sessions", initializeSessionController.handle);
whatsappRouter.get("/sessions", listSessionsController.handle);
whatsappRouter.get("/sessions/:sessionId/status", getSessionStatusController.handle);
whatsappRouter.post("/sessions/:sessionId/disconnect", disconnectSessionController.handle);
whatsappRouter.delete("/sessions/:sessionId", deleteSessionController.handle);

// Contacts
whatsappRouter.get("/contacts", listContactsController.handle);
whatsappRouter.get("/contacts/ignored", listIgnoredContactsController.handle);
whatsappRouter.post("/contacts/refresh-all-pics", refreshAllProfilePicsController.handle);
whatsappRouter.post("/contacts/convert-to-lead", convertContactToLeadController.handle);
whatsappRouter.patch("/contacts/:contactId/flag", toggleContactFlagController.handle);
whatsappRouter.patch("/contacts/:contactId/name", updateContactNameController.handle);
whatsappRouter.delete("/contacts/:contactId", deleteContactController.handle);
whatsappRouter.post("/contacts/:contactId/refresh-pic", refreshProfilePicController.handle);

// Messages
whatsappRouter.get("/messages/:contactId", listMessagesController.handle);
whatsappRouter.post("/messages/send", sendMessageController.handle);
whatsappRouter.post("/messages/send-media", upload.single("file"), sendMediaMessageController.handle);
whatsappRouter.patch("/messages/:messageId", editMessageController.handle);
whatsappRouter.delete("/messages/:messageId", deleteMessageController.handle);
