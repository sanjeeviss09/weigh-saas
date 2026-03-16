import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';

export default function FormBuilder() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ id: Date.now(), text: '', type: 'rating' }]);
  const navigate = useNavigate();

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: '', type: 'rating' }]);

  const updateQuestion = (id: number, field: string, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveForm = async () => {
    if(!title) return alert('Title is required');
    if(questions.some(q => !q.text)) return alert('All questions need text');
    
    try {
      await axios.post('http://localhost:5000/api/forms', {
        title,
        description,
        questions: questions.map(({ text, type }) => ({ text, type }))
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/');
    } catch (err) {
      alert('Failed to save form');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Build Form</h2>
        <button onClick={saveForm} className="bg-primary text-primary-foreground font-medium px-4 py-2 rounded-md hover:opacity-90">
          Save Form
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
          <input 
            type="text" 
            placeholder="Form Title" 
            className="w-full text-2xl font-bold bg-transparent border-0 border-b pb-2 focus:ring-0 focus:outline-none focus:border-primary placeholder:text-muted"
            value={title} onChange={e => setTitle(e.target.value)} 
          />
          <textarea 
            placeholder="Form Description (optional)" 
            className="w-full bg-transparent border-0 border-b pb-2 focus:ring-0 focus:outline-none focus:border-primary placeholder:text-muted resize-none"
            value={description} onChange={e => setDescription(e.target.value)} 
            rows={2}
          />
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-card border rounded-lg p-6 shadow-sm flex gap-4 group">
              <div className="text-muted-foreground mt-2 cursor-grab"><GripVertical className="w-5 h-5"/></div>
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder={`Question ${i + 1}`} 
                    className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} 
                  />
                  <select 
                    className="px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring w-48"
                    value={q.type} onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                  >
                    <option value="rating">1-5 Rating</option>
                    <option value="text">Text Input</option>
                  </select>
                </div>
              </div>
              <button onClick={() => removeQuestion(q.id)} className="text-muted-foreground hover:text-destructive self-start mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Question
        </button>
      </div>
    </div>
  );
}
