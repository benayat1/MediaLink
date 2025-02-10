import React, { useState } from 'react';
import { Search, Database } from 'lucide-react';

export function Header({ onSearch }: { onSearch: (query: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // עדכון state מקומי
    onSearch(value);      // עדכון ה-state בקומפוננטת האב
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-900">Historical Archives Analyzer</h1>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm} // קישור לשדה הקלט
              placeholder="Search archives..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              onChange={handleSearchChange} // קריאה לפונקציה בעת שינוי
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
