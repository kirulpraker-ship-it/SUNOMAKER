import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/authMiddleware';
import { db } from '../db';
import { AuditService } from '../services/auditService';

export const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Overview dashboard stats
 */
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalUsersRes = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalGenerationsRes = await db.execute('SELECT COUNT(*) as count FROM generations');
    const completedGenRes = await db.execute("SELECT COUNT(*) as count FROM generations WHERE status = 'COMPLETED'");
    const failedGenRes = await db.execute("SELECT COUNT(*) as count FROM generations WHERE status = 'FAILED'");
    const connectedUsersRes = await db.execute("SELECT COUNT(*) as count FROM user_kie_credentials WHERE status = 'CONNECTED'");

    const totalUsers = Number(totalUsersRes.rows[0]?.count || 0);
    const connectedUsers = Number(connectedUsersRes.rows[0]?.count || 0);
    const disconnectedUsers = Math.max(0, totalUsers - connectedUsers);
    const totalGenerations = Number(totalGenerationsRes.rows[0]?.count || 0);
    const successfulGenerations = Number(completedGenRes.rows[0]?.count || 0);
    const failedGenerations = Number(failedGenRes.rows[0]?.count || 0);

    return res.json({
      totalUsers,
      connectedKieUsers: connectedUsers,
      disconnectedUsers,
      totalGenerations,
      successfulGenerations,
      failedGenerations,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compute admin statistics.' });
  }
});

/**
 * GET /api/admin/users
 * Lists users and their BYOK connection status.
 * STRICT SECURITY: NEVER SELECT OR RETURN encryptedApiKey!
 */
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const resUsers = await db.execute(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.createdAt,
        u.updatedAt,
        k.status as kieStatus,
        k.keyLastFour as kieKeySuffix,
        k.lastTestedAt as kieLastTestedAt,
        COUNT(g.id) as generationCount
      FROM users u
      LEFT JOIN user_kie_credentials k ON u.id = k.userId
      LEFT JOIN generations g ON u.id = g.userId
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `);

    // Masked suffix only, no encryption material
    const formatted = resUsers.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role),
      status: String(row.status),
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
      kieConnection: {
        connected: row.kieStatus === 'CONNECTED',
        status: row.kieStatus || 'NOT_CONNECTED',
        maskedKey: row.kieKeySuffix ? `****************${row.kieKeySuffix}` : null,
        lastTestedAt: row.kieLastTestedAt ? String(row.kieLastTestedAt) : null,
      },
      generationCount: Number(row.generationCount || 0),
    }));

    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Detailed user profile (no secrets)
 */
adminRouter.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRes = await db.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.status, u.createdAt, u.updatedAt,
                   k.status as kieStatus, k.keyLastFour as kieKeySuffix, k.lastTestedAt as kieLastTestedAt
            FROM users u
            LEFT JOIN user_kie_credentials k ON u.id = k.userId
            WHERE u.id = ?`,
      args: [id],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const row = userRes.rows[0];
    const genCountRes = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM generations WHERE userId = ?',
      args: [id],
    });

    return res.json({
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role),
      status: String(row.status),
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
      generationCount: Number(genCountRes.rows[0]?.count || 0),
      kieConnection: {
        connected: row.kieStatus === 'CONNECTED',
        status: row.kieStatus || 'NOT_CONNECTED',
        maskedKey: row.kieKeySuffix ? `****************${row.kieKeySuffix}` : null,
        lastTestedAt: row.kieLastTestedAt ? String(row.kieLastTestedAt) : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get user details' });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Suspend, activate, or update role
 */
adminRouter.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    const now = new Date().toISOString();

    if (status && (status === 'ACTIVE' || status === 'SUSPENDED')) {
      await db.execute({
        sql: 'UPDATE users SET status = ?, updatedAt = ? WHERE id = ?',
        args: [status, now, id],
      });
      await AuditService.log(req.user!.id, 'ADMIN_USER_STATUS_CHANGE', { targetUserId: id, newStatus: status }, req.ip);
    }

    if (role && (role === 'ADMIN' || role === 'USER')) {
      await db.execute({
        sql: 'UPDATE users SET role = ?, updatedAt = ? WHERE id = ?',
        args: [role, now, id],
      });
    }

    return res.json({ success: true, message: 'User updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * GET /api/admin/generations
 * Lists system generations.
 * STRICT SECURITY: NEVER INCLUDE CREDENTIALS OR HEADERS!
 */
adminRouter.get('/generations', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit || 50);
    const genRes = await db.execute({
      sql: `SELECT g.id, g.userId, g.taskId, g.type, g.title, g.style, g.model, g.status,
                   g.duration, g.errorCode, g.errorMessage, g.createdAt, g.completedAt,
                   u.name as userName, u.email as userEmail
            FROM generations g
            JOIN users u ON g.userId = u.id
            ORDER BY g.createdAt DESC
            LIMIT ?`,
      args: [limit],
    });

    return res.json(genRes.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch generations' });
  }
});

/**
 * GET /api/admin/audit-logs
 */
adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const logs = await AuditService.getRecentLogs(100);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});
