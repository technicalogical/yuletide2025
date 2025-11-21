import { Router, Request, Response } from 'express';
import { PurchaseModel } from '../models/purchase';
import { validate, purchaseSchema } from '../middleware/validation';

const router = Router();

// GET /api/purchases
router.get('/', (req: Request, res: Response) => {
  try {
    const purchases = PurchaseModel.getAll();
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/purchases/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const purchase = PurchaseModel.getById(id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/purchases
router.post('/', validate(purchaseSchema), (req: Request, res: Response) => {
  try {
    const purchase = PurchaseModel.create(req.body);
    res.status(201).json(purchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/purchases/:id
router.put('/:id', validate(purchaseSchema.fork(['item_id', 'purchase_price', 'purchase_date'], (schema) => schema.optional())), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const purchase = PurchaseModel.update(id, req.body);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/purchases/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const deleted = PurchaseModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
