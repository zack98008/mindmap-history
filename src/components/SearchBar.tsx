import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass } from 'lucide-react';
import { HistoricalElement } from '@/types';
import { getElements } from '@/utils/dummyData';

interface SearchBarProps {
  onResultSelect: (result: HistoricalElement) => void;
  historicalElements?: HistoricalElement[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect, historicalElements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<HistoricalElement[]>([]);
  const [filteredResults, setFilteredResults] = useState<HistoricalElement[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const filtered = results.filter(result =>
        result.name.toLowerCase().includes(term.toLowerCase()) ||
        result.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(results);
    }
  };

  const handleResultSelect = (result: HistoricalElement) => {
    onResultSelect(result);
    setSearchTerm('');
    setFilteredResults(results);
  };

  useEffect(() => {
    if (historicalElements) {
      setResults(historicalElements);
      setFilteredResults(historicalElements);
    } else {
      // Fallback to dummy data if no historicalElements provided
      const dummyData = getElements();
      setResults(dummyData);
      setFilteredResults(dummyData);
    }
  }, [historicalElements]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <MagnifyingGlass className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="search"
        placeholder="Search historical figures, events, and topics..."
        value={searchTerm}
        onChange={handleInputChange}
        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
      />
      {searchTerm && filteredResults.length > 0 && (
        <div className="absolute left-0 mt-1 w-full rounded-md shadow-lg z-10 bg-slate-800 border border-slate-700">
          <ul className="max-h-48 overflow-auto py-1 text-base text-gray-700 dark:text-gray-200">
            {filteredResults.map(result => (
              <li
                key={result.id}
                className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-white"
                onClick={() => handleResultSelect(result)}
              >
                {result.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
