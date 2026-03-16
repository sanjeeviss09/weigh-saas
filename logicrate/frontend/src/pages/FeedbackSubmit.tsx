import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, CheckCircle } from 'lucide-react';

export default function FeedbackSubmit() {
  const { formId } = useParams();
  const [form, setForm] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/forms/${formId}`)
      .then(res => setForm(res.data))
      .catch(() => setError('Form not found or unavailable'));
  }, [formId]);

  const handleRating = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value.toString() }));
  };

  const handleText = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitFeedback = async () => {
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      value: answers[qId]
    }));

    if (formattedAnswers.length === 0) {
      alert('Please answer at least one question');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/feedback/${formId}`, { answers: formattedAnswers });
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  if (error) return <div className="text-center mt-20 text-destructive">{error}</div>;
  if (!form) return <div className="text-center mt-20 text-muted-foreground animate-pulse">Loading form...</div>;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">Your feedback has been successfully submitted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">{form.title}</h1>
          {form.description && <p className="mt-4 text-lg text-muted-foreground">{form.description}</p>}
        </div>

        <div className="bg-card shadow-sm border rounded-xl overflow-hidden divide-y">
          {form.questions.map((q: any, i: number) => (
            <div key={q.id} className="p-6 space-y-4">
              <label className="text-lg font-medium block">
                {i + 1}. {q.text}
              </label>
              
              {q.type === 'rating' ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`p-2 rounded-full transition-colors ${parseInt(answers[q.id] || '0') >= star ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-200'}`}
                      onClick={() => handleRating(q.id, star)}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full bg-background border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={4}
                  placeholder="Your answer..."
                  value={answers[q.id] || ''}
                  onChange={e => handleText(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={submitFeedback}
          className="w-full py-4 text-lg font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
