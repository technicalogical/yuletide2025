// backend/src/models/giftItem.ts
import db from './database';
import { GiftItem } from '@shared/types';

export class GiftItemModel {
  static getAll(): GiftItem[] {
    const stmt = db.prepare(`
      SELECT gi.*, r.name as recipient_name
      FROM gift_items gi
      LEFT JOIN recipients r ON gi.recipient_id = r.id
      ORDER BY gi.created_at DESC
    `);
    return stmt.all() as GiftItem[];
  }

  static getByRecipient(recipientId: number): GiftItem[] {
    const stmt = db.prepare(`
      SELECT gi.*, r.name as recipient_name
      FROM gift_items gi
      LEFT JOIN recipients r ON gi.recipient_id = r.id
      WHERE gi.recipient_id = ?
      ORDER BY gi.priority DESC, gi.created_at DESC
    `);
    return stmt.all(recipientId) as GiftItem[];
  }

  static getById(id: number): GiftItem | null {
    const stmt = db.prepare(`
      SELECT gi.*, r.name as recipient_name
      FROM gift_items gi
      LEFT JOIN recipients r ON gi.recipient_id = r.id
      WHERE gi.id = ?
    `);
    return stmt.get(id) as GiftItem || null;
  }

  static create(item: Omit<GiftItem, 'id' | 'created_at' | 'updated_at'>): GiftItem {
    const stmt = db.prepare(`
      INSERT INTO gift_items (recipient_id, name, description, priority, status, target_price, current_best_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      item.recipient_id,
      item.name,
      item.description || null,
      item.priority,
      item.status,
      item.target_price || null,
      item.current_best_price || null,
      item.notes || null
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, item: Partial<GiftItem>): GiftItem | null {
    const current = this.getById(id);
    if (!current) return null;

    const stmt = db.prepare(`
      UPDATE gift_items
      SET recipient_id = ?, name = ?, description = ?, priority = ?, status = ?,
          target_price = ?, current_best_price = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      item.recipient_id ?? current.recipient_id,
      item.name ?? current.name,
      item.description ?? current.description,
      item.priority ?? current.priority,
      item.status ?? current.status,
      item.target_price ?? current.target_price,
      item.current_best_price ?? current.current_best_price,
      item.notes ?? current.notes,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM gift_items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static updateStatus(id: number, status: GiftItem['status']): GiftItem | null {
    const stmt = db.prepare(`
      UPDATE gift_items
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(status, id);
    return this.getById(id);
  }
}
