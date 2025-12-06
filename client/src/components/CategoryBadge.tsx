import { Badge } from "@/components/ui/badge";
import { getCategoryColor, getCategoryName } from "@/lib/types";

interface CategoryBadgeProps {
  categoryId: number;
  size?: "sm" | "default";
}

export function CategoryBadge({ categoryId, size = "default" }: CategoryBadgeProps) {
  const color = getCategoryColor(categoryId);
  const name = getCategoryName(categoryId);

  return (
    <Badge
      variant="outline"
      className={`border-l-4 ${size === "sm" ? "text-xs" : ""}`}
      style={{ borderLeftColor: color }}
      data-testid={`badge-category-${categoryId}`}
    >
      {name}
    </Badge>
  );
}
