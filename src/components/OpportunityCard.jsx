import React from 'react';
import { Code, Heart, MapPin, Square, ExternalLink } from 'lucide-react';

export default function OpportunityCard({ opportunity }) {
  const { title, organization, category, deadline, opportunity_link } = opportunity;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full group">
      
      {/* Top Row: Icons */}
      <div className="flex justify-between items-center mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Code className="w-5 h-5 text-blue-500" />
        </div>
        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-50">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Body Section */}
      <div className="flex-1 flex flex-col items-start mb-6">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md tracking-wider uppercase mb-3">
          {category}
        </span>
        
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {title}
        </h3>
        
        <div className="flex flex-col gap-1.5 mt-auto w-full">
          <p className="text-sm font-medium text-gray-500 truncate">
            {organization}
          </p>
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
            <span className="truncate">{deadline || 'Remote'}</span>
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-900 rounded-lg shrink-0">
          <Square className="w-4 h-4 text-white fill-current" />
        </div>
        
        <a 
          href={opportunity_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-5 rounded-xl transition-transform active:scale-95 shadow-sm"
        >
          APPLY
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      
    </div>
  );
}
