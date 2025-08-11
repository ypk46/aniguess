export interface Attribute {
  id: string;
  name: string;
  code: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  matchType: 'exact_match' | 'partial_match' | 'range_match';
  animeId: string;
  createdAt: string;
  updatedAt: string;
}
