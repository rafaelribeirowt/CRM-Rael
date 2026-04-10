import { eq, and, ilike, or, sql, desc, asc, count } from "drizzle-orm";
import { Lead } from "../../../Domain/Leads/Models/Lead";
import {
  ILeadRepository,
  LeadFilters,
} from "../../../Application/Contracts/Repositories/ILeadRepository";
import { db } from "../Drizzle/client";
import { leads, LeadRow } from "../Schemas/leads";
import {
  PaginationInput,
  PaginationResult,
  getPaginationParams,
  buildPaginationResult,
} from "../Helpers/pagination";

function toDomain(row: LeadRow): Lead {
  return new Lead({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    tags: row.tags,
    notes: row.notes,
    assignedTo: row.assignedTo,
    stageId: row.stageId,
    pipelineId: row.pipelineId,
    source: row.source,
    position: row.position,
    value: row.value ?? "0",
    lostReason: row.lostReason,
    wonAt: row.wonAt,
    lostAt: row.lostAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleLeadRepository implements ILeadRepository {
  async save(lead: Lead, tenantId: string): Promise<void> {
    await db
      .insert(leads)
      .values({
        id: lead.id,
        tenantId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        company: lead.company,
        tags: lead.tags,
        notes: lead.notes,
        assignedTo: lead.assignedTo,
        stageId: lead.stageId,
        pipelineId: lead.pipelineId,
        source: lead.source,
        position: lead.position,
        value: lead.value,
        lostReason: lead.lostReason,
        wonAt: lead.wonAt,
        lostAt: lead.lostAt,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      })
      .onConflictDoUpdate({
        target: leads.id,
        set: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          company: lead.company,
          tags: lead.tags,
          notes: lead.notes,
          assignedTo: lead.assignedTo,
          stageId: lead.stageId,
          pipelineId: lead.pipelineId,
          source: lead.source,
          position: lead.position,
          value: lead.value,
          lostReason: lead.lostReason,
          wonAt: lead.wonAt,
          lostAt: lead.lostAt,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string, tenantId: string): Promise<Lead | null> {
    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByPhone(phone: string, tenantId: string): Promise<Lead | null> {
    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.phone, phone), eq(leads.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByStageId(stageId: string, tenantId: string): Promise<Lead[]> {
    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.stageId, stageId), eq(leads.tenantId, tenantId)))
      .orderBy(asc(leads.position));
    return rows.map(toDomain);
  }

  async findByPipelineId(pipelineId: string, tenantId: string): Promise<Lead[]> {
    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.pipelineId, pipelineId), eq(leads.tenantId, tenantId)))
      .orderBy(asc(leads.position));
    return rows.map(toDomain);
  }

  async search(
    filters: LeadFilters,
    pagination: PaginationInput,
    tenantId: string
  ): Promise<PaginationResult<Lead>> {
    const { page, limit, offset } = getPaginationParams(pagination);

    const conditions = [eq(leads.tenantId, tenantId)];

    if (filters.pipelineId) {
      conditions.push(eq(leads.pipelineId, filters.pipelineId));
    }
    if (filters.stageId) {
      conditions.push(eq(leads.stageId, filters.stageId));
    }
    if (filters.assignedTo) {
      conditions.push(eq(leads.assignedTo, filters.assignedTo));
    }
    if (filters.source) {
      conditions.push(eq(leads.source, filters.source));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(leads.name, `%${filters.search}%`),
          ilike(leads.phone, `%${filters.search}%`),
          ilike(leads.email, `%${filters.search}%`),
          ilike(leads.company, `%${filters.search}%`)
        )!
      );
    }

    const where = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(leads)
        .where(where)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(leads).where(where),
    ]);

    const total = totalResult[0]?.total ?? 0;
    return buildPaginationResult(rows.map(toDomain), total, page, limit);
  }

  async updatePosition(
    id: string,
    stageId: string,
    position: number,
    tenantId: string,
    pipelineId?: string
  ): Promise<void> {
    const set: Record<string, unknown> = { stageId, position, updatedAt: new Date() };
    if (pipelineId) set.pipelineId = pipelineId;
    await db.update(leads).set(set).where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
  }

  async countByTenantId(tenantId: string): Promise<number> {
    const result = await db
      .select({ total: count() })
      .from(leads)
      .where(eq(leads.tenantId, tenantId));
    return result[0]?.total ?? 0;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(leads).where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
  }
}
