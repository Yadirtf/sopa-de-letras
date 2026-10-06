import { PrismaClient } from "@prisma/client";
import { CategoryRecord, ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { categoryKey, categoryLabel } from "../../../domain/services/category-normalizer";

/**
 * Los temas viven en la tabla `categories`, pero las sopas antiguas guardaban
 * el tema como texto libre. Por eso la busqueda tambien mira los temas que ya
 * usan las sopas publicas: ningun tema existente se queda fuera del buscador.
 */
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async search(term: string, limit: number): Promise<CategoryRecord[]> {
    const [rows, usage] = await Promise.all([
      this.prisma.category.findMany({
        where: term ? { key: { contains: term } } : undefined,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.usageByKey(),
    ]);

    const merged = new Map<string, CategoryRecord>();
    for (const row of rows) {
      merged.set(row.key, { key: row.key, label: row.label, usageCount: usage.get(row.key)?.count ?? 0 });
    }
    for (const [key, info] of usage) {
      if (!merged.has(key) && key.includes(term)) merged.set(key, { key, label: info.label, usageCount: info.count });
    }
    return [...merged.values()];
  }

  async findByKey(key: string): Promise<CategoryRecord | null> {
    const row = await this.prisma.category.findUnique({ where: { key } });
    if (!row) return null;
    const usageCount = await this.prisma.wordSearch.count({ where: { category: key, isPublic: true } });
    return { key: row.key, label: row.label, usageCount };
  }

  async create(data: { key: string; label: string; createdById: string }): Promise<CategoryRecord> {
    // upsert: si dos personas crean el mismo tema a la vez, gana el primero.
    const row = await this.prisma.category.upsert({ where: { key: data.key }, create: data, update: {} });
    return { key: row.key, label: row.label, usageCount: 0 };
  }

  private async usageByKey(): Promise<Map<string, { label: string; count: number }>> {
    const groups = await this.prisma.wordSearch.groupBy({
      by: ["category"],
      where: { isPublic: true },
      _count: { _all: true },
    });
    const usage = new Map<string, { label: string; count: number }>();
    for (const group of groups) {
      const key = categoryKey(group.category);
      if (!key) continue;
      const previous = usage.get(key);
      usage.set(key, { label: previous?.label ?? categoryLabel(group.category), count: (previous?.count ?? 0) + group._count._all });
    }
    return usage;
  }
}
