import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { ICON_MAP } from '../utils/categories';
import { useCategories } from '../hooks/useCategories';

export default function Settings() {
  const { user } = useUser();
  const { categories, saveCategories } = useCategories();
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('Sparkles');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    if (categories.length >= 6) return alert('Maximum of 6 categories allowed.');

    const newCat = {
      id: newLabel.toLowerCase().replace(/\s+/g, '-'),
      label: newLabel.trim(),
      icon: newIcon,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
    };

    saveCategories([...categories, newCat]);
    setNewLabel('');
  };

  const handleDeleteCategory = (id) => {
    if (categories.length <= 1) return alert('You must have at least one category.');
    saveCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl pb-16">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage account information and custom categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
          <img src={user?.imageUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md object-cover mb-4" />
          <h3 className="text-xl font-bold">{user?.fullName || 'Plan Me User'}</h3>
          <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
          <div className="mt-6 w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-left border border-gray-100 dark:border-gray-800 text-xs text-gray-500 space-y-2">
            <p className="flex justify-between"><span className="font-semibold">User ID:</span> <span className="font-mono">{user?.id?.slice(0, 14)}...</span></p>
            <p className="flex justify-between"><span className="font-semibold">Status:</span> <span className="text-green-500 font-bold">Verified</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Tag size={20} className="text-blue-500" /> Focus Categories</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${categories.length >= 6 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{categories.length}/6 Active</span>
            </div>

            <div className="space-y-2 mb-6">
              {categories.map(cat => {
                const IconComponent = ICON_MAP[cat.icon] || Tag;
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600"><IconComponent size={16} /></div>
                      <span className="font-semibold text-sm">{cat.label}</span>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={16} /></button>
                  </div>
                );
              })}
            </div>
          </div>

          {categories.length < 6 && (
            <form onSubmit={handleAddCategory} className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase">Add New Category</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.keys(ICON_MAP).map(iconName => {
                  const IconComp = ICON_MAP[iconName];
                  return (
                    <button key={iconName} type="button" onClick={() => setNewIcon(iconName)} className={`p-2 rounded-xl border transition-all ${newIcon === iconName ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30' : 'border-gray-200 text-gray-500 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <IconComp size={18} />
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Name..." value={newLabel} onChange={e => setNewLabel(e.target.value)} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1"><Plus size={16} /> Add</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}