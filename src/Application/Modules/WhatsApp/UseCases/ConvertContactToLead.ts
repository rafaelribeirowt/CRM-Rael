import { Lead } from "../../../../Domain/Leads/Models/Lead";
import { Activity } from "../../../../Domain/Activities/Models/Activity";
import { Contact } from "../../../../Domain/WhatsApp/Models/Contact";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";
import { IActivityRepository } from "../../../Contracts/Repositories/IActivityRepository";

interface ConvertContactToLeadInput {
  contactId: string;
  pipelineId: string;
  stageId: string;
  userId?: string;
  name?: string;
}

export class ConvertContactToLead {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly stageRepository: IPipelineStageRepository,
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(input: ConvertContactToLeadInput) {
    const contact = await this.contactRepository.findById(input.contactId);
    if (!contact) {
      throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");
    }

    // Check if contact already has a lead
    if (contact.leadId) {
      const existingLead = await this.leadRepository.findById(contact.leadId);
      if (existingLead) {
        throw new AppError(
          "Este contato ja esta vinculado a um lead",
          409,
          "ALREADY_HAS_LEAD"
        );
      }
    }

    // Verify stage exists
    const stage = await this.stageRepository.findById(input.stageId);
    if (!stage) {
      throw new AppError("Stage not found", 404, "STAGE_NOT_FOUND");
    }

    // Create lead
    const lead = Lead.create({
      name: input.name || contact.name || contact.pushName || contact.phone,
      phone: contact.phone,
      stageId: input.stageId,
      pipelineId: input.pipelineId,
      source: "whatsapp",
    });
    await this.leadRepository.save(lead);

    // Log activity
    const activity = Activity.create({
      leadId: lead.id,
      userId: input.userId,
      type: "created",
      description: `Lead criado a partir de conversa WhatsApp`,
    });
    await this.activityRepository.save(activity);

    // Link contact to lead
    const updatedContact = new Contact({
      ...contact.props,
      leadId: lead.id,
    });
    await this.contactRepository.save(updatedContact);

    return lead.toJSON();
  }
}
