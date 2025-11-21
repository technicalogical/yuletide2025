import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Recipient, GiftItem } from '@shared/types';
import { API_BASE_URL } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function RecipientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftNotes, setNewGiftNotes] = useState('');

  useEffect(() => {
    const fetchRecipientDetails = async () => {
      if (!id) return;
      try {
        const [recipientResponse, giftsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/recipients/${id}`),
          fetch(`${API_BASE_URL}/items?recipient_id=${id}`),
        ]);

        if (!recipientResponse.ok || !giftsResponse.ok) {
          throw new Error('Failed to fetch recipient details');
        }

        const recipientData = await recipientResponse.json();
        const giftsData = await giftsResponse.json();

        setRecipient(recipientData);
        setGifts(giftsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipientDetails();
  }, [id]);

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName.trim() || !id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: parseInt(id),
          name: newGiftName,
          notes: newGiftNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add gift');
      }

      const newGift = await response.json();
      setGifts([...gifts, newGift]);
      setNewGiftName('');
      setNewGiftNotes('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!recipient) {
    return <div>Recipient not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{recipient.name}</h1>
          {recipient.relationship && <p className="text-muted-foreground">{recipient.relationship}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg">Budget: ${recipient.budget_allocation?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Gift</h2>
        <form onSubmit={handleAddGift} className="flex flex-col gap-4 bg-card p-4 rounded-lg border">
          <input
            type="text"
            placeholder="Gift name"
            value={newGiftName}
            onChange={(e) => setNewGiftName(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <textarea
            placeholder="Notes (optional)"
            value={newGiftNotes}
            onChange={(e) => setNewGiftNotes(e.target.value)}
            className="p-2 border rounded"
          />
          <Button type="submit">Add Gift</Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Gift List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map((gift) => (
            <div key={gift.id} className="bg-card p-4 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold">{gift.name}</h3>
              {gift.notes && <p className="text-sm mt-2">Notes: {gift.notes}</p>}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium">{gift.status}</span>
                <span className="text-sm font-bold">Priority: {gift.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipientDetailPage;
