// backend/src/models/budget.ts
import db from './database';
import { Budget, BudgetAnalytics } from '@shared/types';

export class BudgetModel {
  static getCurrent(): Budget | null {
    const currentYear = new Date().getFullYear();
    const stmt = db.prepare('SELECT * FROM budget WHERE year = ? ORDER BY created_at DESC LIMIT 1');
    return stmt.get(currentYear) as Budget || null;
  }

  static getByYear(year: number): Budget | null {
    const stmt = db.prepare('SELECT * FROM budget WHERE year = ? ORDER BY created_at DESC LIMIT 1');
    return stmt.get(year) as Budget || null;
  }

  static create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Budget {
    const stmt = db.prepare(`
      INSERT INTO budget (total_budget, year)
      VALUES (?, ?)
    `);

    const result = stmt.run(budget.total_budget, budget.year);

    const getStmt = db.prepare('SELECT * FROM budget WHERE id = ?');
    return getStmt.get(result.lastInsertRowid as number) as Budget;
  }

  static update(year: number, totalBudget: number): Budget | null {
    const existing = this.getByYear(year);

    if (existing) {
      const stmt = db.prepare('UPDATE budget SET total_budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      stmt.run(totalBudget, existing.id);
      return this.getByYear(year);
    } else {
      return this.create({ total_budget: totalBudget, year });
    }
  }

  static getAnalytics(year?: number): BudgetAnalytics | null {
    const targetYear = year || new Date().getFullYear();
    const budget = this.getByYear(targetYear);

    if (!budget) return null;

    // Get total spent
    const totalSpentStmt = db.prepare(`
      SELECT COALESCE(SUM(p.purchase_price), 0) as total_spent
      FROM purchases p
      WHERE strftime('%Y', p.purchase_date) = ?
    `);
    const totalSpentResult = totalSpentStmt.get(targetYear.toString()) as { total_spent: number };

    // Get spending by recipient
    const recipientBreakdownStmt = db.prepare(`
      SELECT
        r.id as recipient_id,
        r.name as recipient_name,
        r.budget_allocation as allocated,
        COALESCE(SUM(p.purchase_price), 0) as spent
      FROM recipients r
      LEFT JOIN gift_items gi ON r.id = gi.recipient_id
      LEFT JOIN purchases p ON gi.id = p.item_id AND strftime('%Y', p.purchase_date) = ?
      GROUP BY r.id, r.name, r.budget_allocation
      ORDER BY r.name
    `);

    const recipientResults = recipientBreakdownStmt.all(targetYear.toString()) as {
      recipient_id: number;
      recipient_name: string;
      allocated: number;
      spent: number;
    }[];

    const recipients_breakdown = recipientResults.map(r => ({
      recipient_id: r.recipient_id,
      recipient_name: r.recipient_name,
      allocated: r.allocated || 0,
      spent: r.spent || 0,
      remaining: (r.allocated || 0) - (r.spent || 0)
    }));

    return {
      total_budget: budget.total_budget,
      total_spent: totalSpentResult.total_spent || 0,
      remaining_budget: budget.total_budget - (totalSpentResult.total_spent || 0),
      recipients_breakdown
    };
  }
}
