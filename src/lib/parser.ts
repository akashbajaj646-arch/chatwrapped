import initSqlJs, { Database } from "sql.js";
import { GroupChat, Participant, ReactionStats, LaughConnection, PARTICIPANT_COLORS } from "@/types";

let db: Database | null = null;

export async function loadDatabase(file: File): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: () => "/sql-wasm/sql-wasm.wasm",
  });
  const buffer = await file.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, phone.length - 4).replace(/\d/g, "*");
  return prefix + last4;
}

export function getGroupChats(): GroupChat[] {
  if (!db) throw new Error("Database not loaded");

  const results = db.exec(`
    SELECT 
      c.ROWID as chat_id,
      c.display_name,
      COUNT(DISTINCT chj.handle_id) as participant_count,
      COUNT(cmj.message_id) as message_count
    FROM chat c
    JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
    JOIN chat_handle_join chj ON c.ROWID = chj.chat_id
    GROUP BY c.ROWID
    HAVING COUNT(DISTINCT chj.handle_id) >= 2
    ORDER BY message_count DESC
  `);

  if (!results.length) return [];

  return results[0].values.map((row: any) => ({
    chatId: row[0] as number,
    displayName: (row[1] as string) || "Unnamed Group",
    participantCount: row[2] as number,
    messageCount: row[3] as number,
  }));
}

export function getParticipants(chatId: number): Participant[] {
  if (!db) throw new Error("Database not loaded");

  const results = db.exec(`
    SELECT h.ROWID, h.id
    FROM handle h
    JOIN chat_handle_join chj ON h.ROWID = chj.handle_id
    WHERE chj.chat_id = ${chatId}
  `);

  if (!results.length) return [];

  const participants: Participant[] = results[0].values.map((row: any, i: number) => ({
    handleId: row[0] as number,
    phoneNumber: row[1] as string,
    maskedNumber: maskPhone(row[1] as string),
    displayName: maskPhone(row[1] as string),
  }));

  // Add handle 0 for the device owner
  participants.unshift({
    handleId: 0,
    phoneNumber: "me",
    maskedNumber: "You",
    displayName: "You",
  });

  return participants;
}

export function getMessageCounts(chatId: number): Map<number, number> {
  if (!db) throw new Error("Database not loaded");

  const results = db.exec(`
    SELECT m.handle_id, COUNT(*) as count
    FROM message m
    JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    WHERE cmj.chat_id = ${chatId}
    AND m.associated_message_type = 0
    GROUP BY m.handle_id
  `);

  const counts = new Map<number, number>();
  if (results.length) {
    results[0].values.forEach((row: any) => {
      counts.set(row[0] as number, row[1] as number);
    });
  }
  return counts;
}

export function getReactionStats(chatId: number): ReactionStats[] {
  if (!db) throw new Error("Database not loaded");

  const results = db.exec(`
    SELECT 
      r.handle_id as reactor,
      m.handle_id as target,
      r.associated_message_type as reaction_type,
      COUNT(*) as count
    FROM message r
    JOIN chat_message_join cmj ON r.ROWID = cmj.message_id
    JOIN message m ON m.guid = REPLACE(REPLACE(r.associated_message_guid, 'p:0/', ''), 'bp:', '')
    WHERE cmj.chat_id = ${chatId}
    AND r.associated_message_type BETWEEN 2000 AND 2005
    GROUP BY r.handle_id, m.handle_id, r.associated_message_type
  `);

  if (!results.length) return [];

  return results[0].values.map((row: any) => ({
    reactorHandleId: row[0] as number,
    targetHandleId: row[1] as number,
    reactionType: row[2] as number,
    count: row[3] as number,
  }));
}

export function getLaughConnections(chatId: number): LaughConnection[] {
  if (!db) throw new Error("Database not loaded");

  const results = db.exec(`
    SELECT 
      r.handle_id as reactor,
      m.handle_id as target,
      COUNT(*) as count
    FROM message r
    JOIN chat_message_join cmj ON r.ROWID = cmj.message_id
    JOIN message m ON m.guid = REPLACE(REPLACE(r.associated_message_guid, 'p:0/', ''), 'bp:', '')
    WHERE cmj.chat_id = ${chatId}
    AND r.associated_message_type = 2003
    GROUP BY r.handle_id, m.handle_id
    ORDER BY count DESC
  `);

  if (!results.length) return [];

  return results[0].values.map((row: any) => ({
    reactorHandleId: row[0] as number,
    targetHandleId: row[1] as number,
    count: row[2] as number,
  }));
}
