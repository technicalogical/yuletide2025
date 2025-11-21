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
