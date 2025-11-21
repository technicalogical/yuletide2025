import { Router, Request, Response } from 'express';
import { BudgetModel } from '../models/budget';
import { validate, budgetSchema } from '../middleware/validation';

const router = Router();

// GET /api/budget
router.get('/', (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : undefined;

    if (year && isNaN(targetYear!)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const budget = targetYear ? BudgetModel.getByYear(targetYear) : BudgetModel.getCurrent();

    if (!budget) {
      return res.status(404).json({ error: 'No budget found for the specified year' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/budget/analytics
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : undefined;

    if (year && isNaN(targetYear!)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const analytics = BudgetModel.getAnalytics(targetYear);

    if (!analytics) {
      return res.status(404).json({ error: 'No budget found for analytics' });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/budget
router.post('/', validate(budgetSchema), (req: Request, res: Response) => {
  try {
    const budget = BudgetModel.create(req.body);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/budget/:year
router.put('/:year', validate(budgetSchema.fork(['year'], (schema) => schema.optional())), (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const { total_budget } = req.body;

    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const budget = BudgetModel.update(year, total_budget);
    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
