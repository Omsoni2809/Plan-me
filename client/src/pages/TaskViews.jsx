import { useState, useEffect, useCallback } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { List, Calendar as CalIcon, Clock, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

import EditTaskModal from '../components/EditTaskModal'; // Import the Edit Modal

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TaskViews() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); 
  
  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // DEFAULT SORT BY PRIORITY
  const [sortBy, setSortBy] = useState('priority'); 

  // Calendar & Modal States
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- Actions ---
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) return { ...t, status: newStatus };
      // If setting a new task to ongoing, visually demote the current ongoing task
      if (newStatus === 'ongoing' && t.status === 'ongoing') return { ...t, status: 'pending' };
      return t;
    }));
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Silently fetch to ensure exact sync with DB
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status:", error);
      fetchTasks(); // Revert on error
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete task");
    } catch (error) {
      console.error("Failed to delete task:", error);
      fetchTasks();
    }
  };

  // --- Filtering Logic ---
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !filterDate || task.task_date === filterDate;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesDate && matchesStatus && matchesCategory && matchesPriority;
  });

  // --- Priority Sorting Logic ---
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff; // Sort High -> Medium -> Low
    }
    if (sortBy === 'category') {
      const cDiff = (a.category || '').localeCompare(b.category || '');
      if (cDiff !== 0) return cDiff;
    }
    
    // Fallback sorting by Date then Time
    if (a.task_date !== b.task_date) return a.task_date.localeCompare(b.task_date);
    const timeA = a.start_time || '24:00';
    const timeB = b.start_time || '24:00';
    return timeA.localeCompare(timeB);
  });

  // --- Calendar Logic ---
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // --- UI Dictionaries ---
  const catStyles = {
    education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    work: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    fitness: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    personal: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  };

  const priorityCardStyles = {
    high: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/60',
    medium: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/60',
    low: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
  };

  const priorityChipStyles = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border border-yellow-200',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200'
  };

  // Reusable Task Card Component
  const TaskCard = ({ task }) => {
    const isDone = task.status === 'completed';
    const cardStyle = priorityCardStyles[task.priority] || priorityCardStyles.low;
    const catStyle = catStyles[task.category] || catStyles.personal;

    return (
      <div className={`group p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardStyle}`}>
        
        {/* Task Details */}
        <div className="flex-1 min-w-0 w-full">
          <h3 className={`font-bold text-[16px] truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
            {task.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 font-medium"><CalIcon size={12}/> {task.task_date}</span>
            {task.start_time && (
              <span className="flex items-center gap-1 font-medium">
                <Clock size={12}/> {task.start_time} - {task.end_time || '--:--'}
              </span>
            )}
            {task.category && (
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${catStyle}`}>
                {task.category}
              </span>
            )}
            {task.priority && (
              <span className="font-bold uppercase opacity-80">
                {task.priority} Priority
              </span>
            )}
          </div>
        </div>

        {/* Status Dropdown & Actions (Mobile responsive row) */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0 pt-3 sm:pt-0 border-t border-gray-200/50 sm:border-0 dark:border-gray-700/50">
          
          {/* Custom Status Dropdown */}
          <div className="relative flex items-center">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              className={`appearance-none text-[11px] font-extrabold uppercase px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-colors border pr-7 ${
                task.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:border-green-800 dark:text-green-400' : 
                task.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400 shadow-inner' : 
                'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              <option value="pending" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Pending</option>
              <option value="ongoing" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Ongoing</option>
              <option value="completed" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Completed</option>
            </select>
            <div className="absolute right-2 pointer-events-none">
              <ChevronDown size={14} className={
                task.status === 'completed' ? 'text-green-600 dark:text-green-400' : 
                task.status === 'ongoing' ? 'text-blue-600 dark:text-blue-400' : 
                'text-gray-500 dark:text-gray-400'
              } />
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => { setEditingTask(task); setIsEditModalOpen(true); }} 
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
              title="Edit Task"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => handleDelete(task.id)} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* EXTRACTED EDIT MODAL */}
      <EditTaskModal 
        isOpen={isEditModalOpen} 
        task={editingTask} 
        onClose={() => { setIsEditModalOpen(false); setEditingTask(null); }} 
        onSuccess={fetchTasks} 
      />

      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold px-2 text-gray-900 dark:text-gray-100">All Tasks</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {viewMode === 'list' && (
            <>
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]" 
              />

              <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2">
                <Filter size={14} className="text-gray-400" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none cursor-pointer">
                  <option value="all" className="bg-white dark:bg-gray-800">All Status</option>
                  <option value="pending" className="bg-white dark:bg-gray-800">Pending</option>
                  <option value="ongoing" className="bg-white dark:bg-gray-800">Ongoing</option>
                  <option value="completed" className="bg-white dark:bg-gray-800">Completed</option>
                </select>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none cursor-pointer capitalize">
                  <option value="all" className="bg-white dark:bg-gray-800">All Categories</option>
                  {[...new Set(tasks.map(t => t.category))].map(c => (
                    <option key={c} value={c} className="bg-white dark:bg-gray-800">{c}</option>
                  ))}
                </select>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer">
                  <option value="priority" className="bg-white dark:bg-gray-800">Sort: Priority</option>
                  <option value="time" className="bg-white dark:bg-gray-800">Sort: Time</option>
                  <option value="category" className="bg-white dark:bg-gray-800">Sort: Category</option>
                </select>
              </div>
            </>
          )}

          {/* View Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700 ml-auto shrink-0">
            <button 
              onClick={() => setViewMode('list')} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <List size={16} /> List
            </button>
            <button 
              onClick={() => setViewMode('calendar')} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <CalIcon size={16} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No tasks found matching your criteria.</p>
            </div>
          ) : (
            sortedTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}

      {/* --- GRID CALENDAR VIEW --- */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors text-gray-700 dark:text-gray-200">
                Today
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200">
                <ChevronRight size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>

          <div className="overflow-x-auto flex-1">
            <div className="min-w-[800px] h-full flex flex-col">
              <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 flex-1">
                {calendarDays.map((day, idx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const dayTasks = tasks.filter(t => t.task_date === dayStr);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  dayTasks.sort((a, b) => (a.start_time || '24:00').localeCompare(b.start_time || '24:00'));

                  return (
                    <div 
                      key={dayStr} 
                      className={`min-h-[130px] p-1 border-b border-r border-gray-200 dark:border-gray-700/50 flex flex-col ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'} ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                    >
                      <div className="flex justify-between items-center p-1 mb-1">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isTodayDate ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                          {format(day, 'd')}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1 overflow-y-auto flex-1 px-1">
                        {dayTasks.map(task => {
                          const isDone = task.status === 'completed';
                          const chipStyle = priorityChipStyles[task.priority] || priorityChipStyles.low;
                          return (
                            <div 
                              key={task.id} 
                              onClick={() => { setEditingTask(task); setIsEditModalOpen(true); }}
                              className={`text-[11px] font-medium truncate px-2 py-1 rounded cursor-pointer transition-transform hover:scale-[1.02] ${isDone ? 'opacity-50 line-through bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : chipStyle}`}
                              title={task.title}
                            >
                              {task.start_time && <span className="opacity-75 mr-1">{task.start_time}</span>}
                              {task.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}