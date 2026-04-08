import { Lead } from "../../../../Domain/Leads/Models/Lead";
import { Activity } from "../../../../Domain/Activities/Models/Activity";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import { IActivityRepository } from "../../../Contracts/Repositories/IActivityRepository";

interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags?: string[];
  notes?: string;
  assignedTo?: string;
  stageId: string;
  pipelineId: string;
  source?: string;
  value?: string;
  userId?: string;
}

export class CreateLead {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(input: CreateLeadInput) {
    const lead = Lead.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      company: input.company,
      tags: input.tags,
      notes: input.notes,
      assignedTo: input.assignedTo,
      stageId: input.stageId,
      pipelineId: input.pipelineId,
      source: input.source,
      value: input.value,
    });

    await this.leadRepository.save(lead);

    const activity = Activity.create({
      leadId: lead.id,
      userId: input.userId,
      type: "created",
      description: `Lead "${lead.name}" criado`,
    });
    await this.activityRepository.save(activity);

    return lead.toJSON();
  }
}
