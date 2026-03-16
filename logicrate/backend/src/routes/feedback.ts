import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Submit feedback for a form
router.post('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body; // Array of { questionId, value }

    if (!answers || !answers.length) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        formId,
        answers: {
          create: answers.map((a: any) => ({
            questionId: a.questionId,
            value: a.value
          }))
        }
      }
    });

    res.status(201).json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
