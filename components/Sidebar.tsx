import React from 'react';
import { Location } from '../types';
import { CloseIcon } from './Icons';

interface SidebarProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  filters: { [key: string]: boolean };
  onFilterChange: (country: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ locations, onLocationSelect, filters, onFilterChange, isOpen, setIsOpen }) => {
  const groupedLocations = locations.reduce((acc, location) => {
    (acc[location.region] = acc[location.region] || []).push(location);
    return acc;
  }, {} as { [key: string]: Location[] });

  return (
    <>
      <aside className={`absolute z-30 w-80 h-full bg-gray-900/95 text-gray-300 border-r border-green-900 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-mono font-bold text-green-400 uppercase tracking-wider">Locations</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-700 rounded-full">
            <CloseIcon />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <h3 className="font-mono font-semibold text-green-400 mb-2 uppercase tracking-wide text-sm">Filters</h3>
          <div className="flex space-x-4">
            {Object.keys(filters).map(country => (
              <label key={country} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[country]}
                  onChange={() => onFilterChange(country)}
                  className="form-checkbox h-5 w-5 bg-gray-800 border-green-900 text-green-500 rounded focus:ring-green-600"
                />
                <span className="font-mono text-sm">{country === 'EE. UU.' ? 'United States' : country}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {Object.keys(groupedLocations).sort().map((region) => (
            <div key={region} className="mb-4">
              <h3 className="font-mono font-bold text-sm text-green-400 p-3 bg-gray-900/90 border-b border-green-900 sticky top-0 uppercase tracking-wide">{region}</h3>
              <ul>
                {groupedLocations[region].map(location => (
                  <li
                    key={location.id}
                    onClick={() => onLocationSelect(location)}
                    className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 transition-colors"
                  >
                    <p className="font-mono font-semibold text-sm">{location.name}</p>
                    <p className="font-mono text-xs text-gray-500 uppercase tracking-wide">{location.type}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-20" />}
    </>
  );
};

export default Sidebar;