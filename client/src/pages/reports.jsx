import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { FileText, Download, CheckCircle, Clock, PlayCircle, Filter, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Reports() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState([]);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [userId]);

  const filteredTasks = tasks.filter(t => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchStart = startDate ? t.task_date >= startDate : true;
    const matchEnd = endDate ? t.task_date <= endDate : true;
    return matchCat && matchStatus && matchStart && matchEnd;
  });

  const exportPDF = () => {
    if (filteredTasks.length === 0) return alert('No tasks match your current filters!');

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Plan Me - Advanced Task Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Tasks Included: ${filteredTasks.length}`, 14, 28);
    if (startDate || endDate) doc.text(`Date Range: ${startDate || 'Beginning'} to ${endDate || 'Present'}`, 14, 34);

    const tableRows = filteredTasks.map(t => [
      t.title, t.task_date, t.start_time ? `${t.start_time} - ${t.end_time || ''}` : 'All Day',
      t.category.toUpperCase(), t.priority.toUpperCase(), t.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: (startDate || endDate) ? 40 : 34,
      head: [['Task Title', 'Date', 'Time Window', 'Category', 'Priority', 'Status']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9 },
    });

    doc.save(`plan_me_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const ongoingCount = tasks.filter(t => t.status === 'ongoing').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Reports & PDF Export</h2>
          <p className="text-gray-500 dark:text-gray-400">Generate formatted activity sheets and document backups.</p>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all w-fit">
          <Download size={18} /> Export Filtered Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4"><div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><PlayCircle size={24} /></div><div><p className="text-xs font-bold text-gray-400 uppercase">Active Ongoing</p><p className="text-2xl font-black text-blue-600">{ongoingCount}</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4"><div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl"><CheckCircle size={24} /></div><div><p className="text-xs font-bold text-gray-400 uppercase">Completed</p><p className="text-2xl font-black text-green-600">{completedCount}</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4"><div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 rounded-xl"><Clock size={24} /></div><div><p className="text-xs font-bold text-gray-400 uppercase">Pending</p><p className="text-2xl font-black text-yellow-600">{pendingCount}</p></div></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-2 font-bold text-lg"><FileText size={20} className="text-blue-500" /> Report Preview</div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Filters */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm">
              <Calendar size={14} className="text-gray-400" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent outline-none text-gray-600 dark:text-gray-300 [color-scheme:light] dark:[color-scheme:dark]" title="Start Date"/>
              <span className="text-gray-400">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent outline-none text-gray-600 dark:text-gray-300 [color-scheme:light] dark:[color-scheme:dark]" title="End Date"/>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm">
              <Filter size={14} className="text-gray-400" />
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Statuses</option>
                <option value="ongoing" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Ongoing</option>
                <option value="pending" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Pending</option>
                <option value="completed" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Completed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-transparent outline-none capitalize cursor-pointer">
                <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Categories</option>
                {[...new Set(tasks.map(t => t.category))].map(c => (
                  <option key={c} value={c} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase text-xs">
                <th className="py-3 px-2">Task</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Time</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Priority</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTasks.slice(0, 10).map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-2 font-medium">{t.title}</td>
                  <td className="py-3 px-2 text-gray-500">{t.task_date}</td>
                  <td className="py-3 px-2 text-gray-500">{t.start_time || 'N/A'}</td>
                  <td className="py-3 px-2 capitalize">{t.category}</td>
                  <td className="py-3 px-2 uppercase text-xs font-bold">{t.priority}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${t.status === 'ongoing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40' : t.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length > 10 && (
            <p className="text-xs text-gray-400 text-center mt-4">Showing 10 of {filteredTasks.length} tasks in preview. PDF export will include all tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
}