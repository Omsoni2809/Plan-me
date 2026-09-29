import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Sun, Moon, Plus, LayoutDashboard, Calendar as CalendarIcon, Sparkles, Menu, X, PieChart, Settings as SettingsIcon, FileText } from 'lucide-react';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react'; 

// Import all your functional pages
import Dashboard from './pages/Dashboard';
import TaskViews from './pages/TaskViews';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Reports from './pages/reports';
import NewTaskModal from './components/NewTaskModal'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function NavLink({ to, icon: Icon, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={20} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} /> 
      {children}
    </Link>
  );
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark'; 
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); 
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false); 

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  // --- SYNC USER TO MONGODB ---
  useEffect(() => {
    const syncUserToDatabase = async () => {
      if (isLoaded && user) {
        try {
          const token = await getToken();
          await fetch(`${API_BASE_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              clerkId: user.id,
              name: user.fullName || user.firstName || 'Unknown User',
              email: user.primaryEmailAddress?.emailAddress || 'no-email@planme.com'
            })
          });
        } catch (error) {
          console.error("Failed to sync user to database:", error);
        }
      }
    };
    syncUserToDatabase();
  }, [user, isLoaded, getToken]);

  // --- DARK MODE TOGGLE ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle responsive sidebar behavior on mobile navigation
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-hidden transition-colors duration-200">
      
      <NewTaskModal 
        isOpen={isNewTaskOpen} 
        onClose={() => setIsNewTaskOpen(false)} 
      />

      {/* --- HEADER --- */}
      <header className="z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col">
            <Link to="/" className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
              Plan Me
            </Link>
            <span className="hidden sm:block text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">
              Smart AI-powered calendar & task manager
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button 
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-md active:scale-95"
          >
            <Plus size={18}/> <span className="hidden sm:inline">New Task</span>
          </button>
          
          <button 
            onClick={() => setIsAIOpen(!isAIOpen)}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold rounded-full transition-all shadow-md active:scale-95 border ${
              isAIOpen 
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:shadow-purple-600/20'
            }`}
          >
            <Sparkles size={18}/> <span className="hidden sm:inline">AI Assistant</span>
          </button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
          >
            {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
          </button>

          <div className="ml-1 flex items-center justify-center">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border-2 border-transparent hover:border-blue-500 transition-all",
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`absolute lg:relative z-50 transition-transform duration-300 ease-in-out flex-shrink-0 bg-white dark:bg-gray-900 lg:bg-white/40 lg:dark:bg-gray-900/40 lg:backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 h-full overflow-hidden ${
            isSidebarOpen ? 'translate-x-0 w-64 border-r' : '-translate-x-full lg:translate-x-0 w-0 border-r-0'
          }`}
        >
          <div className="w-64 h-full flex flex-col p-4">
            
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between lg:hidden mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-4 mt-2 lg:mt-0">Overview</p>
              <NavLink to="/" icon={LayoutDashboard} onClick={handleNavClick}>Dashboard</NavLink>
              <NavLink to="/tasks" icon={CalendarIcon} onClick={handleNavClick}>All Tasks</NavLink>
              
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-4 mt-6">Productivity & Data</p>
              <NavLink to="/analytics" icon={PieChart} onClick={handleNavClick}>Analytics</NavLink>
              <NavLink to="/reports" icon={FileText} onClick={handleNavClick}>Reports & PDF</NavLink>

              <div className="mt-auto pt-6">
                <NavLink to="/settings" icon={SettingsIcon} onClick={handleNavClick}>Settings</NavLink>
              </div>
            </div>
          </div>
        </aside>

        {/* Middle Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 bg-gray-50/50 dark:bg-gray-900/50 transition-all duration-300">
          <div className="max-w-6xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskViews />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* AI Assistant Sidebar */}
        <aside 
          className={`absolute right-0 lg:relative z-50 transition-transform duration-300 ease-in-out flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[-4px_0_24px_rgba(0,0,0,0.2)] ${
            isAIOpen ? 'translate-x-0 w-full sm:w-[380px] border-l' : 'translate-x-full lg:w-0 lg:translate-x-0 border-l-0 overflow-hidden'
          }`}
        >
          <div className="w-full sm:w-[380px] h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 flex-shrink-0">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
                <Sparkles size={20} /> AI Assistant
              </div>
              <button onClick={() => setIsAIOpen(false)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <AIAssistant />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}