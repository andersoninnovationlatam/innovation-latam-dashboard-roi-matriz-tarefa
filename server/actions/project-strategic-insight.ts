"use server";

import { assertGestor } from "@/server/auth/role";
import { regenerateProjectStrategicInsight } from "@/server/lib/project-strategic-insight";

export async function generateProjectStrategicInsightAction(projectId: string) {
  const denied = await assertGestor();
  if (denied) return denied;

  return regenerateProjectStrategicInsight(projectId);
}
