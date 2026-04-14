export const STATISTICS = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'] as string[];

export type EntityType = 'system' | 'user';
export type AccessType = 'public' | 'private';

export type Page<I> = {
  content: I[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type NamedEntity = {
  id: string;
  name: string;
};
