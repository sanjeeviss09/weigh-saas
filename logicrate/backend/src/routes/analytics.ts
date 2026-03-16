import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/:formId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user!.userId;

    const form = await prisma.form.findUnique({
      where: { id: formId as string },
      include: {
        questions: true,
        feedbacks: {
          include: { answers: true }
        }
      }
    });

    if (!form || form.userId !== userId) {
      return res.status(404).json({ error: 'Form not found or unauthorized' });
    }

    const totalFeedback = form.feedbacks.length;

    // Calculate rating distribution and average rating for "rating" type questions
    const ratingDistributions: Record<string, number[]> = {}; // counts per question
    const averageRatings: Record<string, number> = {};

    form.questions.forEach((q: any) => {
      if (q.type === 'rating') {
        const counts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
        let sum = 0;
        let count = 0;
        
        form.feedbacks.forEach((f: any) => {
          const answer = f.answers.find((a: any) => a.questionId === q.id);
          if (answer) {
            const val = parseInt(answer.value, 10);
            if (!isNaN(val) && val >= 1 && val <= 5) {
              counts[val - 1]++;
              sum += val;
              count++;
            }
          }
        });

        ratingDistributions[q.id] = counts;
        averageRatings[q.id] = count > 0 ? Number((sum / count).toFixed(1)) : 0;
      }
    });

    // CSAT calculation overall
    let csatScores: number[] = [];
    Object.values(averageRatings).forEach(avg => {
      if (avg > 0) csatScores.push(avg);
    });
    const overallCsat = csatScores.length ? Number((csatScores.reduce((a,b)=>a+b, 0) / csatScores.length).toFixed(1)) : 0;

    res.json({
      totalFeedback,
      ratingDistributions,
      averageRatings,
      overallCsat,
      feedbacks: form.feedbacks // Recent responses can be taken from this array natively
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
