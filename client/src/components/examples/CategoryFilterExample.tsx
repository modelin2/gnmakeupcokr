import { useState } from "react";
import { CategoryFilter } from "../CategoryFilter";

export default function CategoryFilterExample() {
  const [selected, setSelected] = useState<number[]>([]);

  const handleToggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-lg">
      <CategoryFilter
        selectedCategories={selected}
        onToggle={handleToggle}
        onClearAll={() => setSelected([])}
      />
      <p className="mt-2 text-sm text-muted-foreground">
        선택됨: {selected.length === 0 ? "전체" : selected.join(", ")}
      </p>
    </div>
  );
}
