#!/usr/bin/env node
/**
 * Task 2 Verification Script
 * Tests all database models and shared types
 */

const { RecipientModel } = require('./dist/models/recipient');
const { GiftItemModel } = require('./dist/models/giftItem');
const { PurchaseModel } = require('./dist/models/purchase');
const { BudgetModel } = require('./dist/models/budget');

console.log('='.repeat(60));
console.log('Task 2 Verification: Database Schema and Models');
console.log('='.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Recipient Model - CRUD operations
test('RecipientModel: Create recipient', () => {
  const recipient = RecipientModel.create({
    name: 'Alice',
    relationship: 'Sister',
    budget_allocation: 100.00,
    notes: 'Loves books'
  });
  if (!recipient.id || recipient.name !== 'Alice') throw new Error('Create failed');
});

test('RecipientModel: Get all recipients', () => {
  const recipients = RecipientModel.getAll();
  if (!Array.isArray(recipients) || recipients.length === 0) throw new Error('GetAll failed');
});

test('RecipientModel: Get by ID', () => {
  const recipient = RecipientModel.getById(1);
  if (!recipient || recipient.name !== 'Alice') throw new Error('GetById failed');
});

test('RecipientModel: Update recipient', () => {
  const updated = RecipientModel.update(1, { notes: 'Updated notes' });
  if (!updated || updated.notes !== 'Updated notes') throw new Error('Update failed');
});

// Test 2: GiftItem Model - CRUD and status tracking
test('GiftItemModel: Create gift item', () => {
  const item = GiftItemModel.create({
    recipient_id: 1,
    name: 'Fantasy Novel',
    description: 'Latest bestseller',
    priority: 4,
    status: 'needed',
    target_price: 25.00
  });
  if (!item.id || item.name !== 'Fantasy Novel') throw new Error('Create failed');
});

test('GiftItemModel: Get by recipient', () => {
  const items = GiftItemModel.getByRecipient(1);
  if (!Array.isArray(items) || items.length === 0) throw new Error('GetByRecipient failed');
});

test('GiftItemModel: Update status', () => {
  const updated = GiftItemModel.updateStatus(1, 'researching');
  if (!updated || updated.status !== 'researching') throw new Error('UpdateStatus failed');
});

// Test 3: Budget Model - Budget and analytics
test('BudgetModel: Create budget', () => {
  const budget = BudgetModel.create({
    total_budget: 1000.00,
    year: new Date().getFullYear()
  });
  if (!budget.id || budget.total_budget !== 1000) throw new Error('Create failed');
});

test('BudgetModel: Get current budget', () => {
  const budget = BudgetModel.getCurrent();
  if (!budget || budget.total_budget !== 1000) throw new Error('GetCurrent failed');
});

// Test 4: Purchase Model - Transaction support
test('PurchaseModel: Create purchase (updates item status)', () => {
  // First update item to ready_to_buy
  GiftItemModel.updateStatus(1, 'ready_to_buy');

  const purchase = PurchaseModel.create({
    item_id: 1,
    store_name: 'Amazon',
    purchase_price: 22.99,
    purchase_date: new Date().toISOString().split('T')[0],
    was_on_sale: true
  });

  if (!purchase.id || purchase.purchase_price !== 22.99) throw new Error('Create failed');

  // Verify item status was updated to purchased
  const item = GiftItemModel.getById(1);
  if (item.status !== 'purchased') throw new Error('Status not updated to purchased');
});

test('BudgetModel: Get analytics with spending', () => {
  const analytics = BudgetModel.getAnalytics();
  if (!analytics) throw new Error('GetAnalytics failed');
  if (analytics.total_spent !== 22.99) throw new Error('Total spent incorrect');
  if (analytics.remaining_budget !== 977.01) throw new Error('Remaining budget incorrect');
  if (analytics.recipients_breakdown.length !== 1) throw new Error('Recipients breakdown incorrect');
});

test('PurchaseModel: Delete purchase (resets item status)', () => {
  const deleted = PurchaseModel.delete(1);
  if (!deleted) throw new Error('Delete failed');

  // Verify item status was reset
  const item = GiftItemModel.getById(1);
  if (item.status !== 'ready_to_buy') throw new Error('Status not reset');
});

// Test 5: Additional models
test('RecipientModel: Create second recipient', () => {
  const recipient = RecipientModel.create({
    name: 'Bob',
    relationship: 'Brother',
    budget_allocation: 75.00
  });
  if (!recipient.id) throw new Error('Create failed');
});

test('GiftItemModel: Multiple items for different recipients', () => {
  GiftItemModel.create({
    recipient_id: 2,
    name: 'Gaming Mouse',
    priority: 5,
    status: 'needed',
    target_price: 50.00
  });

  const allItems = GiftItemModel.getAll();
  if (allItems.length < 2) throw new Error('Should have multiple items');
});

test('RecipientModel: Delete recipient', () => {
  const deleted = RecipientModel.delete(2);
  if (!deleted) throw new Error('Delete failed');

  // Verify cascade delete of gift items
  const items = GiftItemModel.getByRecipient(2);
  if (items.length !== 0) throw new Error('Cascade delete failed');
});

test('BudgetModel: Update budget', () => {
  const updated = BudgetModel.update(new Date().getFullYear(), 1200.00);
  if (!updated || updated.total_budget !== 1200) throw new Error('Update failed');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed === 0) {
  console.log('\n✅ All Task 2 tests passed successfully!');
  console.log('\nImplemented:');
  console.log('  - Database schema with 5 tables and indexes');
  console.log('  - Shared TypeScript types for all entities');
  console.log('  - RecipientModel with full CRUD operations');
  console.log('  - GiftItemModel with status tracking');
  console.log('  - PurchaseModel with transaction support');
  console.log('  - BudgetModel with analytics');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
