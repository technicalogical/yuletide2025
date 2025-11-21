// backend/src/models/purchase.ts
import db from './database';
import { Purchase } from '@shared/types';

export class PurchaseModel {
  static getAll(): Purchase[] {
    const stmt = db.prepare(`
      SELECT p.*, gi.name as item_name, r.name as recipient_name
      FROM purchases p
      LEFT JOIN gift_items gi ON p.item_id = gi.id
      LEFT JOIN recipients r ON gi.recipient_id = r.id
      ORDER BY p.purchase_date DESC
    `);
    return stmt.all() as Purchase[];
  }

  static getById(id: number): Purchase | null {
    const stmt = db.prepare(`
      SELECT p.*, gi.name as item_name, r.name as recipient_name
      FROM purchases p
      LEFT JOIN gift_items gi ON p.item_id = gi.id
      LEFT JOIN recipients r ON gi.recipient_id = r.id
      WHERE p.id = ?
    `);
    return stmt.get(id) as Purchase || null;
  }

  static getByItem(itemId: number): Purchase | null {
    const stmt = db.prepare('SELECT * FROM purchases WHERE item_id = ?');
    return stmt.get(itemId) as Purchase || null;
  }

  static create(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Purchase {
    const transaction = db.transaction(() => {
      // Create purchase record
      const stmt = db.prepare(`
        INSERT INTO purchases (item_id, store_name, purchase_price, purchase_date, payment_method, receipt_photo, was_on_sale, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        purchase.item_id,
        purchase.store_name || null,
        purchase.purchase_price,
        purchase.purchase_date,
        purchase.payment_method || null,
        purchase.receipt_photo || null,
        purchase.was_on_sale ? 1 : 0,
        purchase.notes || null
      );

      // Update gift item status to purchased
      const updateStmt = db.prepare('UPDATE gift_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run('purchased', purchase.item_id);

      return result.lastInsertRowid as number;
    });

    const purchaseId = transaction();
    return this.getById(purchaseId)!;
  }

  static update(id: number, purchase: Partial<Purchase>): Purchase | null {
    const current = this.getById(id);
    if (!current) return null;

    const stmt = db.prepare(`
      UPDATE purchases
      SET store_name = ?, purchase_price = ?, purchase_date = ?, payment_method = ?,
          receipt_photo = ?, was_on_sale = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const wasOnSale = purchase.was_on_sale !== undefined ? (purchase.was_on_sale ? 1 : 0) : (current.was_on_sale ? 1 : 0);

    stmt.run(
      purchase.store_name ?? current.store_name,
      purchase.purchase_price ?? current.purchase_price,
      purchase.purchase_date ?? current.purchase_date,
      purchase.payment_method ?? current.payment_method,
      purchase.receipt_photo ?? current.receipt_photo,
      wasOnSale,
      purchase.notes ?? current.notes,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const purchase = this.getById(id);
    if (!purchase) return false;

    const transaction = db.transaction(() => {
      // Delete purchase
      const deleteStmt = db.prepare('DELETE FROM purchases WHERE id = ?');
      const result = deleteStmt.run(id);

      // Reset item status to ready_to_buy
      const updateStmt = db.prepare('UPDATE gift_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run('ready_to_buy', purchase.item_id);

      return result.changes > 0;
    });

    return transaction();
  }
}
