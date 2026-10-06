export interface CategoryDto {
  key: string;
  label: string;
  usageCount: number;
}

export interface CreateCategoryResultDto {
  category: CategoryDto;
  /** false cuando ya existia un tema equivalente y se reutilizo. */
  created: boolean;
}
