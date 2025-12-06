import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  selectedCategories: number[];
  onToggle: (categoryId: number) => void;
  onClearAll: () => void;
}

export function CategoryFilter({
  selectedCategories,
  onToggle,
  onClearAll,
}: CategoryFilterProps) {
  const allSelected = selectedCategories.length === 0;

  return (
    <div className="flex items-center gap-2" data-testid="category-filter">
      <ScrollArea className="max-w-full">
        <div className="flex gap-2 pb-2">
          <Button
            variant={allSelected ? "default" : "outline"}
            size="sm"
            onClick={onClearAll}
            data-testid="button-filter-all"
          >
            전체
          </Button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <Button
                key={cat.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onToggle(cat.id)}
                className="gap-2"
                data-testid={`button-filter-category-${cat.id}`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
