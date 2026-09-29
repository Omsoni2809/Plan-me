import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FocusMode() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'

  // Fetch pending tasks to focus on
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`)
      .then(res => res.json())
      .then(data => setTasks(data.filter(t => t.status === 'pending')))
      .catch(console.error);
  }, [userId]);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound when timer finishes
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      if (mode === 'focus') switchMode('break');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 pb-10">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
        
        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-full w-fit mx-auto">
          <button onClick={() => switchMode('focus')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'focus' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
            <Brain size={16} /> Focus
          </button>
          <button onClick={() => switchMode('break')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'break' ? 'bg-white dark:bg-gray-700 shadow text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
            <Coffee size={16} /> Break
          </button>
        </div>

        {/* Circular Timer Visual */}
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-700" />
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 120} strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)} className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-blue-500' : 'text-green-500'}`} strokeLinecap="round" />
          </svg>
          <div className="z-10 flex flex-col items-center">
            <span className="text-6xl font-black tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
            <span className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">
              {mode === 'focus' ? 'Work Session' : 'Relax Time'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => switchMode(mode)} className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full transition-colors">
            <RotateCcw size={24} />
          </button>
          <button onClick={() => setIsActive(!isActive)} className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95 ${mode === 'focus' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'}`}>
            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* Task Selection */}
        {mode === 'focus' && (
          <div className="text-left">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Focusing On</label>
            <select 
              value={selectedTask} 
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">No specific task (General Focus)</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

      </div>
    </div>
  );
}