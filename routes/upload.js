const router = require('express').Router();
const multer = require('multer');
const { supabase } = require('../supabase');
const requireAuth = require('../middleware/requireAuth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const ext = req.file.originalname.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('project-images')
    .upload(filename, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (error) return res.status(500).json({ error: error.message });
  const { data } = supabase.storage.from('project-images').getPublicUrl(filename);
  res.json({ url: data.publicUrl });
});

module.exports = router;
