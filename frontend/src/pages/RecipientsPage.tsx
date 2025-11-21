import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Recipient } from '@shared/types';
import { API_BASE_URL, formatCurrency } from '@/lib/utils';

interface RecipientFormData {
  name: string;
  relationship: string;
  budget_allocation: string;
  notes: string;
}

function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [formData, setFormData] = useState<RecipientFormData>({
    name: '',
    relationship: '',
    budget_allocation: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/recipients`);
      if (!response.ok) throw new Error('Failed to fetch recipients');
      const data = await response.json();
      setRecipients(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error loading recipients: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      budget_allocation: '',
      notes: ''
    });
    setEditingRecipient(null);
    setShowForm(false);
  };

  const handleEdit = (recipient: Recipient) => {
    setFormData({
      name: recipient.name,
      relationship: recipient.relationship || '',
      budget_allocation: recipient.budget_allocation?.toString() || '',
      notes: recipient.notes || ''
    });
    setEditingRecipient(recipient);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Recipient name is required');
      return;
    }

    const budgetAllocation = formData.budget_allocation ? parseFloat(formData.budget_allocation) : undefined;
    if (formData.budget_allocation && (isNaN(budgetAllocation!) || budgetAllocation! < 0)) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        relationship: formData.relationship.trim() || undefined,
        budget_allocation: budgetAllocation,
        notes: formData.notes.trim() || undefined
      };

      const url = editingRecipient
        ? `${API_BASE_URL}/recipients/${editingRecipient.id}`
        : `${API_BASE_URL}/recipients`;

      const method = editingRecipient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Failed to ${editingRecipient ? 'update' : 'create'} recipient`);

      await fetchRecipients();
      resetForm();
      setError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error saving recipient: ${message}`);
    }
  };

  const handleDelete = async (recipient: Recipient) => {
    if (!confirm(`Are you sure you want to delete ${recipient.name}? This will also delete all their gift items.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recipients/${recipient.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete recipient');

      await fetchRecipients();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error deleting recipient: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Recipients</h1>
          <p className="text-muted-foreground mt-2">
            Manage the people you're shopping for this Christmas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Add Recipient
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Enter recipient name"
                  required
                />
              </div>

              <div>
                <label htmlFor="relationship" className="block text-sm font-medium mb-2">
                  Relationship
                </label>
                <input
                  id="relationship"
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Mother, Friend, Coworker, etc."
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium mb-2">
                  Budget Allocation
                </label>
                <input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget_allocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_allocation: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="0.00"
                />
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
                  placeholder="Gift preferences, size info, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingRecipient ? 'Update' : 'Add'} Recipient
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipients List */}
      {recipients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No recipients added yet</p>
          <Button onClick={() => setShowForm(true)}>
            Add Your First Recipient
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="bg-card p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <Link to={`/recipients/${recipient.id}`} className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground hover:text-primary">
                    {recipient.name}
                  </h2>
                </Link>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(recipient)}
                    className="h-8 w-8 p-0"
                  >
                    ✏️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(recipient)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {recipient.relationship && (
                <p className="text-muted-foreground text-sm mb-2">{recipient.relationship}</p>
              )}

              {recipient.budget_allocation && (
                <p className="text-sm font-medium text-green-600 mb-2">
                  Budget: {formatCurrency(recipient.budget_allocation)}
                </p>
              )}

              {recipient.notes && (
                <p className="text-sm text-muted-foreground">
                  <strong>Notes:</strong> {recipient.notes}
                </p>
              )}

              <div className="mt-3 pt-3 border-t">
                <Link to={`/recipients/${recipient.id}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    View Gift List
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipientsPage;