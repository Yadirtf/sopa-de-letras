export interface CategoryRecord {
  key: string;
  label: string;
  /** Cuantas sopas publicas usan este tema (sirve para ordenar y mostrar). */
  usageCount: number;
}

export interface ICategoryRepository {
  /** Busca por fragmento en el nombre; con termino vacio devuelve las mas usadas. */
  search(term: string, limit: number): Promise<CategoryRecord[]>;
  findByKey(key: string): Promise<CategoryRecord | null>;
  create(data: { key: string; label: string; createdById: string }): Promise<CategoryRecord>;
}
