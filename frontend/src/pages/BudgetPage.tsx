import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL, formatCurrency } from '@/lib/utils';
import { BudgetAnalytics, Recipient } from '@shared/types';

interface BudgetData {
  totalBudget: number;
  analytics: BudgetAnalytics | null;
}

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    totalBudget: 0,
    analytics: null
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState('');
  const [editingRecipient, setEditingRecipient] = useState<number | null>(null);
  const [newRecipientBudget, setNewRecipientBudget] = useState('');

  useEffect(() => {
    fetchBudgetData();
    fetchRecipients();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);

      // Try to get current budget analytics
      const analyticsResponse = await fetch(`${API_BASE_URL}/budget/analytics`);

      if (analyticsResponse.ok) {
        const analytics: BudgetAnalytics = await analyticsResponse.json();
        setBudgetData({
          totalBudget: analytics.total_budget,
          analytics
        });
      } else if (analyticsResponse.status === 404) {
        // No budget exists yet
        setBudgetData({
          totalBudget: 0,
          analytics: null
        });
      } else {
        throw new Error('Failed to fetch budget data');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error loading budget: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipients`);
      if (!response.ok) throw new Error('Failed to fetch recipients');
      const data = await response.json();
      setRecipients(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error loading recipients: ${message}`);
    }
  };

  const createOrUpdateBudget = async (totalBudget: number) => {
    try {
      const currentYear = new Date().getFullYear();

      // Try to update existing budget first
      let response = await fetch(`${API_BASE_URL}/budget/${currentYear}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_budget: totalBudget })
      });

      if (!response.ok) {
        // If update fails, try to create new budget
        response = await fetch(`${API_BASE_URL}/budget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total_budget: totalBudget,
            year: currentYear
          })
        });
      }

      if (!response.ok) throw new Error('Failed to save budget');

      await fetchBudgetData(); // Refresh data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error saving budget: ${message}`);
    }
  };

  const updateRecipientBudget = async (recipientId: number, budgetAllocation: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipients/${recipientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget_allocation: budgetAllocation })
      });

      if (!response.ok) throw new Error('Failed to update recipient budget');

      await Promise.all([fetchRecipients(), fetchBudgetData()]); // Refresh both datasets
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error updating recipient budget: ${message}`);
    }
  };

  const handleTotalBudgetSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(newTotalBudget);
    if (isNaN(budget) || budget < 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    await createOrUpdateBudget(budget);
    setEditingBudget(false);
    setNewTotalBudget('');
  };

  const handleRecipientBudgetSave = async (recipientId: number) => {
    const budget = parseFloat(newRecipientBudget);
    if (isNaN(budget) || budget < 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    await updateRecipientBudget(recipientId, budget);
    setEditingRecipient(null);
    setNewRecipientBudget('');
  };

  const getBudgetProgress = (spent: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.min((spent / allocated) * 100, 100);
  };

  const getBudgetColor = (spent: number, allocated: number) => {
    const progress = getBudgetProgress(spent, allocated);
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => {
              setError('');
              fetchBudgetData();
              fetchRecipients();
            }}
            className="mt-2"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Christmas Budget</h1>
        <p className="text-muted-foreground mt-2">
          Manage your holiday spending and track budget allocations
        </p>
      </div>

      {/* Total Budget Section */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Total Budget</h2>
          {!editingBudget && (
            <Button
              onClick={() => {
                setEditingBudget(true);
                setNewTotalBudget(budgetData.totalBudget.toString());
              }}
              variant="outline"
            >
              Edit Budget
            </Button>
          )}
        </div>

        {editingBudget ? (
          <form onSubmit={handleTotalBudgetSave} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="totalBudget" className="block text-sm font-medium mb-2">
                Total Christmas Budget
              </label>
              <input
                id="totalBudget"
                type="number"
                step="0.01"
                min="0"
                value={newTotalBudget}
                onChange={(e) => setNewTotalBudget(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Enter total budget"
                required
              />
            </div>
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingBudget(false);
                setNewTotalBudget('');
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {budgetData.analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(budgetData.analytics.total_budget)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(budgetData.analytics.total_spent)}
                    </div>
                    <div className="text-sm text-muted-foreground">Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(budgetData.analytics.remaining_budget)}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>
                      {Math.round((budgetData.analytics.total_spent / budgetData.analytics.total_budget) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getBudgetColor(
                        budgetData.analytics.total_spent,
                        budgetData.analytics.total_budget
                      )}`}
                      style={{
                        width: `${getBudgetProgress(
                          budgetData.analytics.total_spent,
                          budgetData.analytics.total_budget
                        )}%`
                      }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No budget set for this year</p>
                <p className="text-sm">Click "Edit Budget" to set your Christmas spending limit</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipients Budget Allocation */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Budget by Recipient</h2>

        {recipients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recipients added yet</p>
            <p className="text-sm">Add recipients first to allocate budgets</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipients.map((recipient) => {
              const analytics = budgetData.analytics?.recipients_breakdown.find(
                r => r.recipient_id === recipient.id
              );
              const spent = analytics?.spent || 0;
              const allocated = recipient.budget_allocation || 0;

              return (
                <div key={recipient.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{recipient.name}</h3>
                      {recipient.relationship && (
                        <p className="text-sm text-muted-foreground">{recipient.relationship}</p>
                      )}
                    </div>

                    {editingRecipient === recipient.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newRecipientBudget}
                          onChange={(e) => setNewRecipientBudget(e.target.value)}
                          className="w-24 px-2 py-1 border border-input rounded text-sm"
                          placeholder="0.00"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRecipientBudgetSave(recipient.id!)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingRecipient(null);
                            setNewRecipientBudget('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingRecipient(recipient.id!);
                          setNewRecipientBudget((recipient.budget_allocation || 0).toString());
                        }}
                      >
                        Edit Budget
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-muted-foreground">Budget: </span>
                      <span className="font-medium">{formatCurrency(allocated)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Spent: </span>
                      <span className="font-medium">{formatCurrency(spent)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining: </span>
                      <span className="font-medium">{formatCurrency(allocated - spent)}</span>
                    </div>
                  </div>

                  {allocated > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{Math.round(getBudgetProgress(spent, allocated))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getBudgetColor(spent, allocated)}`}
                          style={{ width: `${getBudgetProgress(spent, allocated)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}