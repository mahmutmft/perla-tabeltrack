import { Router } from 'express';
import { supabase, unwrap } from '../_supabase.js';
import { requireAuth, requireAdmin } from '../_auth.js';

const router = Router();

function normalize(p) {
  const { category, ...rest } = p;
  return { ...rest, price: Number(p.price), category_name: category?.name ?? null };
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { q, category_id } = req.query;
    let query = supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('active', true);
    if (q) query = query.ilike('name', `%${q}%`);
    if (category_id) query = query.eq('category_id', category_id);
    query = query.order('name');

    const products = unwrap(await query);
    res.json({ products: products.map(normalize) });
  } catch (err) {
    next(err);
  }
});

router.get('/all', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const products = unwrap(
      await supabase
        .from('products')
        .select('*, category:categories(name)')
        .order('active', { ascending: false })
        .order('name')
    );
    res.json({ products: products.map(normalize) });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, category_id, price } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const product = unwrap(
      await supabase
        .from('products')
        .insert({ name: name.trim(), category_id: category_id || null, price: Number(price) || 0 })
        .select('*, category:categories(name)')
        .single()
    );
    res.status(201).json({ product: normalize(product) });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = unwrap(
      await supabase.from('products').select('*').eq('id', req.params.id).maybeSingle()
    );
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, category_id, price, active } = req.body;
    const product = unwrap(
      await supabase
        .from('products')
        .update({
          name: name?.trim() || existing.name,
          category_id: category_id ?? existing.category_id,
          price: price ?? existing.price,
          active: active === undefined ? existing.active : Boolean(active),
        })
        .eq('id', req.params.id)
        .select('*, category:categories(name)')
        .single()
    );
    res.json({ product: normalize(product) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    unwrap(await supabase.from('products').update({ active: false }).eq('id', req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
