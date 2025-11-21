# Christmas Shopping Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a recipient-focused Christmas shopping app with smart price tracking, flexible budgeting, and streamlined purchase management.

**Architecture:** React + TypeScript frontend with Node.js/Express backend, SQLite database, local-first with desktop web deployment. Simple PDF text extraction, intelligent price monitoring across retailers.

**Tech Stack:** React 18, TypeScript, Vite, shadcn/ui, Node.js, Express, SQLite, better-sqlite3, pdf-parse, Puppeteer

---

## Task 1: Project Structure Setup

**Files:**
- Create: `package.json`
- Create: `frontend/package.json`
- Create: `backend/package.json`
- Create: `shared/package.json`
- Create: `frontend/vite.config.ts`
- Create: `backend/tsconfig.json`
- Create: `frontend/tsconfig.json`
- Create: `shared/tsconfig.json`
- Create: `.gitignore`

**Step 1: Initialize root package.json**

```json
{
  "name": "christmas-tracker",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["frontend", "backend", "shared"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:shared && npm run build:backend && npm run build:frontend",
    "build:shared": "cd shared && npm run build",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

**Step 2: Create frontend package.json**

```json
{
  "name": "christmas-tracker-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3200",
    "build": "tsc && vite build",
    "preview": "vite preview --port 3201"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@radix-ui/react-icons": "^1.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

**Step 3: Create backend package.json**

```json
{
  "name": "christmas-tracker-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.1.1",
    "pdf-parse": "^1.1.1",
    "multer": "^1.4.5-lts.1",
    "joi": "^17.9.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/better-sqlite3": "^7.6.4",
    "@types/pdf-parse": "^1.1.1",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.5.0",
    "tsx": "^3.12.7",
    "typescript": "^5.1.6",
    "jest": "^29.6.2",
    "@types/jest": "^29.5.3",
    "ts-jest": "^29.1.1"
  }
}
```

**Step 4: Create shared package.json**

```json
{
  "name": "christmas-tracker-shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.1.6"
  }
}
```

**Step 5: Create configuration files**

Frontend vite.config.ts:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3200,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

Backend tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Frontend tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Shared tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

.gitignore:
```
node_modules
dist
*.log
.env
database/*.db
uploads/
.DS_Store
```

**Step 6: Install dependencies**

Run: `npm install`
Expected: All workspaces install dependencies successfully

**Step 7: Commit project setup**

```bash
git init
git add .
git commit -m "feat: initialize project structure with workspaces"
```

## Task 2: Database Schema and Models

**Files:**
- Create: `database/schema.sql`
- Create: `backend/src/models/database.ts`
- Create: `backend/src/models/recipient.ts`
- Create: `backend/src/models/giftItem.ts`
- Create: `backend/src/models/purchase.ts`
- Create: `backend/src/models/budget.ts`
- Create: `shared/src/types.ts`

**Step 1: Create database schema**

```sql
-- database/schema.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    relationship TEXT,
    budget_allocation DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gift_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status TEXT DEFAULT 'needed' CHECK (status IN ('needed', 'researching', 'ready_to_buy', 'purchased')),
    target_price DECIMAL(10,2),
    current_best_price DECIMAL(10,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES recipients (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    store_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    product_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES gift_items (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    store_name TEXT,
    purchase_price DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    payment_method TEXT,
    receipt_photo TEXT,
    was_on_sale BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES gift_items (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_budget DECIMAL(10,2) NOT NULL,
    year INTEGER NOT NULL DEFAULT (strftime('%Y', 'now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gift_items_recipient ON gift_items(recipient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_item ON price_history(item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item ON purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_budget_year ON budget(year);
```

**Step 2: Create shared types**

```typescript
// shared/src/types.ts
export interface Recipient {
  id?: number;
  name: string;
  relationship?: string;
  budget_allocation?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GiftItem {
  id?: number;
  recipient_id: number;
  name: string;
  description?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'needed' | 'researching' | 'ready_to_buy' | 'purchased';
  target_price?: number;
  current_best_price?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  recipient?: Recipient;
}

export interface PriceHistory {
  id?: number;
  item_id: number;
  store_name: string;
  price: number;
  product_url?: string;
  scraped_at?: string;
}

export interface Purchase {
  id?: number;
  item_id: number;
  store_name?: string;
  purchase_price: number;
  purchase_date: string;
  payment_method?: string;
  receipt_photo?: string;
  was_on_sale?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  item?: GiftItem;
}

export interface Budget {
  id?: number;
  total_budget: number;
  year: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetAnalytics {
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  recipients_breakdown: {
    recipient_id: number;
    recipient_name: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
}
```

**Step 3: Create database connection**

```typescript
// backend/src/models/database.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../database/christmas.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

export default db;
```

**Step 4: Create recipient model**

```typescript
// backend/src/models/recipient.ts
import db from './database';
import { Recipient } from '../../../shared/src/types';

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
```

**Step 5: Create gift item model**

```typescript
// backend/src/models/giftItem.ts
import db from './database';
import { GiftItem } from '../../../shared/src/types';

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
```

**Step 6: Create purchase model**

```typescript
// backend/src/models/purchase.ts
import db from './database';
import { Purchase } from '../../../shared/src/types';

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
        purchase.was_on_sale || false,
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

    stmt.run(
      purchase.store_name ?? current.store_name,
      purchase.purchase_price ?? current.purchase_price,
      purchase.purchase_date ?? current.purchase_date,
      purchase.payment_method ?? current.payment_method,
      purchase.receipt_photo ?? current.receipt_photo,
      purchase.was_on_sale ?? current.was_on_sale,
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
```

**Step 7: Create budget model**

```typescript
// backend/src/models/budget.ts
import db from './database';
import { Budget, BudgetAnalytics } from '../../../shared/src/types';

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
```

**Step 8: Commit database models**

```bash
git add .
git commit -m "feat: add database schema and models for core entities"
```

## Task 3: Backend API Routes

**Files:**
- Create: `backend/src/routes/recipients.ts`
- Create: `backend/src/routes/giftItems.ts`
- Create: `backend/src/routes/purchases.ts`
- Create: `backend/src/routes/budget.ts`
- Create: `backend/src/middleware/validation.ts`
- Create: `backend/src/index.ts`

**Step 1: Create validation middleware**

```typescript
// backend/src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

// Validation schemas
export const recipientSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  relationship: Joi.string().optional().max(50),
  budget_allocation: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(500)
});

export const giftItemSchema = Joi.object({
  recipient_id: Joi.number().integer().required(),
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().optional().max(500),
  priority: Joi.number().integer().min(1).max(5).default(1),
  status: Joi.string().valid('needed', 'researching', 'ready_to_buy', 'purchased').default('needed'),
  target_price: Joi.number().optional().min(0),
  current_best_price: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(500)
});

export const purchaseSchema = Joi.object({
  item_id: Joi.number().integer().required(),
  store_name: Joi.string().optional().max(100),
  purchase_price: Joi.number().required().min(0),
  purchase_date: Joi.string().required(), // ISO date string
  payment_method: Joi.string().optional().max(50),
  receipt_photo: Joi.string().optional().max(500),
  was_on_sale: Joi.boolean().optional().default(false),
  notes: Joi.string().optional().max(500)
});

export const budgetSchema = Joi.object({
  total_budget: Joi.number().required().min(0),
  year: Joi.number().integer().optional().default(new Date().getFullYear())
});
```

**Step 2: Create recipients routes**

```typescript
// backend/src/routes/recipients.ts
import { Router, Request, Response } from 'express';
import { RecipientModel } from '../models/recipient';
import { validate, recipientSchema } from '../middleware/validation';

const router = Router();

// GET /api/recipients
router.get('/', (req: Request, res: Response) => {
  try {
    const recipients = RecipientModel.getAll();
    res.json(recipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/recipients/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid recipient ID' });
    }

    const recipient = RecipientModel.getById(id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json(recipient);
  } catch (error) {
    console.error('Error fetching recipient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/recipients
router.post('/', validate(recipientSchema), (req: Request, res: Response) => {
  try {
    const recipient = RecipientModel.create(req.body);
    res.status(201).json(recipient);
  } catch (error) {
    console.error('Error creating recipient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/recipients/:id
router.put('/:id', validate(recipientSchema.fork(['name'], (schema) => schema.optional())), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid recipient ID' });
    }

    const recipient = RecipientModel.update(id, req.body);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json(recipient);
  } catch (error) {
    console.error('Error updating recipient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/recipients/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid recipient ID' });
    }

    const deleted = RecipientModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 3: Create gift items routes**

```typescript
// backend/src/routes/giftItems.ts
import { Router, Request, Response } from 'express';
import { GiftItemModel } from '../models/giftItem';
import { validate, giftItemSchema } from '../middleware/validation';

const router = Router();

// GET /api/items
router.get('/', (req: Request, res: Response) => {
  try {
    const { recipient_id } = req.query;

    let items;
    if (recipient_id) {
      const recipientId = parseInt(recipient_id as string);
      if (isNaN(recipientId)) {
        return res.status(400).json({ error: 'Invalid recipient_id' });
      }
      items = GiftItemModel.getByRecipient(recipientId);
    } else {
      items = GiftItemModel.getAll();
    }

    res.json(items);
  } catch (error) {
    console.error('Error fetching gift items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/items/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const item = GiftItemModel.getById(id);
    if (!item) {
      return res.status(404).json({ error: 'Gift item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching gift item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/items
router.post('/', validate(giftItemSchema), (req: Request, res: Response) => {
  try {
    const item = GiftItemModel.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating gift item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/items/:id
router.put('/:id', validate(giftItemSchema.fork(['recipient_id', 'name'], (schema) => schema.optional())), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const item = GiftItemModel.update(id, req.body);
    if (!item) {
      return res.status(404).json({ error: 'Gift item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating gift item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/items/:id/status
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    if (!['needed', 'researching', 'ready_to_buy', 'purchased'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const item = GiftItemModel.updateStatus(id, status);
    if (!item) {
      return res.status(404).json({ error: 'Gift item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const deleted = GiftItemModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Gift item not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting gift item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 4: Create purchases routes**

```typescript
// backend/src/routes/purchases.ts
import { Router, Request, Response } from 'express';
import { PurchaseModel } from '../models/purchase';
import { validate, purchaseSchema } from '../middleware/validation';

const router = Router();

// GET /api/purchases
router.get('/', (req: Request, res: Response) => {
  try {
    const purchases = PurchaseModel.getAll();
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/purchases/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const purchase = PurchaseModel.getById(id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/purchases
router.post('/', validate(purchaseSchema), (req: Request, res: Response) => {
  try {
    const purchase = PurchaseModel.create(req.body);
    res.status(201).json(purchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/purchases/:id
router.put('/:id', validate(purchaseSchema.fork(['item_id', 'purchase_price', 'purchase_date'], (schema) => schema.optional())), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const purchase = PurchaseModel.update(id, req.body);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/purchases/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const deleted = PurchaseModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 5: Create budget routes**

```typescript
// backend/src/routes/budget.ts
import { Router, Request, Response } from 'express';
import { BudgetModel } from '../models/budget';
import { validate, budgetSchema } from '../middleware/validation';

const router = Router();

// GET /api/budget
router.get('/', (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : undefined;

    if (year && isNaN(targetYear!)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const budget = targetYear ? BudgetModel.getByYear(targetYear) : BudgetModel.getCurrent();

    if (!budget) {
      return res.status(404).json({ error: 'No budget found for the specified year' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/budget/analytics
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : undefined;

    if (year && isNaN(targetYear!)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const analytics = BudgetModel.getAnalytics(targetYear);

    if (!analytics) {
      return res.status(404).json({ error: 'No budget found for analytics' });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/budget
router.post('/', validate(budgetSchema), (req: Request, res: Response) => {
  try {
    const budget = BudgetModel.create(req.body);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/budget/:year
router.put('/:year', validate(budgetSchema.fork(['year'], (schema) => schema.optional())), (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const { total_budget } = req.body;

    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const budget = BudgetModel.update(year, total_budget);
    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 6: Create main server**

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import recipientsRouter from './routes/recipients';
import giftItemsRouter from './routes/giftItems';
import purchasesRouter from './routes/purchases';
import budgetRouter from './routes/budget';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/recipients', recipientsRouter);
app.use('/api/items', giftItemsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/budget', budgetRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
```

**Step 7: Test backend startup**

Run: `cd backend && npm run dev`
Expected: Server starts successfully on port 3000, no errors in console

**Step 8: Commit API routes**

```bash
git add .
git commit -m "feat: implement REST API routes for all core entities"
```

## Task 4: Frontend Base Setup

**Files:**
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/index.html`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/index.css`
- Create: `frontend/src/lib/utils.ts`
- Create: `frontend/src/components/ui/button.tsx`

**Step 1: Create HTML entry point**

```html
<!-- frontend/index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Christmas Shopping Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: Create Tailwind config**

```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Step 3: Create PostCSS config**

```javascript
// frontend/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 4: Create base CSS**

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 355.7 100% 97.3%;

    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;

    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 142.1 76.2% 36.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 142.1 70% 45.3%;
    --primary-foreground: 144.9 80.4% 10%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 142.4 71.8% 29.2%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 5: Create utils**

```typescript
// frontend/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format date
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```

**Step 6: Create basic button component**

```typescript
// frontend/src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Step 7: Create main App component**

```typescript
// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-primary">
                🎄 Christmas Tracker
              </Link>
              <div className="flex gap-4">
                <Link to="/recipients">
                  <Button variant="ghost">Recipients</Button>
                </Link>
                <Link to="/gifts">
                  <Button variant="ghost">Gifts</Button>
                </Link>
                <Link to="/budget">
                  <Button variant="ghost">Budget</Button>
                </Link>
                <Link to="/purchases">
                  <Button variant="ghost">Purchases</Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/recipients" element={<div>Recipients Page</div>} />
            <Route path="/gifts" element={<div>Gifts Page</div>} />
            <Route path="/budget" element={<div>Budget Page</div>} />
            <Route path="/purchases" element={<div>Purchases Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Christmas Tracker! 🎅
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Organize your holiday shopping with smart budgeting and price tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Recipients</h3>
          <p className="text-muted-foreground mb-4">Manage who you're shopping for</p>
          <Link to="/recipients">
            <Button className="w-full">View Recipients</Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Gift Ideas</h3>
          <p className="text-muted-foreground mb-4">Track gift ideas and progress</p>
          <Link to="/gifts">
            <Button className="w-full">View Gifts</Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Budget</h3>
          <p className="text-muted-foreground mb-4">Monitor spending and allocations</p>
          <Link to="/budget">
            <Button className="w-full">View Budget</Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Purchases</h3>
          <p className="text-muted-foreground mb-4">Track completed purchases</p>
          <Link to="/purchases">
            <Button className="w-full">View Purchases</Button>
          </Link>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Recipients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Gift Ideas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">$0</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

**Step 8: Create React entry point**

```typescript
// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 9: Install frontend dependencies**

Run: `cd frontend && npm install`
Expected: Dependencies install successfully

**Step 10: Test frontend startup**

Run: `cd frontend && npm run dev`
Expected: Frontend starts on port 3200, shows dashboard with navigation

**Step 11: Commit frontend base**

```bash
git add .
git commit -m "feat: create React frontend with routing and basic UI components"
```

Plan complete and saved to `docs/plans/2025-11-20-christmas-tracker-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**