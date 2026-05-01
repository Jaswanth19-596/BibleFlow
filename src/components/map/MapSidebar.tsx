import { Entity } from '@/lib/types';

interface RouteStop {
  name: string;
  type: string;
  order: number;
}

interface MapSidebarProps {
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
  people: Entity[];
  totalPlaces: number;
  routeStops?: RouteStop[];
}

export default function MapSidebar({ selectedPersonId, onSelectPerson, people, totalPlaces, routeStops = [] }: MapSidebarProps) {
  const selectedPerson = people.find(p => p.id === selectedPersonId);

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col z-10">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">Filter by Person</h2>
        <p className="text-xs text-gray-500 mt-1">Showing {totalPlaces} places</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-0.5">
          <button
            onClick={() => onSelectPerson(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPersonId === null
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All Places
          </button>
          
          {people.map(person => (
            <button
              key={person.id}
              onClick={() => onSelectPerson(person.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                selectedPersonId === person.id
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: person.color }} 
              />
              <span className="truncate">{person.name}</span>
            </button>
          ))}
        </div>

        {/* Route stops panel — shown when a person is selected */}
        {selectedPerson && routeStops.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 mt-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {selectedPerson.name}'s Route
            </h3>
            <div className="space-y-0.5">
              {routeStops.map((stop, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  {/* Numbered circle + vertical line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: selectedPerson.color }}
                    >
                      {i + 1}
                    </div>
                    {i < routeStops.length - 1 && (
                      <div
                        className="w-0.5 h-5 mt-0.5"
                        style={{ backgroundColor: selectedPerson.color, opacity: 0.3 }}
                      />
                    )}
                  </div>
                  {/* Stop details */}
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {stop.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {stop.type.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPerson && routeStops.length === 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              No places linked to {selectedPerson.name} yet. Click a marker to link them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
