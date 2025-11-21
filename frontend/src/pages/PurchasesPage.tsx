import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { API_BASE_URL, formatCurrency, formatDate } from '@/lib/utils';

interface Purchase {
  id: number;
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
  item_name?: string;
  recipient_name?: string;
}

interface GiftItem {
  id: number;
  recipient_id: number;
  name: string;
  description?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'needed' | 'researching' | 'ready_to_buy' | 'purchased';
  target_price?: number;
  current_best_price?: number;
  notes?: string;
  recipient_name?: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [readyItems, setReadyItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    store_name: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    was_on_sale: false,
    notes: ''
  });

  useEffect(() => {
    fetchPurchases();
    fetchReadyItems();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases`);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error loading purchases: ${message}`);
    }
  };

  const fetchReadyItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      if (!response.ok) throw new Error('Failed to fetch gift items');
      const data: GiftItem[] = await response.json();
      // Filter for items that are ready to buy (not yet purchased)
      const ready = data.filter(item => item.status === 'ready_to_buy' || item.status === 'researching');
      setReadyItems(ready);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error loading gift items: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId) {
      setError('Please select a gift item');
      return;
    }

    const price = parseFloat(formData.purchase_price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid purchase price');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: selectedItemId,
          store_name: formData.store_name || undefined,
          purchase_price: price,
          purchase_date: formData.purchase_date,
          payment_method: formData.payment_method || undefined,
          was_on_sale: formData.was_on_sale,
          notes: formData.notes || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to create purchase');

      // Reset form and refresh data
      setFormData({
        store_name: '',
        purchase_price: '',
        purchase_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        was_on_sale: false,
        notes: ''
      });
      setSelectedItemId(null);
      setShowAddPurchase(false);

      await Promise.all([fetchPurchases(), fetchReadyItems()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error creating purchase: ${message}`);
    }
  };

  const deletePurchase = async (purchaseId: number) => {
    if (!confirm('Are you sure you want to delete this purchase? This will mark the item as ready to buy again.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete purchase');

      await Promise.all([fetchPurchases(), fetchReadyItems()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error deleting purchase: ${message}`);
    }
  };

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.purchase_price, 0);
  const averagePurchase = purchases.length > 0 ? totalSpent / purchases.length : 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Christmas Purchases</h1>
          <p className="text-muted-foreground mt-2">
            Track completed purchases and monitor your Christmas spending
          </p>
        </div>
        <Button
          onClick={() => setShowAddPurchase(true)}
          disabled={readyItems.length === 0}
        >
          Record Purchase
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => setError('')}
            className="mt-2"
            variant="outline"
            size="sm"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{purchases.length}</div>
          <div className="text-sm text-muted-foreground">Total Purchases</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSpent)}</div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(averagePurchase)}</div>
          <div className="text-sm text-muted-foreground">Average Purchase</div>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showAddPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Record New Purchase</h2>

            <form onSubmit={createPurchase} className="space-y-4">
              <div>
                <label htmlFor="item" className="block text-sm font-medium mb-2">
                  Gift Item *
                </label>
                <select
                  id="item"
                  value={selectedItemId || ''}
                  onChange={(e) => setSelectedItemId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  required
                >
                  <option value="">Select an item...</option>
                  {readyItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.recipient_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-2">
                  Purchase Price *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Purchase Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="store" className="block text-sm font-medium mb-2">
                  Store Name
                </label>
                <input
                  id="store"
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Target, Amazon, etc."
                />
              </div>

              <div>
                <label htmlFor="payment" className="block text-sm font-medium mb-2">
                  Payment Method
                </label>
                <input
                  id="payment"
                  type="text"
                  value={formData.payment_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Cash, Credit Card, etc."
                />
              </div>

              <div className="flex items-center">
                <input
                  id="onSale"
                  type="checkbox"
                  checked={formData.was_on_sale}
                  onChange={(e) => setFormData(prev => ({ ...prev, was_on_sale: e.target.checked }))}
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="onSale" className="ml-2 text-sm">
                  This item was on sale
                </label>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                  placeholder="Additional notes about this purchase..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Record Purchase
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddPurchase(false);
                    setSelectedItemId(null);
                    setFormData({
                      store_name: '',
                      purchase_price: '',
                      purchase_date: new Date().toISOString().split('T')[0],
                      payment_method: '',
                      was_on_sale: false,
                      notes: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No purchases recorded yet</p>
          {readyItems.length === 0 ? (
            <p className="text-sm">Add some gift items and mark them as ready to buy first</p>
          ) : (
            <Button onClick={() => setShowAddPurchase(true)}>
              Record Your First Purchase
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Purchases</h2>

          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-card border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{purchase.item_name}</h3>
                    {purchase.was_on_sale && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        On Sale!
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>For: {purchase.recipient_name}</p>
                    <p>Purchased: {formatDate(purchase.purchase_date)}</p>
                    {purchase.store_name && <p>Store: {purchase.store_name}</p>}
                    {purchase.payment_method && <p>Payment: {purchase.payment_method}</p>}
                    {purchase.notes && <p>Notes: {purchase.notes}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-primary mb-2">
                    {formatCurrency(purchase.purchase_price)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePurchase(purchase.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ready to Buy Items */}
      {readyItems.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ready to Purchase ({readyItems.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">For: {item.recipient_name}</p>
                {item.target_price && (
                  <p className="text-sm">Target: {formatCurrency(item.target_price)}</p>
                )}
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setShowAddPurchase(true);
                    }}
                  >
                    Mark as Purchased
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}