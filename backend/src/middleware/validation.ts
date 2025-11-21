import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

// Validation schemas
export const recipientSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  relationship: Joi.string().optional().max(50),
  budget_allocation: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(500)
});

export const giftItemSchema = Joi.object({
  recipient_id: Joi.number().integer().required(),
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().optional().max(500),
  priority: Joi.number().integer().min(1).max(5).default(1),
  status: Joi.string().valid('needed', 'researching', 'ready_to_buy', 'purchased').default('needed'),
  target_price: Joi.number().optional().min(0),
  current_best_price: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(500),
  product_url: Joi.string().uri().optional()
});

export const purchaseSchema = Joi.object({
  item_id: Joi.number().integer().required(),
  store_name: Joi.string().optional().max(100),
  purchase_price: Joi.number().required().min(0),
  purchase_date: Joi.string().required(), // ISO date string
  payment_method: Joi.string().optional().max(50),
  receipt_photo: Joi.string().optional().max(500),
  was_on_sale: Joi.boolean().optional().default(false),
  notes: Joi.string().optional().max(500)
});

export const budgetSchema = Joi.object({
  total_budget: Joi.number().required().min(0),
  year: Joi.number().integer().optional().default(new Date().getFullYear())
});
