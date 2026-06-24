import { Zap } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface FavoriteFood {
  name: string;
  category: string;
  calories: number;
}

export interface FavoriteFoodItemProps {
  food: FavoriteFood;
  /** 「填入」— populate the diet form with this food (user can edit before saving). */
  onFill: () => void;
  /** 「⚡帶入」— immediately create a diet log from this food. */
  onQuickAdd: () => void;
}

export function FavoriteFoodItem({
  food,
  onFill,
  onQuickAdd,
}: FavoriteFoodItemProps) {
  return (
    <div className="bg-card border-line rounded-card flex items-center gap-3 border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="type-body-strong text-foreground truncate">
            {food.name}
          </span>
          <Badge tone="indigo">{food.category}</Badge>
        </div>
        <span className="type-data-sm text-muted">{food.calories} kcal</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onFill}>
          填入
        </Button>
        <Button variant="primary" size="sm" onClick={onQuickAdd}>
          <Zap className="size-4" strokeWidth={2.5} />
          帶入
        </Button>
      </div>
    </div>
  );
}
