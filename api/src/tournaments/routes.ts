import type { FastifyInstance } from 'fastify';
import Database from 'better-sqlite3';
import { z } from 'zod';
import { createI18nForRequest } from '../i18n/translations.js';
import { generateBracket, advanceWinner } from './bracket.js';

const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  maxParticipants: z.number().int().min(4).max(256),
  startDate: z.string().datetime().optional(),
  bracketType: z.enum(['single_elimination', 'double_elimination']).default('single_elimination'),
});

const submitResultSchema = z.object({
  player1Score: z.number().int().min(0),
  player2Score: z.number().int().min(0),
});

export async function registerTournamentRoutes(app: FastifyInstance, db: Database.Database) {

  // List all tournaments
  app.get('/tournaments', async (req: any, res) => {
    try {
      const rows = db.prepare(`
        SELECT
          t.id,
          t.name,
          t.description,
          t.max_participants AS maxParticipants,
          t.status,
          t.bracket_type AS bracketType,
          t.start_date AS startDate,
          t.end_date AS endDate,
          t.created_at AS createdAt,
          u.display_name AS createdBy,
          w.display_name AS winner,
          COUNT(DISTINCT tp.id) AS participantCount
        FROM tournaments t
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN users w ON t.winner_id = w.id
        LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `).all();
      return res.send(rows);
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to fetch tournaments' });
    }
  });

  // Get tournament details
  app.get('/tournaments/:id', async (req: any, res) => {
    try {
      const { id } = req.params;

      const tournament = db.prepare(`
        SELECT
          t.id,
          t.name,
          t.description,
          t.max_participants AS maxParticipants,
          t.status,
          t.bracket_type AS bracketType,
          t.start_date AS startDate,
          t.end_date AS endDate,
          t.created_at AS createdAt,
          t.winner_id AS winnerId,
          u.display_name AS createdBy,
          w.display_name AS winner
        FROM tournaments t
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN users w ON t.winner_id = w.id
        WHERE t.id = ?
      `).get(id);

      if (!tournament) {
        return res.status(404).send({ error: 'Tournament not found' });
      }

      const participants = db.prepare(`
        SELECT
          tp.id,
          tp.seed,
          tp.placement,
          tp.status,
          tp.joined_at AS joinedAt,
          u.id AS userId,
          u.display_name AS displayName,
          u.avatar_url AS avatarUrl
        FROM tournament_participants tp
        JOIN users u ON tp.user_id = u.id
        WHERE tp.tournament_id = ?
        ORDER BY tp.seed ASC, tp.joined_at ASC
      `).all(id);

      return res.send({ ...tournament, participants });
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to fetch tournament details' });
    }
  });

  // Create tournament (authenticated users only)
  app.post('/tournaments', { preHandler: app.auth }, async (req: any, res) => {
    const reqI18n = createI18nForRequest(req.headers);
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).send({ error: reqI18n.t('unauthorized') });

      const body = createTournamentSchema.parse(req.body);

      const result = db.prepare(`
        INSERT INTO tournaments (name, description, max_participants, created_by, start_date, bracket_type, status)
        VALUES (?, ?, ?, ?, ?, ?, 'registration')
      `).run(
        body.name,
        body.description || null,
        body.maxParticipants,
        uid,
        body.startDate || null,
        body.bracketType
      );

      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).send(tournament);
    } catch (e) {
      app.log.error(e);
      if (e instanceof z.ZodError) {
        return res.status(400).send({ error: 'Invalid tournament data', details: e.errors });
      }
      return res.status(500).send({ error: reqI18n.t('tournamentCreationFailed') });
    }
  });

  // Join tournament
  app.post('/tournaments/:id/join', { preHandler: app.auth }, async (req: any, res) => {
    const reqI18n = createI18nForRequest(req.headers);
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).send({ error: reqI18n.t('unauthorized') });

      const { id } = req.params;

      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as any;
      if (!tournament) {
        return res.status(404).send({ error: 'Tournament not found' });
      }

      if (tournament.status !== 'registration') {
        return res.status(400).send({ error: 'Tournament registration is closed' });
      }

      const participantCount = db.prepare('SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?').get(id) as any;
      if (participantCount.count >= tournament.max_participants) {
        return res.status(400).send({ error: 'Tournament is full' });
      }

      const existingParticipant = db.prepare('SELECT * FROM tournament_participants WHERE tournament_id = ? AND user_id = ?').get(id, uid);
      if (existingParticipant) {
        return res.status(400).send({ error: 'Already joined this tournament' });
      }

      db.prepare(`
        INSERT INTO tournament_participants (tournament_id, user_id)
        VALUES (?, ?)
      `).run(id, uid);

      return res.status(201).send({ message: 'Successfully joined tournament' });
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to join tournament' });
    }
  });

  // Leave tournament
  app.delete('/tournaments/:id/leave', { preHandler: app.auth }, async (req: any, res) => {
    const reqI18n = createI18nForRequest(req.headers);
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).send({ error: reqI18n.t('unauthorized') });

      const { id } = req.params;

      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as any;
      if (!tournament) {
        return res.status(404).send({ error: 'Tournament not found' });
      }

      if (tournament.status !== 'registration') {
        return res.status(400).send({ error: 'Cannot leave tournament after registration closes' });
      }

      const result = db.prepare('DELETE FROM tournament_participants WHERE tournament_id = ? AND user_id = ?').run(id, uid);

      if (result.changes === 0) {
        return res.status(400).send({ error: 'Not registered in this tournament' });
      }

      return res.send({ message: 'Successfully left tournament' });
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to leave tournament' });
    }
  });

  // Get tournament bracket
  app.get('/tournaments/:id/bracket', async (req: any, res) => {
    try {
      const { id } = req.params;

      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as any;
      if (!tournament) {
        return res.status(404).send({ error: 'Tournament not found' });
      }

      const matches = db.prepare(`
        SELECT
          tm.id,
          tm.round,
          tm.match_number AS matchNumber,
          tm.player1_score AS player1Score,
          tm.player2_score AS player2Score,
          tm.status,
          tm.scheduled_at AS scheduledAt,
          tm.started_at AS startedAt,
          tm.completed_at AS completedAt,
          p1.id AS player1Id,
          p1.display_name AS player1Name,
          p1.avatar_url AS player1Avatar,
          p2.id AS player2Id,
          p2.display_name AS player2Name,
          p2.avatar_url AS player2Avatar,
          w.id AS winnerId,
          w.display_name AS winnerName
        FROM tournament_matches tm
        LEFT JOIN users p1 ON tm.player1_id = p1.id
        LEFT JOIN users p2 ON tm.player2_id = p2.id
        LEFT JOIN users w ON tm.winner_id = w.id
        WHERE tm.tournament_id = ?
        ORDER BY tm.round ASC, tm.match_number ASC
      `).all(id);

      return res.send({ tournament, matches });
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to fetch tournament bracket' });
    }
  });

  // Start tournament (creator only)
  app.post('/tournaments/:id/start', { preHandler: app.auth }, async (req: any, res) => {
    const reqI18n = createI18nForRequest(req.headers);
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).send({ error: reqI18n.t('unauthorized') });

      const { id } = req.params;

      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as any;
      if (!tournament) {
        return res.status(404).send({ error: 'Tournament not found' });
      }

      if (tournament.created_by !== uid) {
        return res.status(403).send({ error: 'Only tournament creator can start the tournament' });
      }

      if (tournament.status !== 'registration') {
        return res.status(400).send({ error: 'Tournament already started or completed' });
      }

      const participants = db.prepare(`
        SELECT tp.*, u.display_name
        FROM tournament_participants tp
        JOIN users u ON tp.user_id = u.id
        WHERE tp.tournament_id = ?
        ORDER BY RANDOM()
      `).all(id) as any[];

      if (participants.length < 2) {
        return res.status(400).send({ error: 'Need at least 2 participants to start tournament' });
      }

      // Assign seeds
      participants.forEach((participant, index) => {
        db.prepare('UPDATE tournament_participants SET seed = ? WHERE id = ?').run(index + 1, participant.id);
      });

      // Generate bracket
      generateBracket(db, parseInt(id), participants);

      // Update tournament status
      db.prepare('UPDATE tournaments SET status = ?, start_date = CURRENT_TIMESTAMP WHERE id = ?').run('in_progress', id);

      return res.send({ message: 'Tournament started successfully' });
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to start tournament' });
    }
  });

  // Submit match result
  app.post('/tournaments/:id/matches/:matchId/result', { preHandler: app.auth }, async (req: any, res) => {
    const reqI18n = createI18nForRequest(req.headers);
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).send({ error: reqI18n.t('unauthorized') });

      const { id, matchId } = req.params;
      const body = submitResultSchema.parse(req.body);

      const match = db.prepare('SELECT * FROM tournament_matches WHERE id = ? AND tournament_id = ?').get(matchId, id) as any;
      if (!match) {
        return res.status(404).send({ error: 'Match not found' });
      }

      if (match.status === 'completed') {
        return res.status(400).send({ error: 'Match already completed' });
      }

      if (!match.player1_id || !match.player2_id) {
        return res.status(400).send({ error: 'Match not ready' });
      }

      // Determine winner
      let winnerId: number;
      if (body.player1Score > body.player2Score) {
        winnerId = match.player1_id;
      } else if (body.player2Score > body.player1Score) {
        winnerId = match.player2_id;
      } else {
        return res.status(400).send({ error: 'Scores cannot be tied' });
      }

      // Update match
      db.prepare(`
        UPDATE tournament_matches
        SET player1_score = ?, player2_score = ?, winner_id = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(body.player1Score, body.player2Score, winnerId, matchId);

      // Advance winner to next round
      advanceWinner(db, parseInt(id), match.round, match.match_number, winnerId);

      // Check if tournament is complete
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as any;
      const pendingMatches = db.prepare('SELECT COUNT(*) as count FROM tournament_matches WHERE tournament_id = ? AND status != ?').get(id, 'completed') as any;

      if (pendingMatches.count === 0 && tournament.status === 'in_progress') {
        const finalMatch = db.prepare('SELECT winner_id FROM tournament_matches WHERE tournament_id = ? ORDER BY round DESC, match_number DESC LIMIT 1').get(id) as any;

        db.prepare('UPDATE tournaments SET status = ?, winner_id = ?, end_date = CURRENT_TIMESTAMP WHERE id = ?').run('completed', finalMatch.winner_id, id);
      }

      return res.send({ message: 'Match result submitted successfully' });
    } catch (e) {
      app.log.error(e);
      if (e instanceof z.ZodError) {
        return res.status(400).send({ error: 'Invalid match result', details: e.errors });
      }
      return res.status(500).send({ error: 'Failed to submit match result' });
    }
  });

  // Get user's tournaments
  app.get('/tournaments/my/list', { preHandler: app.auth }, async (req: any, res) => {
    const reqI18n = createI18nForRequest(req.headers);
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).send({ error: reqI18n.t('unauthorized') });

      const tournaments = db.prepare(`
        SELECT DISTINCT
          t.id,
          t.name,
          t.status,
          t.start_date AS startDate,
          tp.placement,
          tp.status AS participantStatus
        FROM tournaments t
        JOIN tournament_participants tp ON t.id = tp.tournament_id
        WHERE tp.user_id = ?
        ORDER BY t.created_at DESC
      `).all(uid);

      return res.send(tournaments);
    } catch (e) {
      app.log.error(e);
      return res.status(500).send({ error: 'Failed to fetch user tournaments' });
    }
  });
}
