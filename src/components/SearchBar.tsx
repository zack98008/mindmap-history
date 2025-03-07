
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchElements } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';

interface SearchBarProps {
  onResultSelect: (element: HistoricalElement) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HistoricalElement[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      setResults(searchElements(value));
      setIsSearching(true);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  };

  const handleResultClick = (element: HistoricalElement) => {
    onResultSelect(element);
    setIsSearching(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="searchbar-wrapper flex items-center px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search historical elements..."
          className="flex-1 bg-transparent border-none focus:outline-none text-sm"
        />
        {query && (
          <button onClick={handleClear} className="text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isSearching && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-3 z-10 max-h-60 overflow-y-auto animate-fade-in">
          {results.map((result) => (
            <div 
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="flex items-center p-2 hover:bg-chronoPurple/20 rounded-md cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full mr-3 bg-chrono${result.type === 'person' ? 'Purple' : result.type === 'event' ? 'Blue' : result.type === 'document' ? 'Teal' : 'Gold'}`} />
              <div>
                <p className="text-sm font-medium">{result.name}</p>
                <p className="text-xs text-muted-foreground">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  {result.date && ` • ${result.date.split('-')[0]}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSearching && query.length > 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-6 z-10 text-center animate-fade-in">
          <p className="text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
