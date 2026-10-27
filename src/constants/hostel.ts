import type { MealPlanDay } from "@/types";

export const MEAL_PLAN_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;

export const EMPTY_MEAL_PLAN: MealPlanDay[] = MEAL_PLAN_DAYS.map((id) => ({
  id,
  breakfast: "",
  lunch: "",
  dinner: "",
}));
