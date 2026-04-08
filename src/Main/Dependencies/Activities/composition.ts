import { DrizzleActivityRepository } from "../../../Infrastructure/Database/Repositories/DrizzleActivityRepository";
import { ListActivitiesByLead } from "../../../Application/Modules/Activities/UseCases/ListActivitiesByLead";
import { ListActivitiesByLeadController } from "../../../Presentation/Controllers/Activities/ListActivitiesByLeadController";

const activityRepository = new DrizzleActivityRepository();

const listActivitiesByLead = new ListActivitiesByLead(activityRepository);

export const listActivitiesByLeadController =
  new ListActivitiesByLeadController(listActivitiesByLead);
