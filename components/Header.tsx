import React from 'react';
import { ScanText, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ScanText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Prospect Extractor</h1>
              <p className="text-xs text-gray-500 font-medium">AI-Powered OCR & Data Parsing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">
                <Zap className="w-4 h-4" />
                <span>Powered by Gemini 2.5 Flash</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};
