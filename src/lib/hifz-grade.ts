import type { HifzGrade } from "@/types";

export const GRADE_LABEL_KEYS: Record<HifzGrade, string> = {
  mumtaz: "hifz.grade.mumtaz",
  jayyid_jiddan: "hifz.grade.jayyidJiddan",
  jayyid: "hifz.grade.jayyid",
  needs_improvement: "hifz.grade.needsImprovement",
};

/**
 * Mistake counter -> quality grade.
 * 0 -> Mumtaz, 1-2 -> Jayyid Jiddan, 3-4 -> Jayyid, 5+ -> Needs Improvement.
 */
export function gradeFromMistakes(mistakes: number): HifzGrade {
  if (mistakes <= 0) return "mumtaz";
  if (mistakes <= 2) return "jayyid_jiddan";
  if (mistakes <= 4) return "jayyid";
  return "needs_improvement";
}
