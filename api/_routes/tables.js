import { Router } from 'express';
import { supabase, unwrap } from '../_supabase.js';
import { requireAuth } from '../_auth.js';

const router = Router();

function withTotal(table) {
  const items = (table.items || [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((i) => ({ ...i, price_snapshot: Number(i.price_snapshot) }));
  const total = items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0);
  return { ...table, items, total };
}

async function getTableWithItems(id) {
  const table = unwrap(
    await supabase.from('tables').select('*, items:order_items(*)').eq('id', id).maybeSingle()
  );
  return table ? withTotal(table) : null;
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const tables = unwrap(
      await supabase
        .from('tables')
        .select('*, items:order_items(*)')
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
    );
    res.json({ tables: tables.map(withTotal) });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Table name is required' });
    const table = unwrap(
      await supabase
        .from('tables')
        .insert({ name: name.trim(), status: 'open', opened_by: req.user.id })
        .select('*, items:order_items(*)')
        .single()
    );
    res.status(201).json({ table: withTotal(table) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const table = await getTableWithItems(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json({ table });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/items', requireAuth, async (req, res, next) => {
  try {
    const table = unwrap(
      await supabase.from('tables').select('*').eq('id', req.params.id).maybeSingle()
    );
    if (!table) return res.status(404).json({ error: 'Table not found' });
    if (table.status !== 'open') return res.status(400).json({ error: 'Table is already closed' });

    const { product_id, quantity } = req.body;
    const qty = Math.max(1, Number(quantity) || 1);
    const product = unwrap(
      await supabase.from('products').select('*').eq('id', product_id).maybeSingle()
    );
    if (!product) return res.status(400).json({ error: 'Product not found' });

    const existing = unwrap(
      await supabase
        .from('order_items')
        .select('*')
        .eq('table_id', table.id)
        .eq('product_id', product.id)
        .eq('delivered', false)
        .maybeSingle()
    );

    if (existing) {
      unwrap(
        await supabase
          .from('order_items')
          .update({ quantity: existing.quantity + qty })
          .eq('id', existing.id)
      );
    } else {
      unwrap(
        await supabase.from('order_items').insert({
          table_id: table.id,
          product_id: product.id,
          name_snapshot: product.name,
          price_snapshot: product.price,
          quantity: qty,
        })
      );
    }

    res.status(201).json({ table: await getTableWithItems(table.id) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    const item = unwrap(
      await supabase
        .from('order_items')
        .select('*')
        .eq('id', req.params.itemId)
        .eq('table_id', req.params.id)
        .maybeSingle()
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { delivered, quantity } = req.body;
    unwrap(
      await supabase
        .from('order_items')
        .update({
          delivered: delivered === undefined ? item.delivered : Boolean(delivered),
          quantity: quantity === undefined ? item.quantity : Math.max(1, Number(quantity)),
        })
        .eq('id', item.id)
    );

    res.json({ table: await getTableWithItems(req.params.id) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    unwrap(
      await supabase
        .from('order_items')
        .delete()
        .eq('id', req.params.itemId)
        .eq('table_id', req.params.id)
    );
    const table = await getTableWithItems(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json({ table });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pay', requireAuth, async (req, res, next) => {
  try {
    const table = await getTableWithItems(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    if (table.status !== 'open') return res.status(400).json({ error: 'Table is already closed' });

    unwrap(
      await supabase
        .from('tables')
        .update({ status: 'paid', closed_at: new Date().toISOString() })
        .eq('id', table.id)
    );

    const updated = await getTableWithItems(table.id);
    res.json({ table: updated, total: table.total, method: req.body.method || 'cash' });
  } catch (err) {
    next(err);
  }
});

export default router;
