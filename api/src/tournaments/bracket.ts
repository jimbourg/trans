import Database from 'better-sqlite3';

interface Participant {
  id: number;
  user_id: number;
  display_name: string;
}

/**
 * Generate a single-elimination bracket for a tournament
 * @param db Database instance
 * @param tournamentId Tournament ID
 * @param participants Array of participants with assigned seeds
 */
export function generateBracket(db: Database.Database, tournamentId: number, participants: Participant[]): void {
  const numParticipants = participants.length;

  // Find the next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
  const numByes = bracketSize - numParticipants;

  // Round 1: Create all first-round matches
  const round = 1;
  const matchesInRound = bracketSize / 2;

  for (let i = 0; i < matchesInRound; i++) {
    const player1Index = i * 2;
    const player2Index = i * 2 + 1;

    const player1 = player1Index < numParticipants ? participants[player1Index] : null;
    const player2 = player2Index < numParticipants ? participants[player2Index] : null;

    // Handle byes: if only one player, they automatically advance
    if (player1 && !player2) {
      // Player 1 gets a bye - create match but mark as walkover
      db.prepare(`
        INSERT INTO tournament_matches (tournament_id, round, match_number, player1_id, status)
        VALUES (?, ?, ?, ?, 'walkover')
      `).run(tournamentId, round, i + 1, player1.user_id);
    } else if (!player1 && player2) {
      // Player 2 gets a bye
      db.prepare(`
        INSERT INTO tournament_matches (tournament_id, round, match_number, player2_id, status)
        VALUES (?, ?, ?, ?, 'walkover')
      `).run(tournamentId, round, i + 1, player2.user_id);
    } else if (player1 && player2) {
      // Normal match
      db.prepare(`
        INSERT INTO tournament_matches (tournament_id, round, match_number, player1_id, player2_id, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(tournamentId, round, i + 1, player1.user_id, player2.user_id);
    }
  }

  // Handle walkovers (byes) immediately
  const walkoverMatches = db.prepare(`
    SELECT id, player1_id, player2_id, round, match_number
    FROM tournament_matches
    WHERE tournament_id = ? AND status = 'walkover'
  `).all(tournamentId) as any[];

  for (const match of walkoverMatches) {
    const winnerId = match.player1_id || match.player2_id;
    db.prepare(`
      UPDATE tournament_matches
      SET winner_id = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(winnerId, match.id);

    // Advance to next round
    advanceWinner(db, tournamentId, match.round, match.match_number, winnerId);
  }

  // Create placeholder matches for subsequent rounds
  const totalRounds = Math.ceil(Math.log2(bracketSize));
  for (let r = 2; r <= totalRounds; r++) {
    const matchesInThisRound = Math.pow(2, totalRounds - r);
    for (let m = 0; m < matchesInThisRound; m++) {
      db.prepare(`
        INSERT INTO tournament_matches (tournament_id, round, match_number, status)
        VALUES (?, ?, ?, 'pending')
      `).run(tournamentId, r, m + 1);
    }
  }
}

/**
 * Advance the winner of a match to the next round
 * @param db Database instance
 * @param tournamentId Tournament ID
 * @param currentRound Current round number
 * @param currentMatchNumber Current match number
 * @param winnerId Winner's user ID
 */
export function advanceWinner(
  db: Database.Database,
  tournamentId: number,
  currentRound: number,
  currentMatchNumber: number,
  winnerId: number
): void {
  const nextRound = currentRound + 1;
  const nextMatchNumber = Math.ceil(currentMatchNumber / 2);

  // Find the next match
  const nextMatch = db.prepare(`
    SELECT id, player1_id, player2_id
    FROM tournament_matches
    WHERE tournament_id = ? AND round = ? AND match_number = ?
  `).get(tournamentId, nextRound, nextMatchNumber) as any;

  if (!nextMatch) {
    // This was the final match, no next round
    return;
  }

  // Determine if winner goes to player1 or player2 slot
  const isPlayer1Slot = currentMatchNumber % 2 === 1;

  if (isPlayer1Slot) {
    db.prepare(`
      UPDATE tournament_matches
      SET player1_id = ?
      WHERE id = ?
    `).run(winnerId, nextMatch.id);
  } else {
    db.prepare(`
      UPDATE tournament_matches
      SET player2_id = ?
      WHERE id = ?
    `).run(winnerId, nextMatch.id);
  }

  // Update participant status
  const loserId = currentMatchNumber; // This needs to be properly determined
  db.prepare(`
    UPDATE tournament_participants
    SET status = 'active'
    WHERE tournament_id = ? AND user_id = ?
  `).run(tournamentId, winnerId);
}

/**
 * Calculate placement for eliminated players
 * @param db Database instance
 * @param tournamentId Tournament ID
 * @param round Round where player was eliminated
 * @returns Placement (1st, 2nd, 3rd-4th, 5th-8th, etc.)
 */
export function calculatePlacement(round: number, totalRounds: number): number {
  if (round === totalRounds) {
    return 1; // Winner
  }
  if (round === totalRounds - 1) {
    return 2; // Runner-up
  }

  // Calculate placement range for this round
  const placementStart = Math.pow(2, totalRounds - round) + 1;
  return placementStart;
}
