import {
  Participant,
  ReactionStats,
  LaughConnection,
  PersonStats,
  WrappedData,
  REACTION_TYPES,
  PARTICIPANT_COLORS,
} from "@/types";

function getReactionCount(
  stats: ReactionStats[],
  handleId: number,
  reactionType: number,
  direction: "given" | "received"
): number {
  return stats
    .filter(
      (s) =>
        s.reactionType === reactionType &&
        (direction === "given"
          ? s.reactorHandleId === handleId
          : s.targetHandleId === handleId)
    )
    .reduce((sum, s) => sum + s.count, 0);
}

export function buildWrappedData(
  chatName: string,
  participants: Participant[],
  messageCounts: Map<number, number>,
  reactionStats: ReactionStats[],
  laughConnections: LaughConnection[]
): WrappedData {
  const personStats: PersonStats[] = participants.map((p, i) => {
    const msgCount = messageCounts.get(p.handleId) || 0;
    const laughsReceived = getReactionCount(reactionStats, p.handleId, REACTION_TYPES.LAUGHED, "received");
    const laughsGiven = getReactionCount(reactionStats, p.handleId, REACTION_TYPES.LAUGHED, "given");

    return {
      handleId: p.handleId,
      displayName: p.displayName,
      maskedNumber: p.maskedNumber,
      color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
      messagesSent: msgCount,
      laughsGiven,
      laughsReceived,
      heartsGiven: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.LOVED, "given"),
      heartsReceived: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.LOVED, "received"),
      thumbsUpGiven: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.LIKED, "given"),
      thumbsUpReceived: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.LIKED, "received"),
      thumbsDownGiven: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.DISLIKED, "given"),
      thumbsDownReceived: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.DISLIKED, "received"),
      emphasizedGiven: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.EMPHASIZED, "given"),
      emphasizedReceived: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.EMPHASIZED, "received"),
      questionedGiven: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.QUESTIONED, "given"),
      questionedReceived: getReactionCount(reactionStats, p.handleId, REACTION_TYPES.QUESTIONED, "received"),
      allReactionsGiven: reactionStats
        .filter((s) => s.reactorHandleId === p.handleId)
        .reduce((sum, s) => sum + s.count, 0),
      allReactionsReceived: reactionStats
        .filter((s) => s.targetHandleId === p.handleId)
        .reduce((sum, s) => sum + s.count, 0),
      laughRatio: laughsGiven > 0 ? Math.round((laughsReceived / laughsGiven) * 100) / 100 : 0,
      laughRate: msgCount > 0 ? Math.round(((laughsReceived / msgCount) * 100) * 10) / 10 : 0,
    };
  });

  // Filter out participants with 0 messages (stale handles)
  const activeStats = personStats.filter((p) => p.messagesSent > 0);

  const totalMessages = activeStats.reduce((sum, p) => sum + p.messagesSent, 0);
  const totalLaughs = activeStats.reduce((sum, p) => sum + p.laughsGiven, 0);
  const totalReactions = activeStats.reduce((sum, p) => sum + p.allReactionsGiven, 0);

  return {
    chatName,
    participants,
    personStats: activeStats,
    laughConnections,
    totalMessages,
    totalLaughs,
    totalReactions,
  };
}
