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
