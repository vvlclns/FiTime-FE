import type { SolutionResponse, SolutionUserEntry } from '@/types/api';

/**
 * Merges consecutive time slots and includes subsets of unavailable users.
 * Filters out slots where everyone is unavailable.
 *
 * @param solutions - Array of solution entries from the API
 * @param totalUsers - Total number of users in the room
 * @returns Merged and sorted solution entries
 */
export const mergeSolutionTimeSlots = (
  solutions: SolutionResponse['solution'],
  totalUsers: number,
): SolutionResponse['solution'] => {
  if (!solutions || solutions.length === 0) return [];

  // Filter out slots where everyone is unavailable
  const validSolutions = solutions.filter(
    (slot) => slot.unavailable_users.length < totalUsers,
  );

  if (validSolutions.length === 0) return [];

  // Helper to create a unique key for a set of unavailable users - I hate JS...
  const getUserKey = (users: SolutionUserEntry[]) => {
    return users
      .map((u) => u.username)
      .sort()
      .join(',');
  };

  // Helper to check if setA is a subset of setB - Needed for merging unavailable timeslots
  const isSubset = (setA: SolutionUserEntry[], setB: SolutionUserEntry[]) => {
    const keysB = new Set(setB.map((u) => u.username));
    return setA.every((u) => keysB.has(u.username));
  };

  // Group by day first - Who the hell has meeting at 2AM? idk.
  const dayGroups = new Map<number, SolutionResponse['solution']>();
  validSolutions.forEach((slot) => {
    if (!dayGroups.has(slot.day)) {
      dayGroups.set(slot.day, []);
    }
    dayGroups.get(slot.day)!.push(slot);
  });

  const merged: SolutionResponse['solution'] = [];

  dayGroups.forEach((daySlots) => {
    // Find all unique sets of unavailable users for this day
    const uniqueUnavailableSets = new Map<string, SolutionUserEntry[]>();
    daySlots.forEach((slot) => {
      const key = getUserKey(slot.unavailable_users);
      if (!uniqueUnavailableSets.has(key)) {
        uniqueUnavailableSets.set(key, slot.unavailable_users);
      }
    });

    // For each unique set of unavailable users
    uniqueUnavailableSets.forEach((unavailableSet, setKey) => {
      // Find all slots where unavailable_users is a subset of this set
      // (including slots with fewer unavailable users, as they're better options)
      // 03:00~08:00 Alice, 04:00~10:00 Bob -> 04:00~08:00 (1st) + 03:00~08:00 (Without Bob), 04:00~10:00 (Without Alice)
      // NOT 04:00~08:00 (1st) + 03:00~04:00 (Without Bob), 08:00~10:00 (Without Alice)
      // The logic is kinda heavy...
      const compatibleSlots = daySlots.filter((slot) =>
        isSubset(slot.unavailable_users, unavailableSet),
      );

      // Find the best rank among slots with exact match of unavailable users
      const exactMatchSlots = daySlots.filter(
        (slot) => getUserKey(slot.unavailable_users) === setKey,
      );
      const bestRank =
        exactMatchSlots.length > 0
          ? Math.min(...exactMatchSlots.map((s) => s.rank))
          : compatibleSlots.length > 0
            ? Math.min(...compatibleSlots.map((s) => s.rank))
            : 999;

      // Sort by start_hour
      compatibleSlots.sort((a, b) => a.start_hour - b.start_hour);

      // Merge consecutive slots
      if (compatibleSlots.length > 0) {
        let current = {
          ...compatibleSlots[0],
          unavailable_users: unavailableSet,
          rank: bestRank,
        };

        // Since the list is sorted, we can use the greedy approach
        for (let i = 1; i < compatibleSlots.length; i++) {
          const slot = compatibleSlots[i];
          // Check if consecutive
          // TODO: We should check this behavior; Backend returns start_hour = end_hour; Assuming the interval is 1 hour
          if (current.end_hour + 1 === slot.start_hour) {
            // Merge by extending end_hour
            current.end_hour = slot.end_hour;
          } else {
            // Not consecutive, push current and start new
            merged.push(current);
            current = {
              ...slot,
              unavailable_users: unavailableSet,
              rank: bestRank,
            };
          }
        }
        // Don't forget the last one
        merged.push(current);
      }
    });
  });

  // Sort final result by rank, then day, then start_hour
  return merged.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.day !== b.day) return a.day - b.day;
    return a.start_hour - b.start_hour;
  });
};
