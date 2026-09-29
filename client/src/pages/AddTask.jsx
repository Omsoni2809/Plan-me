import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function AddTask() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    category: 'education',
    priority: 'medium'
  });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
        // Reset the form
        setFormData({ ...formData, title: '', description: '' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        // Handle server errors (e.g., 500 or 400)
        const errorData = await res.json();
        console.error("Server error:", errorData);
        setStatus('error');
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      // Handle network errors (server is down)
      console.error("Network error:", error);
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Task Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Complete AI assignment" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date</label>
            <input required type="date" name="task_date" value={formData.task_date} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Time</label>
            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Time</label>
            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none">
              <option value="education">Education</option>
              <option value="work">Work</option>
              <option value="fitness">Fitness</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={status === 'saving'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Save size={20} />
          {status === 'saving' ? 'Saving...' : 'Save Task'}
        </button>

        {status === 'success' && (
          <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-center text-sm">
            Task saved successfully!
          </div>
        )}
        {status === 'error' && (
          <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg flex justify-center items-center gap-2 text-sm">
            <AlertCircle size={16} /> Failed to save task. Is the server running?
          </div>
        )}
      </form>
    </div>
  );
}