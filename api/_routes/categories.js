import { Router } from 'express';
import { supabase, unwrap } from '../_supabase.js';
import { requireAuth, requireAdmin } from '../_auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const categories = unwrap(
      await supabase.from('categories').select('*').order('sort_order').order('name')
    );
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, sort_order } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const category = unwrap(
      await supabase
        .from('categories')
        .insert({ name: name.trim(), sort_order: sort_order ?? 0 })
        .select()
        .single()
    );
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = unwrap(
      await supabase.from('categories').select('*').eq('id', req.params.id).maybeSingle()
    );
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const { name, sort_order } = req.body;
    const category = unwrap(
      await supabase
        .from('categories')
        .update({
          name: name?.trim() || existing.name,
          sort_order: sort_order ?? existing.sort_order,
        })
        .eq('id', req.params.id)
        .select()
        .single()
    );
    res.json({ category });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    unwrap(await supabase.from('categories').delete().eq('id', req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
