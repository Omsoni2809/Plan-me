import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar as CalIcon, TrendingUp, Filter, PlayCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import EditTaskModal from '../components/EditTaskModal'; // <-- IMPORT THE NEW MODAL

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { userId } = useAuth(); // Get Clerk User ID
  const [tasks, setTasks] = useState([]);
  const [timeframe, setTimeframe] = useState('today'); // 'today', 'all'
  const [sortBy, setSortBy] = useState('time'); // 'time', 'priority', 'category'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = () => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  // --- Dynamic Greeting ---
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  let emoji = '🌙';
  if (hour < 12) {
    greeting = 'Good Morning';
    emoji = '☀️';
  } else if (hour < 17) {
    greeting = 'Good Afternoon';
    emoji = '☕';
  }

  // --- Filtering (Past/Present ONLY) ---
  const todayStr = new Date().toISOString().split('T')[0];

  // Strictly filter out future tasks: only past dates or today
  const historicalAndPresentTasks = tasks.filter(t => t.task_date <= todayStr);

  const filteredTasks = historicalAndPresentTasks.filter(t => {
    if (timeframe === 'today') return t.task_date === todayStr;
    return true; // All past history
  });

  // Unique ongoing task
  const ongoingTask = tasks.find(t => t.status === 'ongoing');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const productivityScore = filteredTasks.length === 0 ? 0 : Math.round((completedTasks.length / filteredTasks.length) * 100);

  const getCategoryPercentage = (catName) => {
    if (filteredTasks.length === 0) return '0%';
    const catTasks = filteredTasks.filter(t => (t.category || '').toLowerCase() === catName.toLowerCase());
    return `${Math.round((catTasks.length / filteredTasks.length) * 100)}%`;
  };

  const setStatus = async (taskId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Sorting ---
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') return priorityWeight[b.priority] - priorityWeight[a.priority];
    if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
    if (a.task_date !== b.task_date) return a.task_date.localeCompare(b.task_date);
    const timeA = a.start_time || '24:00';
    const timeB = b.start_time || '24:00';
    return timeA.localeCompare(timeB);
  });

  // --- UI Dictionaries ---
  const catColors = {
    education: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    work: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    fitness: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    personal: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' }
  };

  const priorityStyles = {
    high: 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
    medium: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
    low: 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* --- RENDER THE EXTRACTED EDIT MODAL HERE --- */}
      <EditTaskModal 
        isOpen={isEditModalOpen} 
        task={editingTask} 
        onClose={() => { setIsEditModalOpen(false); setEditingTask(null); }} 
        onSuccess={fetchTasks} 
      />

      {/* Ongoing Focus Banner */}
      {ongoingTask ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer" onClick={() => { setEditingTask(ongoingTask); setIsEditModalOpen(true); }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl animate-pulse">
              <PlayCircle size={32} />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">Current Ongoing Task</span>
              <h3 className="text-2xl font-bold">{ongoingTask.title}</h3>
              <p className="text-xs text-blue-100 mt-1 capitalize">{ongoingTask.category} • {ongoingTask.start_time || 'In Progress'}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setStatus(ongoingTask.id, 'completed'); }}
            className="px-5 py-2.5 bg-white text-blue-600 font-bold rounded-full text-sm shadow hover:bg-blue-50 transition-colors"
          >
            Mark Done
          </button>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">
          No task is currently in <span className="font-bold text-blue-600">ongoing</span> status. Edit a task and mark it Ongoing to track your live focus.
        </div>
      )}

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">{greeting}! {emoji}</h2>
          <p className="text-gray-500 dark:text-gray-400">Past & completed records overview.</p>
        </div>
        
        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-xl w-fit">
          <button onClick={() => setTimeframe('today')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${timeframe === 'today' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>Today</button>
          <button onClick={() => setTimeframe('all')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${timeframe === 'all' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>All History</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Tracked" value={filteredTasks.length} />
        <StatCard title="Completed" value={completedTasks.length} valueColor="text-green-500" />
        <StatCard title="Pending" value={pendingTasks.length} valueColor="text-yellow-500" />
        <StatCard title="Rate" value={`${productivityScore}%`} valueColor="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SCHEDULE VIEW --- */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[500px] max-h-[700px]">
          
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CalIcon size={20} className="text-blue-500"/> 
              {timeframe === 'today' ? "Today's Agenda" : "History Log"}
            </h3>
            
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
              <Filter size={14} className="text-gray-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
              >
                <option value="time" className="bg-white dark:bg-gray-800">Sort by Time</option>
                <option value="priority" className="bg-white dark:bg-gray-800">Sort by Priority</option>
                <option value="category" className="bg-white dark:bg-gray-800">Sort by Category</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {sortedTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="font-medium text-gray-500">Your schedule is clear!</p>
              </div>
            ) : (
              sortedTasks.map(task => {
                const style = catColors[task.category] || catColors.personal;
                const pStyle = priorityStyles[task.priority] || priorityStyles.low;

                return (
                  <div 
                    key={task.id} 
                    onClick={() => { setEditingTask(task); setIsEditModalOpen(true); }}
                    className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 gap-4 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className={`font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                          {task.title}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                          task.status === 'ongoing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : ''
                        }`}>
                          {task.status === 'pending' ? '' : task.status}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                          {task.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${pStyle}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-4">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {task.start_time || '--:--'} {task.end_time && `- ${task.end_time}`}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        {task.task_date}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- CATEGORIES BREAKDOWN --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[500px]">
          <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-gray-100">Focus Areas</h3>
          
          <div className="space-y-8 flex-1 justify-center flex flex-col px-2">
            <CategoryBar name="Education" percentage={getCategoryPercentage('education')} color="bg-blue-500" bgDark="dark:bg-blue-900/30" />
            <CategoryBar name="Work" percentage={getCategoryPercentage('work')} color="bg-purple-500" bgDark="dark:bg-purple-900/30" />
            <CategoryBar name="Fitness" percentage={getCategoryPercentage('fitness')} color="bg-green-500" bgDark="dark:bg-green-900/30" />
            <CategoryBar name="Personal" percentage={getCategoryPercentage('personal')} color="bg-yellow-500" bgDark="dark:bg-yellow-900/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, valueColor }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md cursor-default">
      <p className="text-xs font-bold text-gray-400 uppercase">{title}</p>
      <p className={`text-3xl font-black mt-1 ${valueColor || 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
    </div>
  );
}

function CategoryBar({ name, percentage, color, bgDark }) {
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-2.5">
        <span className="font-bold text-gray-700 dark:text-gray-300">{name}</span>
        <span className="text-gray-500 font-bold">{percentage}</span>
      </div>
      <div className={`w-full bg-gray-100 ${bgDark || 'dark:bg-gray-700'} rounded-full h-3 overflow-hidden shadow-inner`}>
        <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: percentage }}></div>
      </div>
    </div>
  );
}