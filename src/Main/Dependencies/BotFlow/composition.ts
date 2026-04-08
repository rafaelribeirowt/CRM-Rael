import { DrizzleBotFlowRepository } from "../../../Infrastructure/Database/Repositories/DrizzleBotFlowRepository";
import { DrizzleBotStepRepository } from "../../../Infrastructure/Database/Repositories/DrizzleBotStepRepository";
import { DrizzleBotStepConditionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleBotStepConditionRepository";
import { DrizzleBotSessionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleBotSessionRepository";
import { DrizzleBotLogRepository } from "../../../Infrastructure/Database/Repositories/DrizzleBotLogRepository";
import { DrizzleLeadRepository } from "../../../Infrastructure/Database/Repositories/DrizzleLeadRepository";
import { DrizzleMessageRepository } from "../../../Infrastructure/Database/Repositories/DrizzleMessageRepository";
import { DrizzleWhatsAppSessionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleWhatsAppSessionRepository";
import { BotEngine } from "../../../Application/Modules/BotFlow/Engine/BotEngine";
import { CreateBotFlow } from "../../../Application/Modules/BotFlow/UseCases/CreateBotFlow";
import { UpdateBotFlow } from "../../../Application/Modules/BotFlow/UseCases/UpdateBotFlow";
import { DeleteBotFlow } from "../../../Application/Modules/BotFlow/UseCases/DeleteBotFlow";
import { ListBotFlows } from "../../../Application/Modules/BotFlow/UseCases/ListBotFlows";
import { GetBotFlowById } from "../../../Application/Modules/BotFlow/UseCases/GetBotFlowById";
import { ToggleBotFlow } from "../../../Application/Modules/BotFlow/UseCases/ToggleBotFlow";
import { AddBotStep } from "../../../Application/Modules/BotFlow/UseCases/AddBotStep";
import { UpdateBotStep } from "../../../Application/Modules/BotFlow/UseCases/UpdateBotStep";
import { DeleteBotStep } from "../../../Application/Modules/BotFlow/UseCases/DeleteBotStep";
import { ReorderBotSteps } from "../../../Application/Modules/BotFlow/UseCases/ReorderBotSteps";
import { SetStepConditions } from "../../../Application/Modules/BotFlow/UseCases/SetStepConditions";
import { CancelBotSession } from "../../../Application/Modules/BotFlow/UseCases/CancelBotSession";
import { SaveCanvas } from "../../../Application/Modules/BotFlow/UseCases/SaveCanvas";
import { CreateBotFlowController } from "../../../Presentation/Controllers/BotFlow/CreateBotFlowController";
import { UpdateBotFlowController } from "../../../Presentation/Controllers/BotFlow/UpdateBotFlowController";
import { DeleteBotFlowController } from "../../../Presentation/Controllers/BotFlow/DeleteBotFlowController";
import { ListBotFlowsController } from "../../../Presentation/Controllers/BotFlow/ListBotFlowsController";
import { GetBotFlowByIdController } from "../../../Presentation/Controllers/BotFlow/GetBotFlowByIdController";
import { ToggleBotFlowController } from "../../../Presentation/Controllers/BotFlow/ToggleBotFlowController";
import { AddBotStepController } from "../../../Presentation/Controllers/BotFlow/AddBotStepController";
import { UpdateBotStepController } from "../../../Presentation/Controllers/BotFlow/UpdateBotStepController";
import { DeleteBotStepController } from "../../../Presentation/Controllers/BotFlow/DeleteBotStepController";
import { ReorderBotStepsController } from "../../../Presentation/Controllers/BotFlow/ReorderBotStepsController";
import { SetStepConditionsController } from "../../../Presentation/Controllers/BotFlow/SetStepConditionsController";
import { CancelBotSessionController } from "../../../Presentation/Controllers/BotFlow/CancelBotSessionController";
import { ListBotSessionsController } from "../../../Presentation/Controllers/BotFlow/ListBotSessionsController";
import { GetBotSessionLogsController } from "../../../Presentation/Controllers/BotFlow/GetBotSessionLogsController";
import { SaveCanvasController } from "../../../Presentation/Controllers/BotFlow/SaveCanvasController";
import { baileysGateway } from "../WhatsApp/composition";

// Repositories
const botFlowRepository = new DrizzleBotFlowRepository();
const botStepRepository = new DrizzleBotStepRepository();
const botStepConditionRepository = new DrizzleBotStepConditionRepository();
const botSessionRepository = new DrizzleBotSessionRepository();
const botLogRepository = new DrizzleBotLogRepository();
const leadRepository = new DrizzleLeadRepository();
const messageRepository = new DrizzleMessageRepository();
const waSessionRepository = new DrizzleWhatsAppSessionRepository();

// Engine
const botEngine = new BotEngine(
  botFlowRepository,
  botStepRepository,
  botStepConditionRepository,
  botSessionRepository,
  botLogRepository,
  leadRepository,
  messageRepository,
  waSessionRepository,
  baileysGateway
);
export { botEngine };

// Use cases
const createBotFlow = new CreateBotFlow(botFlowRepository);
const updateBotFlow = new UpdateBotFlow(botFlowRepository);
const deleteBotFlow = new DeleteBotFlow(botFlowRepository);
const listBotFlows = new ListBotFlows(botFlowRepository);
const getBotFlowById = new GetBotFlowById(botFlowRepository, botStepRepository, botStepConditionRepository);
const toggleBotFlow = new ToggleBotFlow(botFlowRepository);
const addBotStep = new AddBotStep(botFlowRepository, botStepRepository);
const updateBotStep = new UpdateBotStep(botStepRepository);
const deleteBotStep = new DeleteBotStep(botFlowRepository, botStepRepository);
const reorderBotSteps = new ReorderBotSteps(botFlowRepository, botStepRepository);
const setStepConditions = new SetStepConditions(botStepRepository, botStepConditionRepository);
const cancelBotSession = new CancelBotSession(botSessionRepository);

// Controllers
export const createBotFlowController = new CreateBotFlowController(createBotFlow);
export const updateBotFlowController = new UpdateBotFlowController(updateBotFlow);
export const deleteBotFlowController = new DeleteBotFlowController(deleteBotFlow);
export const listBotFlowsController = new ListBotFlowsController(listBotFlows);
export const getBotFlowByIdController = new GetBotFlowByIdController(getBotFlowById);
export const toggleBotFlowController = new ToggleBotFlowController(toggleBotFlow);
export const addBotStepController = new AddBotStepController(addBotStep);
export const updateBotStepController = new UpdateBotStepController(updateBotStep);
export const deleteBotStepController = new DeleteBotStepController(deleteBotStep);
export const reorderBotStepsController = new ReorderBotStepsController(reorderBotSteps);
export const setStepConditionsController = new SetStepConditionsController(setStepConditions);
export const cancelBotSessionController = new CancelBotSessionController(cancelBotSession);
export const listBotSessionsController = new ListBotSessionsController(botSessionRepository);
export const getBotSessionLogsController = new GetBotSessionLogsController(botLogRepository);

const saveCanvas = new SaveCanvas(botFlowRepository, botStepRepository, botStepConditionRepository);
export const saveCanvasController = new SaveCanvasController(saveCanvas);

// Setup AI services
import { env } from "../../../Shared/Env";
if (env.ANTHROPIC_API_KEY) {
  import("../../../Infrastructure/AI/AIService").then(({ AIService }) => {
    botEngine.setAIService(new AIService());
    console.log("[BotEngine] AI Service (Claude) configured");
  });
}
if (env.OPENAI_API_KEY) {
  import("../../../Infrastructure/AI/AudioTranscriber").then(({ AudioTranscriber }) => {
    botEngine.setAudioTranscriber(new AudioTranscriber());
    console.log("[BotEngine] Audio Transcriber (Whisper) configured");
  });
}
