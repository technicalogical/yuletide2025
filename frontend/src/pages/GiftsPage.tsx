import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GiftItem, Recipient } from '@shared/types';
import { API_BASE_URL } from '@/lib/utils';

function GiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [giftsResponse, recipientsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/items`),
          fetch(`${API_BASE_URL}/recipients`),
        ]);

        if (!giftsResponse.ok || !recipientsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const giftsData = await giftsResponse.json();
        const recipientsData = await recipientsResponse.json();

        setGifts(giftsData);
        setRecipients(recipientsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRecipientName = (recipientId: number) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    return recipient ? recipient.name : 'Unknown';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gift Ideas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift) => (
          <div key={gift.id} className="bg-card p-4 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold">{gift.name}</h2>
            <p className="text-muted-foreground">
              For: <Link to={`/recipients/${gift.recipient_id}`} className="hover:underline">{getRecipientName(gift.recipient_id)}</Link>
            </p>
            {gift.notes && <p className="text-sm mt-2">Notes: {gift.notes}</p>}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-medium">{gift.status}</span>
              <span className="text-sm font-bold">Priority: {gift.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GiftsPage;