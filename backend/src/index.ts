import express from 'express';
import cors from 'cors';
import recipientsRouter from './routes/recipients';
import giftItemsRouter from './routes/giftItems';
import purchasesRouter from './routes/purchases';
import budgetRouter from './routes/budget';

const app = express();
const PORT = process.env.PORT || 3201;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/recipients', recipientsRouter);
app.use('/api/items', giftItemsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/budget', budgetRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
