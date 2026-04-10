import { DrizzleWhatsAppSessionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleWhatsAppSessionRepository";
import { DrizzleContactRepository } from "../../../Infrastructure/Database/Repositories/DrizzleContactRepository";
import { DrizzleMessageRepository } from "../../../Infrastructure/Database/Repositories/DrizzleMessageRepository";
import { SendMessageByPhone } from "../../../Application/Modules/WhatsApp/UseCases/SendMessageByPhone";
import { ListContacts } from "../../../Application/Modules/WhatsApp/UseCases/ListContacts";
import { ListMessages } from "../../../Application/Modules/WhatsApp/UseCases/ListMessages";
import { ListSessions } from "../../../Application/Modules/WhatsApp/UseCases/ListSessions";
import { GetSessionStatus } from "../../../Application/Modules/WhatsApp/UseCases/GetSessionStatus";
import { baileysGateway } from "../WhatsApp/composition";

const sessionRepository = new DrizzleWhatsAppSessionRepository();
const contactRepository = new DrizzleContactRepository();
const messageRepository = new DrizzleMessageRepository();

export const sendMessageByPhone = new SendMessageByPhone(
  sessionRepository,
  contactRepository,
  messageRepository,
  baileysGateway
);
export const listContacts = new ListContacts(contactRepository, messageRepository);
export const listMessages = new ListMessages(messageRepository);
export const listSessions = new ListSessions(sessionRepository, baileysGateway);
export const getSessionStatus = new GetSessionStatus(sessionRepository, baileysGateway);
