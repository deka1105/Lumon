const router = require('express').Router();
const { supabase } = require('../supabase');
const requireAuth = require('../middleware/requireAuth');

// GET /api/floors — public, returns all floors with rooms + metrics
router.get('/', async (req, res) => {
  const { data: floors, error } = await supabase
    .from('floors')
    .select(`*, rooms(*, metrics(*))`)
    .order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  // sort rooms and metrics
  floors.forEach(f => {
    f.rooms = f.rooms.sort((a, b) => a.sort_order - b.sort_order);
    f.rooms.forEach(r => { r.metrics = (r.metrics || []).sort((a, b) => a.sort_order - b.sort_order); });
  });
  res.json(floors);
});

// GET /api/floors/characters — public, returns character floor access map
router.get('/characters', async (req, res) => {
  const { data, error } = await supabase.from('character_floors').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const map = {};
  data.forEach(({ character_id, floor_id }) => {
    if (!map[character_id]) map[character_id] = [];
    map[character_id].push(floor_id);
  });
  res.json(map);
});

// POST /api/floors — admin only
router.post('/', requireAuth, async (req, res) => {
  const { name, code, color, sort_order } = req.body;
  const { data, error } = await supabase.from('floors').insert({ name, code, color, sort_order }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /api/floors/:id — admin only
router.put('/:id', requireAuth, async (req, res) => {
  const { name, code, color, sort_order } = req.body;
  const { data, error } = await supabase.from('floors').update({ name, code, color, sort_order }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/floors/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('floors').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
