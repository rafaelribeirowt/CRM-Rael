import { DrizzleLeadRepository } from "../../../Infrastructure/Database/Repositories/DrizzleLeadRepository";
import { DrizzleActivityRepository } from "../../../Infrastructure/Database/Repositories/DrizzleActivityRepository";
import { DrizzlePipelineStageRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePipelineStageRepository";
import { DrizzleContactRepository } from "../../../Infrastructure/Database/Repositories/DrizzleContactRepository";
import { CreateLead } from "../../../Application/Modules/Leads/UseCases/CreateLead";
import { UpdateLead } from "../../../Application/Modules/Leads/UseCases/UpdateLead";
import { GetLeadById } from "../../../Application/Modules/Leads/UseCases/GetLeadById";
import { ListLeads } from "../../../Application/Modules/Leads/UseCases/ListLeads";
import { MoveLead } from "../../../Application/Modules/Leads/UseCases/MoveLead";
import { DeleteLead } from "../../../Application/Modules/Leads/UseCases/DeleteLead";
import { CreateLeadController } from "../../../Presentation/Controllers/Leads/CreateLeadController";
import { UpdateLeadController } from "../../../Presentation/Controllers/Leads/UpdateLeadController";
import { GetLeadByIdController } from "../../../Presentation/Controllers/Leads/GetLeadByIdController";
import { ListLeadsController } from "../../../Presentation/Controllers/Leads/ListLeadsController";
import { MoveLeadController } from "../../../Presentation/Controllers/Leads/MoveLeadController";
import { DeleteLeadController } from "../../../Presentation/Controllers/Leads/DeleteLeadController";

export const leadRepository = new DrizzleLeadRepository();
export const activityRepository = new DrizzleActivityRepository();
const stageRepository = new DrizzlePipelineStageRepository();
const contactRepository = new DrizzleContactRepository();

const createLead = new CreateLead(leadRepository, activityRepository);
const updateLead = new UpdateLead(leadRepository);
const getLeadById = new GetLeadById(leadRepository);
const listLeads = new ListLeads(leadRepository);
const moveLead = new MoveLead(leadRepository, stageRepository, activityRepository);
const deleteLead = new DeleteLead(leadRepository, contactRepository);

export const createLeadController = new CreateLeadController(createLead);
export const updateLeadController = new UpdateLeadController(updateLead);
export const getLeadByIdController = new GetLeadByIdController(getLeadById);
export const listLeadsController = new ListLeadsController(listLeads);
export const moveLeadController = new MoveLeadController(moveLead);
export const deleteLeadController = new DeleteLeadController(deleteLead);
