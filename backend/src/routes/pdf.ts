import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/extract', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const data = await pdf(req.file.buffer);
    res.json({ text: data.text });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to parse PDF.' });
  }
});

export default router;
