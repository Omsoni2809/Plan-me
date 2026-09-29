import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BarChart, CheckCircle, Clock, PieChart as PieIcon } from 'lucide-react';
import { subDays, format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Analytics() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [userId]);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), count: 0 };
  });

  tasks.forEach(task => {
    if (task.status === 'completed') {
      const dayData = last7Days.find(d => d.date === task.task_date);
      if (dayData) dayData.count += 1;
    }
  });

  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  // Category Breakdown Data
  const categoryCounts = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const categoryArray = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat],
    percentage: Math.round((categoryCounts[cat] / tasks.length) * 100)
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics & Insights</h2>
        <p className="text-gray-500 dark:text-gray-400">Track your productivity trends and focus areas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3 text-blue-600"><CheckCircle size={32}/></div>
          <p className="text-3xl font-black">{completed}</p>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Total Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-full mb-3 text-purple-600"><BarChart size={32}/></div>
          <p className="text-3xl font-black">{completionRate}%</p>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Completion Rate</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-full mb-3 text-yellow-600"><Clock size={32}/></div>
          <p className="text-3xl font-black">{pending}</p>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Pending Tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Tasks Completed (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {last7Days.map((day, i) => {
              const heightPct = Math.round((day.count / maxCount) * 100);
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</span>
                  <div className="w-full max-w-[30px] bg-gray-100 dark:bg-gray-700 rounded-t-xl h-full relative flex items-end overflow-hidden">
                    <div className="w-full bg-blue-500 hover:bg-blue-400 transition-all duration-1000 ease-out rounded-t-xl" style={{ height: `${heightPct}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 mt-3">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><PieIcon className="text-purple-500"/> Focus Distribution</h3>
          <div className="space-y-4">
            {categoryArray.length === 0 ? <p className="text-gray-400 text-sm">No category data available yet.</p> : null}
            {categoryArray.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{cat.name}</span>
                  <span className="text-gray-500 font-bold">{cat.percentage}% ({cat.count})</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}