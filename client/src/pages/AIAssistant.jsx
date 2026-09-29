import { useState } from 'react';
import { Bot, Send, Check } from 'lucide-react';

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    
    // Add user message to UI
    const newUserMsg = { role: 'user', content: prompt };
    setHistory(prev => [...prev, newUserMsg]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: newUserMsg.content })
      });
      
      const data = await res.json();
      
      // Add AI response to UI
      setHistory(prev => [...prev, { role: 'ai', task: data.parsedTask, saved: false }]);
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'ai', error: "Failed to connect to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAskAI();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      
      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-70">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full text-purple-600 dark:text-purple-400 mb-4">
              <Bot size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">How can I help?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Type a prompt like: "Remind me to study ML tomorrow at 10 AM" and I will schedule it for you.
            </p>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'user' ? (
                <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[95%] text-sm border border-gray-200 dark:border-gray-700">
                  {msg.error ? (
                    <span className="text-red-500">{msg.error}</span>
                  ) : (
                    <div>
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        <Bot size={16} className="text-purple-500"/> Drafted Task
                      </p>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 space-y-1">
                        <p><strong>Title:</strong> {msg.task.title}</p>
                        <p><strong>Date:</strong> {msg.task.task_date}</p>
                        <p><strong>Time:</strong> {msg.task.start_time} - {msg.task.end_time}</p>
                        <p className="capitalize"><strong>Category:</strong> {msg.task.category}</p>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                        <Check size={16} /> Save to Calendar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-gray-500 flex items-center gap-2">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area (Pinned to Bottom) */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-1 shadow-sm">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what to schedule..."
            className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm"
          />
          <button 
            onClick={handleAskAI}
            disabled={!prompt.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white p-2.5 rounded-xl transition-colors shrink-0"
          >
            <Send size={18} className={isLoading ? "opacity-0" : ""} />
            {isLoading && <span className="absolute w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
          </button>
        </div>
      </div>
      
    </div>
  );
}