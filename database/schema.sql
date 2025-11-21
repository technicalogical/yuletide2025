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
    product_url TEXT,
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
