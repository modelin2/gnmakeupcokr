import { CategoryBadge } from "../CategoryBadge";

export default function CategoryBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6, 7].map((id) => (
        <CategoryBadge key={id} categoryId={id} />
      ))}
    </div>
  );
}
