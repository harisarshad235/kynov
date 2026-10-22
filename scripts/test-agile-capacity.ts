import {
  isEpicIssue,
  getEpicChildIssues,
  getRollupStoryPoints,
  shouldCountInSprintCapacity,
  calculateSprintCommittedPoints,
  resolveUserCapacityLimit,
} from '../lib/agile-capacity';

function runTests() {
  console.log('--- Testing Agile Business Logic ---');

  // Exact scenario from user request:
  const issues = [
    {
      key: 'TAGGY-102',
      title: 'Offers Module',
      type: 'Epic',
      issueType: 'EPIC',
      storyPoints: 10,
      assigneeId: 'user-haris',
      sprintId: 'sprint-1',
      parentIssueId: null,
    },
    {
      key: 'TAGGY-106',
      title: 'Slider Feedbacks',
      type: 'Story',
      issueType: 'STORY',
      storyPoints: 4,
      assigneeId: 'user-michael',
      sprintId: 'sprint-1',
      parentIssueId: null,
    },
    {
      key: 'TAGGY-105',
      title: 'Text Chat issue',
      type: 'Bug',
      issueType: 'BUG',
      storyPoints: 3,
      assigneeId: 'user-haris',
      sprintId: 'sprint-1',
      parentIssueId: 'TAGGY-102',
    },
    {
      key: 'TAGGY-104',
      title: 'Rejected/Expired offers should start a fresh thread 1',
      type: 'Task',
      issueType: 'TASK',
      storyPoints: 3,
      assigneeId: 'user-haris',
      sprintId: 'sprint-1',
      parentIssueId: 'TAGGY-102',
    },
    {
      key: 'TAGGY-103',
      title: 'Rejected/Expired offers should start a fresh thread 2',
      type: 'Task',
      issueType: 'TASK',
      storyPoints: 3,
      assigneeId: 'user-haris',
      sprintId: 'sprint-1',
      parentIssueId: 'TAGGY-102',
    },
  ];

  // 1. Test Epic Child Finding
  const children = getEpicChildIssues('TAGGY-102', issues);
  console.assert(children.length === 3, `Expected 3 children, got ${children.length}`);

  // 2. Test Epic Rollup
  const epicRollup = getRollupStoryPoints(issues[0], issues);
  console.log('Epic TAGGY-102 Rollup:', epicRollup);
  console.assert(epicRollup.points === 9, `Expected 9 pts rollup, got ${epicRollup.points}`);
  console.assert(epicRollup.isRollup === true, 'Expected isRollup to be true');

  // 3. Test Sprint Capacity Exclusion (no double-counting)
  const shouldCountEpic = shouldCountInSprintCapacity(issues[0], issues);
  console.assert(shouldCountEpic === false, 'Expected parent Epic to not be counted towards capacity');

  const shouldCountChild = shouldCountInSprintCapacity(issues[2], issues);
  console.assert(shouldCountChild === true, 'Expected child ticket to be counted towards capacity');

  // 4. Test Total Sprint Committed Points
  const sprintPoints = calculateSprintCommittedPoints(issues, issues);
  console.log('Sprint 1 committed points:', sprintPoints);
  console.assert(sprintPoints === 13, `Expected 13 pts committed (4 + 3 + 3 + 3), got ${sprintPoints}`);

  // 5. Test Haris Arshad's Workload Points
  const harisIssues = issues.filter(
    (i) => i.assigneeId === 'user-haris' && shouldCountInSprintCapacity(i, issues)
  );
  const harisPoints = harisIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  console.log("Haris Arshad's committed points:", harisPoints);
  console.assert(harisPoints === 9, `Expected 9 pts for Haris (3 + 3 + 3), got ${harisPoints}`);

  // 6. Test Capacity Resolution Hierarchy
  // A: Default fallback
  const fallbackCap = resolveUserCapacityLimit({
    userId: 'user-haris',
    teamRollingVelocity: 24,
    activeDevsCount: 4,
  });
  console.assert(fallbackCap.limit === 6 && fallbackCap.source === 'default', 'Fallback should be 6');

  // B: Historical rolling velocity
  const closedSprints = [{ id: 'closed-s1' }, { id: 'closed-s2' }];
  const historicalIssues = [
    {
      key: 'TAGGY-90',
      storyPoints: 8,
      assigneeId: 'user-haris',
      sprintId: 'closed-s1',
      status: 'Done',
    },
    {
      key: 'TAGGY-91',
      storyPoints: 10,
      assigneeId: 'user-haris',
      sprintId: 'closed-s2',
      status: 'Done',
    },
  ];
  const histCap = resolveUserCapacityLimit({
    userId: 'user-haris',
    closedSprints,
    allIssues: historicalIssues,
  });
  console.log('Historical capacity for Haris:', histCap);
  console.assert(histCap.limit === 9 && histCap.source === 'historical', 'Historical avg should be (8+10)/2 = 9');

  // C: Custom sprint override
  const customCap = resolveUserCapacityLimit({
    userId: 'user-haris',
    sprint: { id: 'sprint-1', capacityOverrides: JSON.stringify({ 'user-haris': 12 }) },
  });
  console.log('Custom override for Haris:', customCap);
  console.assert(customCap.limit === 12 && customCap.isCustom === true, 'Custom override should be 12');

  console.log('✅ ALL TESTS PASSED!');
}

runTests();
