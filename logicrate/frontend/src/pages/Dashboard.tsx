import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, BarChart2, Trash2, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [forms, setForms] = useState<any[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setForms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteForm = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchForms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forms</h2>
          <p className="text-muted-foreground">Manage your feedback forms here.</p>
        </div>
        <Link to="/forms/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Form
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No forms created yet. Create one to collect feedback!
          </div>
        ) : forms.map(form => (
          <div key={form.id} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="font-semibold leading-none tracking-tight">{form.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{form.description}</p>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="bg-secondary px-2.5 py-0.5 rounded-full text-secondary-foreground font-medium">
                  {form._count.feedbacks} Responses
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(form.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center border-t p-4 px-6 justify-between text-muted-foreground">
              <Link to={`/analytics/${form.id}`} className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
                <BarChart2 className="w-4 h-4" /> Analytics
              </Link>
              <div className="flex items-center gap-4">
                <a href={`/f/${form.id}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => deleteForm(form.id)} className="hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
