import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create a new form
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { title, description, questions } = req.body;

    if (!title || !questions || !questions.length) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const form = await prisma.form.create({
      data: {
        userId,
        title,
        description,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error('Create Form Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's forms
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const forms = await prisma.form.findMany({
      where: { userId },
      include: {
        _count: {
          select: { feedbacks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific form with questions
router.get('/:id', async (req, res) => {
  try {
    // This endpoint can be public for customers to see the form
    const form = await prisma.form.findUnique({
      where: { id: req.params.id as string },
      include: { questions: true }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Omit sensitive data if any
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a form
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const form = await prisma.form.findUnique({ where: { id: req.params.id as string } });
    
    if (!form || form.userId !== userId) {
      return res.status(404).json({ error: 'Form not found or unauthorized' });
    }

    await prisma.form.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
