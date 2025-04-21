import React, { useState, useEffect, useCallback } from 'react';

// Define Data Structures
interface Highlight {
  id: string;
  text: string;
  datetime: string; // ISO string format
  color: string;
  createdAt: number;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  color: string;
  createdAt: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  color: string;
  relatedHighlightId?: string;
  relatedResourceId?: string;
  createdAt: number;
}

interface Resource {
  id: string;
  name: string;
  type: 'link' | 'note'; // Example types
  content: string; // URL or note content
  color: string;
  createdAt: number;
}

type View = 'dashboard' | 'highlights' | 'todos' | 'calendar' | 'ideapad' | 'resources';
type ItemType = 'highlight' | 'todo' | 'event' | 'resource' | 'ideapadNote';
type Item = Highlight | Todo | CalendarEvent | Resource | { id: string; text: string; createdAt: number; color: string }; // Adding ideapadNote type loosely

const COLORS = ['bg-red-200', 'bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-indigo-200', 'bg-purple-200', 'bg-pink-200', 'bg-gray-200'];
const BORDER_COLORS = ['border-red-500', 'border-yellow-500', 'border-green-500', 'border-blue-500', 'border-indigo-500', 'border-purple-500', 'border-pink-500', 'border-gray-500'];
const TEXT_COLORS = ['text-red-800', 'text-yellow-800', 'text-green-800', 'text-blue-800', 'text-indigo-800', 'text-purple-800', 'text-pink-800', 'text-gray-800'];

const NoteApp: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [ideapadNotes, setIdeapadNotes] = useState<{ id: string; text: string; createdAt: number; color: string }[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedItem, setSelectedItem] = useState<{ item: Item; type: ItemType } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Persistence ---
  useEffect(() => {
    try {
      const savedHighlights = localStorage.getItem('appData_highlights');
      const savedTodos = localStorage.getItem('appData_todos');
      const savedEvents = localStorage.getItem('appData_events');
      const savedResources = localStorage.getItem('appData_resources');
      const savedIdeapadNotes = localStorage.getItem('appData_ideapadNotes');

      if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
      if (savedTodos) setTodos(JSON.parse(savedTodos));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedResources) setResources(JSON.parse(savedResources));
       if (savedIdeapadNotes) setIdeapadNotes(JSON.parse(savedIdeapadNotes));

    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      // Initialize with empty arrays if loading fails
      setHighlights([]);
      setTodos([]);
      setEvents([]);
      setResources([]);
      setIdeapadNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(() => {
    if (isLoading) return; // Don't save while initially loading
    try {
      localStorage.setItem('appData_highlights', JSON.stringify(highlights));
      localStorage.setItem('appData_todos', JSON.stringify(todos));
      localStorage.setItem('appData_events', JSON.stringify(events));
      localStorage.setItem('appData_resources', JSON.stringify(resources));
      localStorage.setItem('appData_ideapadNotes', JSON.stringify(ideapadNotes));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, [highlights, todos, events, resources, ideapadNotes, isLoading]);

  useEffect(() => {
    saveData();
  }, [saveData]); // Save whenever data changes

  // --- CRUD Operations ---
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  // Highlights
  const addHighlight = (text: string, datetime: string, color: string) => {
    const newHighlight: Highlight = { id: generateId(), text, datetime, color, createdAt: Date.now() };
    setHighlights(prev => [...prev, newHighlight].sort((a, b) => b.createdAt - a.createdAt));
  };

  const deleteHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    // Also remove related events if any
    setEvents(prev => prev.filter(e => e.relatedHighlightId !== id));
  };

  // Todos
  const addTodo = (text: string, color: string) => {
    const newTodo: Todo = { id: generateId(), text, completed: false, color, createdAt: Date.now() };
    setTodos(prev => [...prev, newTodo].sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt));
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
          .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt)
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Events
  const addEvent = (title: string, date: string, color: string, relatedHighlightId?: string, relatedResourceId?: string) => {
    const newEvent: CalendarEvent = { id: generateId(), title, date, color, relatedHighlightId, relatedResourceId, createdAt: Date.now() };
    setEvents(prev => [...prev, newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || b.createdAt - a.createdAt));
  };

   const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
   };

   // Resources
  const addResource = (name: string, type: 'link' | 'note', content: string, color: string) => {
    const newResource: Resource = { id: generateId(), name, type, content, color, createdAt: Date.now() };
    setResources(prev => [...prev, newResource].sort((a,b) => b.createdAt - a.createdAt));
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
     // Also remove related events if any
    setEvents(prev => prev.filter(e => e.relatedResourceId !== id));
  };

  // Ideapad Notes
  const addIdeapadNote = (text: string, color: string) => {
    const newNote = { id: generateId(), text, color, createdAt: Date.now() };
    setIdeapadNotes(prev => [...prev, newNote].sort((a, b) => b.createdAt - a.createdAt));
  };

  const deleteIdeapadNote = (id: string) => {
    setIdeapadNotes(prev => prev.filter(n => n.id !== id));
  };


  // --- View Item Popup ("Echo Feature") ---
  const openItemPopup = (item: Item, type: ItemType) => {
    setSelectedItem({ item, type });
  };

  const closeItemPopup = () => {
    setSelectedItem(null);
  };

  // --- Helper Functions ---
  const formatDate = (dateString: string | number) => {
    const date = new Date(dateString);
     if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  const formatDateForInput = (dateString: string) => {
     try {
       return new Date(dateString).toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
     } catch {
       return new Date().toISOString().slice(0, 16);
     }
   };

  const formatDateYYYYMMDD = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
  }

  const getDaysInMonth = (year: number, month: number): Date[] => {
      const date = new Date(year, month, 1);
      const days: Date[] = [];
      while (date.getMonth() === month) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
      }
      return days;
  };

  const getMonthName = (monthIndex: number): string => {
      const monthNames = ["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"];
      return monthNames[monthIndex];
  }

  // --- Render Functions ---

  const renderColorPicker = (selectedColor: string, onSelectColor: (color: string) => void) => (
    <div className="flex flex-wrap gap-2 my-2">
      {COLORS.map((colorClass, index) => (
        <button
          key={colorClass}
          type="button"
          className={`w-6 h-6 rounded-full ${colorClass} border-2 ${selectedColor === colorClass ? BORDER_COLORS[index % BORDER_COLORS.length] : 'border-transparent'} hover:opacity-80 transition-opacity`}
          onClick={() => onSelectColor(colorClass)}
        />
      ))}
    </div>
  );

  // --- Main Sections ---

  // Dashboard
  const Dashboard = () => {
    const [quickWriteText, setQuickWriteText] = useState('');
    const [quickWriteTarget, setQuickWriteTarget] = useState<ItemType>('highlight');
    const [quickWriteColor, setQuickWriteColor] = useState(COLORS[0]);

    const handleQuickWriteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!quickWriteText.trim()) return;

      switch (quickWriteTarget) {
        case 'highlight':
          addHighlight(quickWriteText, new Date().toISOString(), quickWriteColor);
          break;
        case 'todo':
          addTodo(quickWriteText, quickWriteColor);
          break;
        case 'ideapadNote':
           addIdeapadNote(quickWriteText, quickWriteColor);
           break;
        case 'resource': // Simple resource creation from dashboard
          addResource(quickWriteText.substring(0, 30), 'note', quickWriteText, quickWriteColor);
          break;
        // case 'event': // Adding events might require more context (date)
        default:
          console.warn("Unsupported quick write target:", quickWriteTarget);
      }
      setQuickWriteText('');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>

            {/* Quick Write */}
            <div className="bg-white p-4 rounded-lg shadow space-y-3">
                <h3 className="text-lg font-medium text-gray-700">Quick Write</h3>
                <form onSubmit={handleQuickWriteSubmit} className="space-y-3">
                    <textarea
                        value={quickWriteText}
                        onChange={(e) => setQuickWriteText(e.target.value)}
                        placeholder="Write something quickly..."
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                     <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="quickWriteTarget" className="text-sm font-medium text-gray-600">Save to:</label>
                            <select
                                id="quickWriteTarget"
                                value={quickWriteTarget}
                                onChange={(e) => setQuickWriteTarget(e.target.value as ItemType)}
                                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="highlight">Highlight</option>
                                <option value="ideapadNote">Ideapad</option>
                                <option value="todo">Todo</option>
                                <option value="resource">Resource (Note)</option>
                            </select>
                        </div>
                         <div className="flex-grow">
                          {renderColorPicker(quickWriteColor, setQuickWriteColor)}
                        </div>
                         <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-2">Recent Highlights</h4>
                    <ul className="space-y-1 text-sm">
                        {highlights.slice(0, 3).map(h => (
                            <li key={h.id} className={`p-1 rounded ${h.color} ${TEXT_COLORS[COLORS.indexOf(h.color) % TEXT_COLORS.length]}`}>
                                {h.text.substring(0, 50)}{h.text.length > 50 ? '...' : ''}
                            </li>
                        ))}
                        {highlights.length === 0 && <p className="text-gray-500">No highlights yet.</p>}
                    </ul>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-2">Upcoming Todos</h4>
                    <ul className="space-y-1 text-sm">
                       {todos.filter(t => !t.completed).slice(0, 3).map(t => (
                            <li key={t.id} className={`p-1 rounded ${t.color} ${TEXT_COLORS[COLORS.indexOf(t.color) % TEXT_COLORS.length]}`}>
                                {t.text.substring(0, 50)}{t.text.length > 50 ? '...' : ''}
                            </li>
                        ))}
                        {todos.filter(t => !t.completed).length === 0 && <p className="text-gray-500">No active todos.</p>}
                    </ul>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-2">Upcoming Events</h4>
                     <ul className="space-y-1 text-sm">
                        {events.filter(e => new Date(e.date) >= new Date(formatDateYYYYMMDD(new Date()))).slice(0, 3).map(e => (
                             <li key={e.id} className={`p-1 rounded ${e.color} ${TEXT_COLORS[COLORS.indexOf(e.color) % TEXT_COLORS.length]}`}>
                                {e.date}: {e.title.substring(0, 40)}{e.title.length > 40 ? '...' : ''}
                            </li>
                        ))}
                         {events.filter(e => new Date(e.date) >= new Date(formatDateYYYYMMDD(new Date()))).length === 0 && <p className="text-gray-500">No upcoming events.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
  };

  // Highlight Section
  const HighlightSection = () => {
    const [newHighlightText, setNewHighlightText] = useState('');
    const [newHighlightDate, setNewHighlightDate] = useState(formatDateForInput(new Date().toISOString()));
    const [newHighlightColor, setNewHighlightColor] = useState(COLORS[0]);

    const handleAddHighlight = () => {
      if (!newHighlightText.trim()) return;
      const datetime = new Date(newHighlightDate).toISOString();
      addHighlight(newHighlightText, datetime, newHighlightColor);
      setNewHighlightText('');
      setNewHighlightDate(formatDateForInput(new Date().toISOString()));
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Highlights</h2>
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <textarea
            value={newHighlightText}
            onChange={(e) => setNewHighlightText(e.target.value)}
            placeholder="Enter new highlight..."
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex flex-wrap items-center gap-4">
             <input
              type="datetime-local"
              value={newHighlightDate}
              onChange={(e) => setNewHighlightDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {renderColorPicker(newHighlightColor, setNewHighlightColor)}
            <button
              onClick={handleAddHighlight}
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
              Add Highlight
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {highlights.map(h => (
            <div key={h.id} className={`p-4 rounded-lg shadow-sm ${h.color} relative group`}>
              <p className={`mb-1 ${TEXT_COLORS[COLORS.indexOf(h.color) % TEXT_COLORS.length]}`}>{h.text}</p>
              <p className={`text-xs ${TEXT_COLORS[COLORS.indexOf(h.color) % TEXT_COLORS.length]} opacity-75`}>{formatDate(h.datetime)}</p>
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => openItemPopup(h, 'highlight')} className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs">👁️</button>
                 <button onClick={() => deleteHighlight(h.id)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs">🗑️</button>
              </div>
            </div>
          ))}
           {highlights.length === 0 && <p className="text-gray-500 text-center py-4">No highlights yet.</p>}
        </div>
      </div>
    );
  };

   // Todo Section
  const TodoSection = () => {
    const [newTodoText, setNewTodoText] = useState('');
    const [newTodoColor, setNewTodoColor] = useState(COLORS[1]);

    const handleAddTodo = () => {
      if (!newTodoText.trim()) return;
      addTodo(newTodoText, newTodoColor);
      setNewTodoText('');
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Todo List</h2>
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Enter new todo..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex flex-wrap items-center gap-4">
             {renderColorPicker(newTodoColor, setNewTodoColor)}
            <button
              onClick={handleAddTodo}
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
              Add Todo
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {todos.map(t => (
            <div key={t.id} className={`p-3 rounded-lg shadow-sm flex items-center justify-between group ${t.color}`}>
               <div className="flex items-center space-x-3 flex-grow">
                 <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTodo(t.id)}
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                 />
                 <span className={`${t.completed ? 'line-through text-gray-500' : TEXT_COLORS[COLORS.indexOf(t.color) % TEXT_COLORS.length]}`}>{t.text}</span>
               </div>
               <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openItemPopup(t, 'todo')} className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs">👁️</button>
                  <button onClick={() => deleteTodo(t.id)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs">🗑️</button>
              </div>
            </div>
          ))}
          {todos.length === 0 && <p className="text-gray-500 text-center py-4">No todos yet.</p>}
        </div>
      </div>
    );
  };

  // Calendar Section
  const CalendarSection = () => {
        const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState<string | null>(null);
        const [newEventTitle, setNewEventTitle] = useState('');
        const [newEventColor, setNewEventColor] = useState(COLORS[3]);
        const [linkedHighlightId, setLinkedHighlightId] = useState<string | undefined>(undefined);
        const [linkedResourceId, setLinkedResourceId] = useState<string | undefined>(undefined);

        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth(); // 0-indexed
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, ...

        const eventsByDate = events.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);

        const highlightsByDate = highlights.reduce((acc, hl) => {
             const dateStr = hl.datetime.split('T')[0]; // YYYY-MM-DD
             (acc[dateStr] = acc[dateStr] || []).push(hl);
             return acc;
         }, {} as Record<string, Highlight[]>);


        const changeMonth = (delta: number) => {
            setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
            setSelectedDate(null); // Reset selected date when changing month
        };

        const handleAddEvent = () => {
            if (!newEventTitle.trim() || !selectedDate) return;
            addEvent(newEventTitle, selectedDate, newEventColor, linkedHighlightId, linkedResourceId);
            setNewEventTitle('');
            setLinkedHighlightId(undefined);
            setLinkedResourceId(undefined);
        };

        const todayStr = formatDateYYYYMMDD(new Date());
        const selectedDayEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
        const selectedDayHighlights = selectedDate ? highlightsByDate[selectedDate] || [] : [];

        return (
            <div className="p-4 md:p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>

                 {/* Add Event Form (appears when a date is selected) */}
                 {selectedDate && (
                     <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
                         <h3 className="text-lg font-medium text-gray-700">Add Event for {selectedDate}</h3>
                         <input
                             type="text"
                             value={newEventTitle}
                             onChange={(e) => setNewEventTitle(e.target.value)}
                             placeholder="Event title..."
                             className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                         />
                         <div className="flex flex-wrap items-center gap-4">
                             <select
                                 value={linkedHighlightId || ''}
                                 onChange={e => { setLinkedHighlightId(e.target.value || undefined); setLinkedResourceId(undefined); }}
                                 className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                             >
                                 <option value="">Link Highlight (Optional)</option>
                                 {highlights.map(h => <option key={h.id} value={h.id}>{h.text.substring(0, 30)}...</option>)}
                             </select>
                             <select
                                 value={linkedResourceId || ''}
                                 onChange={e => { setLinkedResourceId(e.target.value || undefined); setLinkedHighlightId(undefined); }}
                                 className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                             >
                                 <option value="">Link Resource (Optional)</option>
                                 {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                             </select>
                         </div>
                          <div className="flex flex-wrap items-center gap-4">
                            {renderColorPicker(newEventColor, setNewEventColor)}
                             <button
                                 onClick={handleAddEvent}
                                 className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                             >
                                 Add Event
                             </button>
                         </div>
                     </div>
                 )}


                {/* Calendar Grid */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">&lt; Prev</button>
                        <h3 className="text-xl font-semibold text-gray-800">{getMonthName(month)} {year}</h3>
                        <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Next &gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells before the first day */}
                        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                            <div key={`empty-${index}`} className="border border-gray-100 h-20 md:h-24"></div>
                        ))}
                        {/* Days of the month */}
                        {daysInMonth.map(day => {
                            const dateStr = formatDateYYYYMMDD(day);
                            const dayEvents = eventsByDate[dateStr] || [];
                             const dayHighlights = highlightsByDate[dateStr] || [];
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;

                            return (
                                <div
                                    key={dateStr}
                                    className={`border p-1 h-20 md:h-24 flex flex-col cursor-pointer transition-colors relative ${
                                        isSelected ? 'bg-indigo-100 border-indigo-300' : isToday ? 'bg-amber-50 border-amber-200' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedDate(dateStr)}
                                >
                                    <span className={`font-medium ${isToday ? 'text-amber-600' : 'text-gray-700'}`}>{day.getDate()}</span>
                                    <div className="flex-grow overflow-y-auto text-xs space-y-0.5 mt-1">
                                       {/* Display indicators for events and highlights */}
                                       {dayEvents.map(e => (
                                         <div key={e.id} className={`h-1.5 w-full rounded-full ${e.color} mb-0.5`} title={e.title}></div>
                                       ))}
                                        {dayHighlights.map(h => (
                                           <div key={h.id} className={`h-1.5 w-full rounded-full ${h.color} opacity-60 mb-0.5`} title={h.text.substring(0, 30)}></div>
                                        ))}
                                    </div>
                                     {/* Highlight border if it has related items from other modules */}
                                    {(dayEvents.some(e => e.relatedHighlightId || e.relatedResourceId) || dayHighlights.length > 0) &&
                                        <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded pointer-events-none"></div>
                                    }
                                </div>
                            );
                        })}
                    </div>
                </div>

               {/* Timeline / Day View (Simple) */}
                {selectedDate && (
                    <div className="bg-white p-4 rounded-lg shadow mt-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Details for {selectedDate} {selectedDate === todayStr ? '(Today)' : ''}</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                             <h4 className="text-sm font-semibold text-indigo-700 mt-2 border-b pb-1">Events</h4>
                             {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.sort((a,b) => a.createdAt - b.createdAt).map(event => (
                                    <div key={event.id} className={`p-2 rounded ${event.color} relative group`}>
                                         <p className={`font-medium ${TEXT_COLORS[COLORS.indexOf(event.color) % TEXT_COLORS.length]}`}>{event.title}</p>
                                         {event.relatedHighlightId && <p className="text-xs opacity-75">Linked Highlight: {highlights.find(h=>h.id === event.relatedHighlightId)?.text.substring(0,30) || 'N/A'}...</p>}
                                         {event.relatedResourceId && <p className="text-xs opacity-75">Linked Resource: {resources.find(r=>r.id === event.relatedResourceId)?.name || 'N/A'}</p>}
                                          <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openItemPopup(event, 'event')} className="p-0.5 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs leading-none">👁️</button>
                                            <button onClick={() => deleteEvent(event.id)} className="p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs leading-none">🗑️</button>
                                          </div>
                                    </div>
                                ))
                             ) : <p className="text-gray-500 text-sm">No events scheduled.</p>}

                             <h4 className="text-sm font-semibold text-purple-700 mt-4 border-b pb-1">Highlights</h4>
                             {selectedDayHighlights.length > 0 ? (
                                 selectedDayHighlights.sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).map(hl => (
                                     <div key={hl.id} className={`p-2 rounded ${hl.color} relative group`}>
                                         <p className={`${TEXT_COLORS[COLORS.indexOf(hl.color) % TEXT_COLORS.length]}`}>{hl.text}</p>
                                         <p className={`text-xs opacity-75 ${TEXT_COLORS[COLORS.indexOf(hl.color) % TEXT_COLORS.length]}`}>{formatDate(hl.datetime)}</p>
                                          <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openItemPopup(hl, 'highlight')} className="p-0.5 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs leading-none">👁️</button>
                                            <button onClick={() => deleteHighlight(hl.id)} className="p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs leading-none">🗑️</button>
                                          </div>
                                     </div>
                                 ))
                             ) : <p className="text-gray-500 text-sm">No highlights for this day.</p>}
                        </div>
                    </div>
                )}
            </div>
        );
    };


  // Ideapad Section
  const IdeapadSection = () => {
      const [newNoteText, setNewNoteText] = useState('');
      const [newNoteColor, setNewNoteColor] = useState(COLORS[4]);

      const handleAddNote = () => {
          if (!newNoteText.trim()) return;
          addIdeapadNote(newNoteText, newNoteColor);
          setNewNoteText('');
      };

      return (
          <div className="p-4 md:p-6 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Ideapad</h2>
              <div className="bg-white p-4 rounded-lg shadow space-y-3">
                  <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Jot down an idea..."
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap items-center gap-4">
                      {renderColorPicker(newNoteColor, setNewNoteColor)}
                      <button
                          onClick={handleAddNote}
                          className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                      >
                          Add Idea
                      </button>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ideapadNotes.map(note => (
                      <div key={note.id} className={`p-4 rounded-lg shadow-sm ${note.color} relative group flex flex-col justify-between min-h-[100px]`}>
                          <p className={`mb-2 ${TEXT_COLORS[COLORS.indexOf(note.color) % TEXT_COLORS.length]} flex-grow`}>{note.text}</p>
                           <div className="flex justify-between items-center mt-2">
                               <p className={`text-xs ${TEXT_COLORS[COLORS.indexOf(note.color) % TEXT_COLORS.length]} opacity-75`}>{formatDate(note.createdAt)}</p>
                               <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openItemPopup(note, 'ideapadNote')} className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs">👁️</button>
                                  <button onClick={() => deleteIdeapadNote(note.id)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs">🗑️</button>
                              </div>
                           </div>
                      </div>
                  ))}
                   {ideapadNotes.length === 0 && <p className="text-gray-500 text-center py-4 sm:col-span-2 lg:col-span-3">No ideas yet.</p>}
              </div>
          </div>
      );
  };


  // Resources Section
  const ResourcesSection = () => {
    const [newResourceName, setNewResourceName] = useState('');
    const [newResourceType, setNewResourceType] = useState<'link' | 'note'>('link');
    const [newResourceContent, setNewResourceContent] = useState('');
    const [newResourceColor, setNewResourceColor] = useState(COLORS[5]);

    const handleAddResource = () => {
        if (!newResourceName.trim() || !newResourceContent.trim()) return;
        addResource(newResourceName, newResourceType, newResourceContent, newResourceColor);
        setNewResourceName('');
        setNewResourceContent('');
    }

    return (
      <div className="p-4 md:p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Resources</h2>
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <input
                type="text"
                value={newResourceName}
                onChange={e => setNewResourceName(e.target.value)}
                placeholder="Resource Name"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
             />
             <div className="flex items-center space-x-4">
                 <label className="flex items-center space-x-2">
                     <input type="radio" name="resourceType" value="link" checked={newResourceType === 'link'} onChange={() => setNewResourceType('link')} className="form-radio text-indigo-600 focus:ring-indigo-500"/>
                     <span>Link</span>
                 </label>
                  <label className="flex items-center space-x-2">
                     <input type="radio" name="resourceType" value="note" checked={newResourceType === 'note'} onChange={() => setNewResourceType('note')} className="form-radio text-indigo-600 focus:ring-indigo-500"/>
                     <span>Note</span>
                 </label>
             </div>
             {newResourceType === 'link' ? (
                <input
                    type="url"
                    value={newResourceContent}
                    onChange={e => setNewResourceContent(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
             ) : (
                 <textarea
                    value={newResourceContent}
                    onChange={e => setNewResourceContent(e.target.value)}
                    placeholder="Enter note content..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
             )}
          <div className="flex flex-wrap items-center gap-4">
             {renderColorPicker(newResourceColor, setNewResourceColor)}
            <button
              onClick={handleAddResource}
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
              Add Resource
            </button>
          </div>
        </div>
         <div className="space-y-4">
          {resources.map(r => (
            <div key={r.id} className={`p-4 rounded-lg shadow-sm ${r.color} relative group`}>
              <h3 className={`font-medium mb-1 ${TEXT_COLORS[COLORS.indexOf(r.color) % TEXT_COLORS.length]}`}>{r.name} <span className="text-xs opacity-75">({r.type})</span></h3>
              {r.type === 'link' ? (
                <a href={r.content} target="_blank" rel="noopener noreferrer" className={`text-blue-600 hover:underline break-all ${TEXT_COLORS[COLORS.indexOf(r.color) % TEXT_COLORS.length]} opacity-90`}>{r.content}</a>
              ) : (
                <p className={`text-sm whitespace-pre-wrap ${TEXT_COLORS[COLORS.indexOf(r.color) % TEXT_COLORS.length]}`}>{r.content.substring(0, 100)}{r.content.length > 100 ? '...' : ''}</p>
              )}
              <p className={`text-xs mt-1 ${TEXT_COLORS[COLORS.indexOf(r.color) % TEXT_COLORS.length]} opacity-75`}>Added: {formatDate(r.createdAt)}</p>
               <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => openItemPopup(r, 'resource')} className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs">👁️</button>
                 <button onClick={() => deleteResource(r.id)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs">🗑️</button>
              </div>
            </div>
          ))}
           {resources.length === 0 && <p className="text-gray-500 text-center py-4">No resources yet.</p>}
        </div>
      </div>
    );
  };

  // Item Popup ("Echo Feature")
  const ItemPopup = () => {
    if (!selectedItem) return null;

    const { item, type } = selectedItem;
    const colorClass = item.color || 'bg-gray-200'; // Fallback color
    const textColorClass = TEXT_COLORS[COLORS.indexOf(colorClass) % TEXT_COLORS.length] || 'text-gray-800';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50" onClick={closeItemPopup}>
        <div className={`bg-white p-6 rounded-lg shadow-xl max-w-lg w-full ${colorClass} relative`} onClick={e => e.stopPropagation()}>
           <button onClick={closeItemPopup} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold">&times;</button>
           <h3 className={`text-xl font-semibold mb-4 ${textColorClass}`}>View {type.charAt(0).toUpperCase() + type.slice(1)}</h3>

           <div className={`space-y-2 text-sm ${textColorClass}`}>
                {type === 'highlight' && (item as Highlight).text && (
                    <>
                        <p className="font-medium">Text:</p>
                        <p className="whitespace-pre-wrap">{(item as Highlight).text}</p>
                        <p className="font-medium mt-2">Date/Time:</p>
                        <p>{formatDate((item as Highlight).datetime)}</p>
                    </>
                )}
                 {type === 'todo' && (item as Todo).text && (
                     <>
                         <p className="font-medium">Task:</p>
                         <p className={`${(item as Todo).completed ? 'line-through' : ''}`}>{(item as Todo).text}</p>
                         <p className="font-medium mt-2">Status:</p>
                         <p>{(item as Todo).completed ? 'Completed' : 'Pending'}</p>
                     </>
                 )}
                 {type === 'event' && (item as CalendarEvent).title && (
                     <>
                         <p className="font-medium">Title:</p>
                         <p>{(item as CalendarEvent).title}</p>
                          <p className="font-medium mt-2">Date:</p>
                         <p>{(item as CalendarEvent).date}</p>
                         {(item as CalendarEvent).relatedHighlightId && <p className="text-xs opacity-75">Linked Highlight: {highlights.find(h=>h.id === (item as CalendarEvent).relatedHighlightId)?.text.substring(0,50) || 'N/A'}...</p>}
                         {(item as CalendarEvent).relatedResourceId && <p className="text-xs opacity-75">Linked Resource: {resources.find(r=>r.id === (item as CalendarEvent).relatedResourceId)?.name || 'N/A'}</p>}
                     </>
                 )}
                 {type === 'resource' && (item as Resource).name && (
                     <>
                         <p className="font-medium">Name:</p>
                         <p>{(item as Resource).name}</p>
                         <p className="font-medium mt-2">Type:</p>
                         <p>{(item as Resource).type}</p>
                         <p className="font-medium mt-2">Content:</p>
                         {(item as Resource).type === 'link' ? (
                            <a href={(item as Resource).content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{ (item as Resource).content }</a>
                         ) : (
                             <p className="whitespace-pre-wrap">{(item as Resource).content}</p>
                         )}
                     </>
                 )}
                  {type === 'ideapadNote' && (item as {text: string}).text && (
                     <>
                         <p className="font-medium">Idea:</p>
                         <p className="whitespace-pre-wrap">{(item as {text: string}).text}</p>
                     </>
                 )}
                 <p className="font-medium mt-2">Created:</p>
                 <p>{formatDate(item.createdAt)}</p>
           </div>

           <button
             onClick={closeItemPopup}
             className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
           >
             Close
           </button>
        </div>
      </div>
    );
  };


  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="bg-indigo-800 text-white w-full md:w-56 p-4 md:min-h-screen flex-shrink-0">
        <h1 className="text-2xl font-bold mb-6">NoteApp</h1>
        <ul className="space-y-2">
          {(['dashboard', 'highlights', 'todos', 'calendar', 'ideapad', 'resources'] as View[]).map(view => (
            <li key={view}>
              <button
                onClick={() => setCurrentView(view)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-indigo-700 transition-colors ${currentView === view ? 'bg-indigo-900 font-semibold' : ''}`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow bg-gray-50 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">Loading...</div>
        ) : (
          <>
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'highlights' && <HighlightSection />}
            {currentView === 'todos' && <TodoSection />}
            {currentView === 'calendar' && <CalendarSection />}
            {currentView === 'ideapad' && <IdeapadSection />}
            {currentView === 'resources' && <ResourcesSection />}
          </>
        )}
      </main>

      {/* Item Popup Modal */}
      {selectedItem && <ItemPopup />}
    </div>
  );
};

export default NoteApp;