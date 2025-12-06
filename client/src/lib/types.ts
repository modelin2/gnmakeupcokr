export interface Appointment {
  id: number;
  name: string;
  category: number;
  date: Date;
  time: string;
  phone?: string;
  notes?: string;
  secret?: boolean;
}

export interface CategoryInfo {
  id: number;
  name: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 1, name: "카테고리 1", color: "hsl(var(--category-1))" },
  { id: 2, name: "카테고리 2", color: "hsl(var(--category-2))" },
  { id: 3, name: "카테고리 3", color: "hsl(var(--category-3))" },
  { id: 4, name: "카테고리 4", color: "hsl(var(--category-4))" },
  { id: 5, name: "카테고리 5", color: "hsl(var(--category-5))" },
  { id: 6, name: "카테고리 6", color: "hsl(var(--category-6))" },
  { id: 7, name: "카테고리 7", color: "hsl(var(--category-7))" },
];

export const TIME_SLOTS = [
  "오전6시", "오전7시", "오전8시", "오전9시", "오전10시", "오전11시",
  "오후12시", "오후1시", "오후2시", "오후3시", "오후4시", "오후5시",
  "오후6시", "오후7시", "오후8시"
];

export function getCategoryColor(categoryId: number): string {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return category?.color || "hsl(var(--muted))";
}

export function getCategoryName(categoryId: number): string {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return category?.name || "기타";
}
