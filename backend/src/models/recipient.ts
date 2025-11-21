// backend/src/models/recipient.ts
import db from './database';
import { Recipient } from '@shared/types';

export class RecipientModel {
  static getAll(): Recipient[] {
    const stmt = db.prepare(`
      SELECT * FROM recipients
      ORDER BY name
    `);
    return stmt.all() as Recipient[];
  }

  static getById(id: number): Recipient | null {
    const stmt = db.prepare('SELECT * FROM recipients WHERE id = ?');
    return stmt.get(id) as Recipient || null;
  }

  static create(recipient: Omit<Recipient, 'id' | 'created_at' | 'updated_at'>): Recipient {
    const stmt = db.prepare(`
      INSERT INTO recipients (name, relationship, budget_allocation, notes)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      recipient.name,
      recipient.relationship || null,
      recipient.budget_allocation || 0,
      recipient.notes || null
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, recipient: Partial<Recipient>): Recipient | null {
    const current = this.getById(id);
    if (!current) return null;

    const stmt = db.prepare(`
      UPDATE recipients
      SET name = ?, relationship = ?, budget_allocation = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      recipient.name ?? current.name,
      recipient.relationship ?? current.relationship,
      recipient.budget_allocation ?? current.budget_allocation,
      recipient.notes ?? current.notes,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM recipients WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
