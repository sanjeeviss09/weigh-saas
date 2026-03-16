import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, MessageSquare, Star, Target } from 'lucide-react';

export default function Analytics() {
  const { formId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/analytics/${formId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [formId]);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-muted rounded w-3/4"></div></div></div>;
  if (!data) return <div>Failed to load analytics</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Insights and responses for your form.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full"><MessageSquare className="w-6 h-6"/></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
            <h3 className="text-2xl font-bold">{data.totalFeedback}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full"><Star className="w-6 h-6"/></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
            <h3 className="text-2xl font-bold">
              {Object.values(data.averageRatings).length > 0 
                ? (Object.values(data.averageRatings) as number[]).reduce((a: number,b: number)=>a+b, 0) / Object.values(data.averageRatings).length
                : 0} / 5
            </h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-full"><Target className="w-6 h-6"/></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CSAT Score</p>
            <h3 className="text-2xl font-bold">{data.overallCsat ? ((data.overallCsat / 5) * 100).toFixed(0) : 0}%</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg">Rating Distribution</h3>
        </div>
        <div className="p-6">
          {Object.keys(data.ratingDistributions).length === 0 ? (
            <p className="text-muted-foreground">No rating questions found to display.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {Object.keys(data.ratingDistributions).map(qId => {
                const dist = data.ratingDistributions[qId];
                const chartData = [1, 2, 3, 4, 5].map((star, i) => ({ name: `${star} Star`, count: dist[i] }));
                const avg = data.averageRatings[qId];
                
                return (
                  <div key={qId} className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <span className="font-medium text-sm text-muted-foreground">Question ID: {qId.slice(0,6)}...</span>
                      <span className="font-bold flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/> {avg}</span>
                    </div>
                    <div className="h-48 w-full border rounded-lg bg-muted/20 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {
                              chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
         <div className="p-6 border-b">
          <h3 className="font-semibold text-lg">Recent Responses</h3>
        </div>
        <div className="p-0 border-t-0 divide-y max-h-96 overflow-y-auto">
           {data.feedbacks.length === 0 ? (
             <p className="p-6 text-muted-foreground">No feedback received yet.</p>
           ) : (
             data.feedbacks.map((f: any) => (
               <div key={f.id} className="p-6 hover:bg-muted/30 transition-colors">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-1 rounded">Response #{f.id.slice(0, 8)}</span>
                   <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</span>
                 </div>
                 <div className="space-y-3 mt-4">
                   {f.answers.map((a: any) => (
                     <div key={a.id} className="flex flex-col gap-1">
                       <span className="text-sm font-medium italic text-muted-foreground">Q: {a.questionId.slice(0,6)}...</span>
                       <span className="text-sm font-medium bg-background border px-3 py-2 rounded-md">{a.value}</span>
                     </div>
                   ))}
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
