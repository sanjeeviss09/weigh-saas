"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/:formId', auth_1.authenticate, async (req, res) => {
    try {
        const { formId } = req.params;
        const userId = req.user.userId;
        const form = await prisma.form.findUnique({
            where: { id: formId },
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
        const ratingDistributions = {}; // counts per question
        const averageRatings = {};
        form.questions.forEach((q) => {
            if (q.type === 'rating') {
                const counts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
                let sum = 0;
                let count = 0;
                form.feedbacks.forEach((f) => {
                    const answer = f.answers.find((a) => a.questionId === q.id);
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
        let csatScores = [];
        Object.values(averageRatings).forEach(avg => {
            if (avg > 0)
                csatScores.push(avg);
        });
        const overallCsat = csatScores.length ? Number((csatScores.reduce((a, b) => a + b, 0) / csatScores.length).toFixed(1)) : 0;
        res.json({
            totalFeedback,
            ratingDistributions,
            averageRatings,
            overallCsat,
            feedbacks: form.feedbacks // Recent responses can be taken from this array natively
        });
    }
    catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
