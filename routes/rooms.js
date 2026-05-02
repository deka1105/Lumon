const router = require('express').Router();
const { supabase } = require('../supabase');
const requireAuth = require('../middleware/requireAuth');

// POST /api/rooms — admin only
router.post('/', requireAuth, async (req, res) => {
  const { floor_id, type, title, subtitle, description, tags, image_url, link, github, layout_row, layout_col, connection_type, sort_order } = req.body;
  const { data, error } = await supabase.from('rooms').insert({ floor_id, type, title, subtitle, description, tags, image_url, link, github, layout_row, layout_col, connection_type, sort_order }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /api/rooms/:id — admin only
router.put('/:id', requireAuth, async (req, res) => {
  const allowed = ['type','title','subtitle','description','tags','image_url','link','github','layout_row','layout_col','connection_type','sort_order'];
  const update = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  const { data, error } = await supabase.from('rooms').update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/rooms/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('rooms').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// PUT /api/rooms/:id/metrics — replace all metrics for a room
router.put('/:id/metrics', requireAuth, async (req, res) => {
  const roomId = req.params.id;
  await supabase.from('metrics').delete().eq('room_id', roomId);
  const metrics = (req.body.metrics || []).map((m, i) => ({ room_id: roomId, label: m.label, value: m.value, sort_order: i }));
  if (metrics.length === 0) return res.json([]);
  const { data, error } = await supabase.from('metrics').insert(metrics).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
