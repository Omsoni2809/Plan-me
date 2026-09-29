import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { ICON_MAP } from '../utils/categories';
import { useCategories } from '../hooks/useCategories';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EditTaskModal({ isOpen, task, onClose, onSuccess }) {
  
  // Use the hook to fetch the user's custom categories from DB
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_date: '',
    category: 'personal',
    priority: 'medium',
    status: 'pending'
  });

  const [startHour, setStartHour] = useState('12');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmPm, setStartAmPm] = useState('AM');

  const [endHour, setEndHour] = useState('12');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmPm, setEndAmPm] = useState('PM');

  const [statusState, setStatusState] = useState(null);

  // Populate data when modal opens
  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        task_date: task.task_date || '',
        category: task.category || 'personal',
        priority: task.priority || 'medium',
        status: task.status || 'pending'
      });

      const parseTime = (timeStr, defAmPm) => {
        if (!timeStr) return { h: '12', m: '00', p: defAmPm };
        const [time, p] = timeStr.split(' ');
        const [h, m] = time.split(':');
        return { h: h ? h.padStart(2, '0') : '12', m: m || '00', p: p || defAmPm };
      };

      const sTime = parseTime(task.start_time, 'AM');
      setStartHour(sTime.h);
      setStartMinute(sTime.m);
      setStartAmPm(sTime.p);

      const eTime = parseTime(task.end_time, 'PM');
      setEndHour(eTime.h);
      setEndMinute(eTime.m);
      setEndAmPm(eTime.p);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusState('saving');
    
    const start_time = `${startHour}:${startMinute} ${startAmPm}`;
    const end_time = `${endHour}:${endMinute} ${endAmPm}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, start_time, end_time })
      });

      if (res.ok) {
        setStatusState('success');
        setTimeout(() => {
          setStatusState(null);
          onSuccess(); // Refresh tasks
          onClose();
        }, 500);
      }
    } catch (error) {
      setStatusState('error');
      setTimeout(() => setStatusState(null), 3000);
    }
  };

  const priorities = [
    { id: 'low', label: 'Low', style: 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400' },
    { id: 'medium', label: 'Medium', style: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' },
    { id: 'high', label: 'High', style: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <h2 className="text-xl font-bold">Edit Task</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full text-xl font-bold bg-transparent border-none placeholder-gray-400 focus:outline-none px-0 text-gray-900 dark:text-gray-100"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add optional notes or details..."
                rows="2"
                className="w-full text-sm bg-transparent border-none placeholder-gray-400 focus:outline-none px-0 resize-none text-gray-600 dark:text-gray-300"
              />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Date & 12-Hour AM/PM Time Window */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Date & Timing</label>
              <input
                type="date"
                required
                value={formData.task_date}
                onChange={(e) => setFormData({ ...formData, task_date: e.target.value })}
                className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm outline-none mb-3 w-full sm:w-auto [color-scheme:light] dark:[color-scheme:dark]"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Time */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-400 font-semibold block mb-1">Start Time</span>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-gray-400 mr-1" />
                    <select value={startHour} onChange={e => setStartHour(e.target.value)} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-bold text-sm outline-none cursor-pointer rounded p-1">
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="font-bold">:</span>
                    <select value={startMinute} onChange={e => setStartMinute(e.target.value)} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-bold text-sm outline-none cursor-pointer rounded p-1">
                      {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={startAmPm} onChange={e => setStartAmPm(e.target.value)} className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold text-xs rounded p-1.5 outline-none ml-auto cursor-pointer">
                      <option value="AM" className="bg-white dark:bg-gray-800">AM</option>
                      <option value="PM" className="bg-white dark:bg-gray-800">PM</option>
                    </select>
                  </div>
                </div>

                {/* End Time */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-400 font-semibold block mb-1">End Time</span>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-gray-400 mr-1" />
                    <select value={endHour} onChange={e => setEndHour(e.target.value)} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-bold text-sm outline-none cursor-pointer rounded p-1">
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="font-bold">:</span>
                    <select value={endMinute} onChange={e => setEndMinute(e.target.value)} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-bold text-sm outline-none cursor-pointer rounded p-1">
                      {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={endAmPm} onChange={e => setEndAmPm(e.target.value)} className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold text-xs rounded p-1.5 outline-none ml-auto cursor-pointer">
                      <option value="AM" className="bg-white dark:bg-gray-800">AM</option>
                      <option value="PM" className="bg-white dark:bg-gray-800">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Categories (Icons Only) */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => {
                  const Icon = ICON_MAP[cat.icon] || Clock;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      title={cat.label} // Shows name on hover/long-press
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-md scale-105' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={24} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setFormData({ ...formData, priority: p.id })}
                      className={`flex items-center justify-center p-2 rounded-xl cursor-pointer border text-xs font-bold uppercase transition-all ${formData.priority === p.id ? p.style + ' shadow-sm' : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Task Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['pending', 'ongoing', 'completed'].map(st => (
                    <div
                      key={st}
                      onClick={() => setFormData({ ...formData, status: st })}
                      className={`flex items-center justify-center p-2 rounded-xl cursor-pointer border text-[11px] font-bold capitalize transition-all ${
                        formData.status === st 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="edit-task-form"
            disabled={statusState === 'saving' || !formData.title.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {statusState === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}