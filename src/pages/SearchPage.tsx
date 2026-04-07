import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { searchVerses } from '@/lib/supabase';
import { VerseWithTopic } from '@/lib/types';
import { formatVerseRef } from '@/lib/bibleBooks';
import Input from '@/components/common/Input';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseWithTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const data = await searchVerses(debouncedQuery.trim());
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [debouncedQuery]);

  // Group results by topic
  const groupedResults = useMemo(() => {
    const groups: Record<string, { topicName: string; topicColor: string; verses: VerseWithTopic[] }> = {};

    results.forEach((verse) => {
      const key = verse.topic_id;
      if (!groups[key]) {
        groups[key] = {
          topicName: verse.topic_name || 'Unknown Topic',
          topicColor: verse.topic_color || '#6b7280',
          verses: [],
        };
      }
      groups[key].verses.push(verse);
    });

    return Object.values(groups);
  }, [results]);

  const handleResultClick = (verse: VerseWithTopic) => {
    navigate(`/topic/${verse.topic_id}?highlight=${verse.id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Verses</h1>

      <div className="mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by book name, verse reference, or note content..."
          className="text-lg"
          autoFocus
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No verses found matching "{query}"</p>
        </div>
      )}

      {!loading && groupedResults.length > 0 && (
        <div className="space-y-8">
          {groupedResults.map((group) => (
            <div key={group.topicName}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.topicColor }}
                />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {group.topicName}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({group.verses.length} result{group.verses.length !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="space-y-2">
                {group.verses.map((verse) => (
                  <button
                    key={verse.id}
                    onClick={() => handleResultClick(verse)}
                    className="w-full text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatVerseRef(verse.book, verse.chapter, verse.verse_start, verse.verse_end)}
                        </span>
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: verse.topic_color || '#6b7280' }}
                        >
                          {verse.type}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    {verse.note && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {verse.note}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            Search across all your verse notes and references
          </p>
        </div>
      )}
    </div>
  );
}
