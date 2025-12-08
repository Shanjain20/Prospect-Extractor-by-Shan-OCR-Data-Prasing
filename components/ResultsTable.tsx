import React, { useState } from 'react';
import { Download, Search, AlertCircle, FileSpreadsheet, Copy } from 'lucide-react';
import { Prospect } from '../types';

interface ResultsTableProps {
  prospects: Prospect[];
  onExport: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ prospects, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProspects = prospects.filter(p => 
    Object.values(p).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const copyToClipboard = (text: string) => {
    if(navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  if (prospects.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-4">
        <div>
           <h2 className="text-lg font-semibold text-gray-900">Extracted Prospects</h2>
           <p className="text-sm text-gray-500">Found {prospects.length} entries</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
            />
          </div>
          
          <button 
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Phone", "Company", "Email", "Address"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProspects.length > 0 ? (
              filteredProspects.map((person, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.Name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-indigo-600 cursor-pointer" onClick={() => copyToClipboard(person.PhoneNumber)}>
                    {person.PhoneNumber || <span className="text-gray-300 italic">--</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {person.Company || <span className="text-gray-300 italic">--</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-indigo-600 cursor-pointer" onClick={() => copyToClipboard(person.Email)}>
                    {person.Email || <span className="text-gray-300 italic">--</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={person.Address}>
                    {person.Address || <span className="text-gray-300 italic">--</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-10 h-10 text-gray-300" />
                    <p>No prospects found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-xs text-gray-500 flex justify-between">
          <span>Click on Email/Phone to copy</span>
          <span>Showing {filteredProspects.length} entries</span>
      </div>
    </div>
  );
};