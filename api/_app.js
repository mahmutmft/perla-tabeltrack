import express from 'express';
import authRoutes from './_routes/auth.js';
import categoryRoutes from './_routes/categories.js';
import productRoutes from './_routes/products.js';
import tableRoutes from './_routes/tables.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
