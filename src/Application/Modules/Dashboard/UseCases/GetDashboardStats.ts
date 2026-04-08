import { sql, eq, count, and, gte } from "drizzle-orm";
import { db } from "../../../../Infrastructure/Database/Drizzle/client";
import { leads } from "../../../../Infrastructure/Database/Schemas/leads";
import { pipelineStages } from "../../../../Infrastructure/Database/Schemas/pipelineStages";
import { messages } from "../../../../Infrastructure/Database/Schemas/messages";

export class GetDashboardStats {
  async execute() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeadsResult,
      wonLeadsResult,
      lostLeadsResult,
      leadsThisMonthResult,
      messagesTodayResult,
      leadsByStageResult,
    ] = await Promise.all([
      db.select({ total: count() }).from(leads),
      db
        .select({ total: count() })
        .from(leads)
        .innerJoin(pipelineStages, eq(leads.stageId, pipelineStages.id))
        .where(eq(pipelineStages.isWon, true)),
      db
        .select({ total: count() })
        .from(leads)
        .innerJoin(pipelineStages, eq(leads.stageId, pipelineStages.id))
        .where(eq(pipelineStages.isLost, true)),
      db
        .select({ total: count() })
        .from(leads)
        .where(gte(leads.createdAt, startOfMonth)),
      db
        .select({ total: count() })
        .from(messages)
        .where(gte(messages.createdAt, startOfDay))
        .catch(() => [{ total: 0 }]),
      db
        .select({
          stageId: pipelineStages.id,
          stageName: pipelineStages.name,
          stageColor: pipelineStages.color,
          count: count(),
        })
        .from(leads)
        .innerJoin(pipelineStages, eq(leads.stageId, pipelineStages.id))
        .groupBy(pipelineStages.id, pipelineStages.name, pipelineStages.color),
    ]);

    const totalLeads = totalLeadsResult[0]?.total ?? 0;
    const wonLeads = wonLeadsResult[0]?.total ?? 0;
    const lostLeads = lostLeadsResult[0]?.total ?? 0;
    const closedLeads = wonLeads + lostLeads;
    const conversionRate =
      closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

    const totalValue = await db
      .select({ sum: sql<string>`COALESCE(SUM(CAST(${leads.value} AS NUMERIC)), 0)` })
      .from(leads)
      .innerJoin(pipelineStages, eq(leads.stageId, pipelineStages.id))
      .where(eq(pipelineStages.isWon, true));

    return {
      totalLeads,
      wonLeads,
      lostLeads,
      leadsThisMonth: leadsThisMonthResult[0]?.total ?? 0,
      messagesToday: messagesTodayResult[0]?.total ?? 0,
      conversionRate,
      totalValue: totalValue[0]?.sum ?? "0",
      leadsByStage: leadsByStageResult,
    };
  }
}
