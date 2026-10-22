/**
 * Agile Story Points & Capacity Guardrails Calculation Engine
 * 
 * Provides robust, non-inflating calculations for:
 * 1. Epic Story Point Rollups (dynamic sum of child tickets)
 * 2. Capacity Guardrails without double-counting Epics & child tickets
 * 3. Developer Sprint Capacity budgets (custom overrides, historical velocity, and proportional fallbacks)
 */

export interface BasicIssue {
  key: string;
  storyPoints?: number | null;
  type?: string | null;
  issueType?: string | null;
  parentIssueId?: string | null;
  parent?: { key: string; title?: string } | null;
  assigneeId?: string | null;
  sprintId?: string | null;
  status?: string | null;
}

export interface BasicSprint {
  id: string;
  name?: string;
  capacityOverrides?: string | null; // JSON string e.g. {"usr_1": 12, "usr_2": 8}
}

export interface BasicUser {
  id: string;
  name: string;
  role?: string;
}

/**
 * Checks whether an issue is an Epic based on its type or issueType fields.
 */
export function isEpicIssue(issue: { type?: string | null; issueType?: string | null }): boolean {
  const t1 = (issue.type || '').trim().toUpperCase();
  const t2 = (issue.issueType || '').trim().toUpperCase();
  return t1 === 'EPIC' || t2 === 'EPIC';
}

/**
 * Finds all child issues linked to a given Epic key.
 */
export function getEpicChildIssues<T extends BasicIssue>(
  epicKey: string,
  allIssues: T[]
): T[] {
  if (!epicKey) return [];
  const targetKey = epicKey.trim().toUpperCase();
  return allIssues.filter((i) => {
    const parentId = (i.parentIssueId || '').trim().toUpperCase();
    const parentObjKey = (i.parent?.key || '').trim().toUpperCase();
    return parentId === targetKey || parentObjKey === targetKey;
  });
}

/**
 * Calculates the effective story points for an issue.
 * If the issue is an Epic and has linked child tickets, its points are dynamically
 * rolled up from the sum of all its child tickets (Stories, Tasks, Bugs).
 */
export function getRollupStoryPoints<T extends BasicIssue>(
  issue: T,
  allIssues: T[]
): { points: number; isRollup: boolean; childCount: number } {
  if (isEpicIssue(issue)) {
    const children = getEpicChildIssues(issue.key, allIssues);
    if (children.length > 0) {
      const childPoints = children.reduce(
        (sum, c) => sum + (Number(c.storyPoints) || 0),
        0
      );
      return {
        points: childPoints,
        isRollup: true,
        childCount: children.length,
      };
    }
  }
  return {
    points: Number(issue.storyPoints) || 0,
    isRollup: false,
    childCount: 0,
  };
}

/**
 * Determines whether an issue should contribute to sprint committed points and developer capacity.
 * To prevent double-counting:
 * - If an Epic has child tickets in the project, the Epic is an initiative/container and does NOT
 *   count towards capacity. Only the executable child tickets (Stories, Tasks, Bugs) count.
 */
export function shouldCountInSprintCapacity<T extends BasicIssue>(
  issue: T,
  allIssues: T[]
): boolean {
  if (isEpicIssue(issue)) {
    const children = getEpicChildIssues(issue.key, allIssues);
    if (children.length > 0) {
      // Epic has executable child issues; child issues represent the actual work.
      // Exclude the parent Epic from capacity to avoid double-counting.
      return false;
    }
  }
  return true;
}

/**
 * Calculates total executable sprint committed points without double-counting Epics.
 */
export function calculateSprintCommittedPoints<T extends BasicIssue>(
  sprintIssues: T[],
  allIssues: T[]
): number {
  return sprintIssues
    .filter((issue) => shouldCountInSprintCapacity(issue, allIssues))
    .reduce((sum, issue) => sum + (Number(issue.storyPoints) || 0), 0);
}

/**
 * Parses capacity overrides from a sprint's capacityOverrides column or JSON string.
 */
export function parseCapacityOverrides(overridesStr?: string | null): Record<string, number> {
  if (!overridesStr) return {};
  try {
    const parsed = typeof overridesStr === 'string' ? JSON.parse(overridesStr) : overridesStr;
    if (parsed && typeof parsed === 'object') {
      const result: Record<string, number> = {};
      for (const [userId, val] of Object.entries(parsed)) {
        const num = Number(val);
        if (!isNaN(num) && num >= 0) {
          result[userId] = num;
        }
      }
      return result;
    }
  } catch {}
  return {};
}

/**
 * Resolves a developer's capacity limit for a specific sprint following the Agile hierarchy:
 * 1. Custom sprint override (manually set by PM or user for PTO / schedule changes)
 * 2. Developer's personal rolling historical velocity (average completed points across closed sprints)
 * 3. Proportional team velocity fallback (rolling team velocity / active devs)
 */
export function resolveUserCapacityLimit<T extends BasicIssue>({
  userId,
  sprint,
  closedSprints = [],
  allIssues = [],
  teamRollingVelocity = 24,
  activeDevsCount = 4,
  localOverride,
}: {
  userId: string;
  sprint?: BasicSprint | null;
  closedSprints?: { id: string }[];
  allIssues?: T[];
  teamRollingVelocity?: number;
  activeDevsCount?: number;
  localOverride?: number | null;
}): { limit: number; isCustom: boolean; source: 'custom' | 'historical' | 'default' } {
  // 1. Check local override (e.g. from state / client cache)
  if (typeof localOverride === 'number' && localOverride >= 0) {
    return { limit: localOverride, isCustom: true, source: 'custom' };
  }

  // 2. Check sprint persistent capacity overrides
  const overrides = parseCapacityOverrides(sprint?.capacityOverrides);
  if (typeof overrides[userId] === 'number') {
    return { limit: overrides[userId], isCustom: true, source: 'custom' };
  }

  // 3. Calculate personal historical velocity from closed sprints
  if (closedSprints.length > 0 && allIssues.length > 0) {
    let completedPointsSum = 0;
    let completedSprintCount = 0;

    for (const cs of closedSprints) {
      const userIssuesInClosed = allIssues.filter(
        (i) =>
          i.sprintId === cs.id &&
          i.assigneeId === userId &&
          shouldCountInSprintCapacity(i, allIssues) &&
          ((i.status || '').toLowerCase() === 'done' || (i.status || '').toLowerCase() === 'shipped')
      );
      if (userIssuesInClosed.length > 0) {
        const sprintPts = userIssuesInClosed.reduce((sum, i) => sum + (Number(i.storyPoints) || 0), 0);
        completedPointsSum += sprintPts;
        completedSprintCount++;
      }
    }

    if (completedSprintCount > 0) {
      const avg = Math.round(completedPointsSum / completedSprintCount);
      if (avg > 0) {
        return { limit: avg, isCustom: false, source: 'historical' };
      }
    }
  }

  // 4. Default proportional fallback
  const count = Math.max(1, activeDevsCount);
  const fallback = Math.max(6, Math.round(teamRollingVelocity / count));
  return { limit: fallback, isCustom: false, source: 'default' };
}
