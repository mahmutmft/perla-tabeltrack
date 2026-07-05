import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase, unwrap } from '../_supabase.js';
import { signToken, requireAuth, requireAdmin } from '../_auth.js';

const router = Router();

const PIN_RE = /^\d{4}$/;

async function userCount() {
  const { data, error } = await supabase.from('users').select('id').limit(1);
  if (error) throw new Error(error.message);
  return data.length;
}

async function findByPin(pin) {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return data.find((u) => bcrypt.compareSync(String(pin), u.pin_hash)) || null;
}

async function pinInUse(pin) {
  return (await findByPin(pin)) !== null;
}

function publicUser(u) {
  return { id: u.id, name: u.name, role: u.role, created_at: u.created_at };
}

router.get('/bootstrap-needed', async (req, res, next) => {
  try {
    res.json({ needed: (await userCount()) === 0 });
  } catch (err) {
    next(err);
  }
});

router.post('/bootstrap', async (req, res, next) => {
  try {
    if ((await userCount()) > 0) return res.status(409).json({ error: 'Setup already completed' });
    const { name, pin } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!PIN_RE.test(pin || '')) return res.status(400).json({ error: 'PIN must be exactly 4 digits' });

    const pinHash = bcrypt.hashSync(pin, 10);
    const user = unwrap(
      await supabase
        .from('users')
        .insert({ name: name.trim(), pin_hash: pinHash, role: 'admin' })
        .select()
        .single()
    );
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!PIN_RE.test(pin || '')) return res.status(400).json({ error: 'Enter your 4-digit PIN' });

    const user = await findByPin(pin);
    if (!user) return res.status(401).json({ error: 'PIN not recognized' });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = unwrap(await supabase.from('users').select('*').eq('id', req.user.id).maybeSingle());
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = unwrap(await supabase.from('users').select('*').order('name'));
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
});

router.post('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, pin, role } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!PIN_RE.test(pin || '')) return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    if (await pinInUse(pin)) return res.status(409).json({ error: 'That PIN is already in use — pick another' });
    const finalRole = role === 'admin' ? 'admin' : 'waiter';

    const pinHash = bcrypt.hashSync(pin, 10);
    const user = unwrap(
      await supabase
        .from('users')
        .insert({ name: name.trim(), pin_hash: pinHash, role: finalRole })
        .select()
        .single()
    );
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: "You can't delete your own account" });
    }
    unwrap(await supabase.from('users').delete().eq('id', req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
