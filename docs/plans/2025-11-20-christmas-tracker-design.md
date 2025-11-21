# Christmas Shopping Tracker - Design Document

## Overview
A smart Christmas shopping app focused on recipient-based gift management with intelligent price tracking and flexible budgeting.

## Core Features

### 1. Recipient Management
- Add recipients with basic info (name, relationship, notes)
- Individual budget allocation per recipient
- Gift history from previous years (future feature)

### 2. Gift Item Management
- Manual item entry with quick-add forms
- Item details: name, description, size/specs, priority
- Status tracking: needed → researching → ready to buy → purchased
- Notes field for special instructions (e.g., "don't buy full price")
- Simple PDF text extraction for convenience

### 3. Budget Management
- Total Christmas budget with per-recipient allocations
- Real-time spending vs. budget tracking
- Flexible budget adjustments between recipients
- Visual progress indicators and spending insights

### 4. Price Tracking (Core Value Proposition)
- Multi-store price comparison for items
- Price drop alerts for wishlisted items
- Historical price charts and trends
- Smart purchase timing recommendations

### 5. Purchase Tracking
- Flexible detail capture:
  - Quick mode: item, price, date
  - Detailed mode: store, payment method, receipt photo
- Automatic budget updates
- Purchase history and spending analytics

## Technical Architecture

### Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui components with Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite with better-sqlite3
- **PDF Processing:** pdf-parse (simple text extraction)
- **Price Tracking:** Puppeteer + retail APIs
- **Development Ports:** 3200 (dev), 3201 (prod)

### Project Structure
```
christmas-tracker/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript definitions
│   │   └── lib/           # Utilities
├── backend/               # Node.js API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── utils/         # Helper functions
├── database/              # SQLite schema and migrations
├── shared/                # Shared TypeScript types
└── docs/                  # Documentation
```

### Database Schema

#### Recipients Table
```sql
CREATE TABLE recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    relationship TEXT,
    budget_allocation DECIMAL(10,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Gift Items Table
```sql
CREATE TABLE gift_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'needed',
    target_price DECIMAL(10,2),
    current_best_price DECIMAL(10,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES recipients (id)
);
```

#### Price Tracking Table
```sql
CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    store_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    product_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES gift_items (id)
);
```

#### Purchases Table
```sql
CREATE TABLE purchases (
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
    FOREIGN KEY (item_id) REFERENCES gift_items (id)
);
```

#### Budget Table
```sql
CREATE TABLE budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_budget DECIMAL(10,2) NOT NULL,
    year INTEGER NOT NULL DEFAULT (strftime('%Y', 'now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Recipients
- `GET /api/recipients` - List all recipients
- `POST /api/recipients` - Create new recipient
- `PUT /api/recipients/:id` - Update recipient
- `DELETE /api/recipients/:id` - Delete recipient

#### Gift Items
- `GET /api/items` - List all gift items (with filters)
- `POST /api/items` - Create new gift item
- `PUT /api/items/:id` - Update gift item
- `DELETE /api/items/:id` - Delete gift item
- `POST /api/items/:id/track-price` - Start price tracking

#### Purchases
- `GET /api/purchases` - List all purchases
- `POST /api/purchases` - Record new purchase
- `PUT /api/purchases/:id` - Update purchase

#### Budget
- `GET /api/budget` - Get current budget info
- `POST /api/budget` - Set/update budget
- `GET /api/budget/analytics` - Get spending analytics

#### Price Tracking
- `GET /api/prices/:item_id` - Get price history for item
- `POST /api/prices/check` - Manual price check
- `GET /api/prices/alerts` - Get active price alerts

#### Utilities
- `POST /api/pdf/extract` - Extract text from PDF
- `POST /api/items/bulk-add` - Add multiple items from text

### Key Features Implementation

#### 1. Smart Item Entry
- Auto-complete for store names, brands
- Quick-add modal with keyboard shortcuts
- Bulk import from text with smart parsing

#### 2. Price Tracking System
- Background job to check prices periodically
- Store-specific scrapers (Amazon, Target, etc.)
- Price alert notifications
- Historical price charts with Chart.js

#### 3. Budget Dashboard
- Visual spending progress (progress bars, pie charts)
- Budget vs. actual spending comparisons
- Recipient-wise budget breakdowns
- Spending trend analytics

#### 4. Purchase Workflow
- Quick "Mark as Purchased" buttons
- Receipt photo upload and storage
- Automatic budget deduction
- Purchase confirmation with details

#### 5. PDF Helper
- Simple file upload and text extraction
- Text preview with copy/paste helpers
- Basic item suggestion parsing

### Development Phases

#### Phase 1: Core Data Management (Week 1)
- Set up project structure
- Implement database schema
- Build basic CRUD operations for recipients and items
- Create basic React UI with shadcn/ui

#### Phase 2: Budget System (Week 1-2)
- Implement budget allocation and tracking
- Build budget dashboard with visualizations
- Add spending analytics

#### Phase 3: Purchase Tracking (Week 2)
- Build purchase recording system
- Implement flexible detail capture
- Add receipt photo handling

#### Phase 4: Price Tracking (Week 2-3)
- Implement basic price scraping
- Add price history storage
- Build price comparison UI
- Add price alert system

#### Phase 5: Polish & Enhancements (Week 3-4)
- Add PDF text extraction helper
- Implement bulk item import
- Add data export/backup features
- Performance optimizations and testing

### Testing Strategy
- Use existing Christmas PDF as primary test data
- Mock recipients with varied budget scenarios
- Test price tracking with real products from list
- Integration testing for purchase workflow

### Deployment
- **Development:** Local with hot reload on port 3200
- **Production:** Simple cloud deployment on port 3201
- **Future:** Electron packaging for desktop distribution

## Success Metrics
- Successfully import and manage Christmas list from PDF
- Track price changes for key items (especially that sweater!)
- Stay within budget through smart spending tracking
- Complete Christmas shopping more efficiently than previous years

## Future Enhancements
- Mobile responsive design
- Shared family lists with collaboration
- Gift recommendation engine
- Integration with more retailers
- Historical year-over-year comparison