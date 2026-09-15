import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import OpportunityCard from './OpportunityCard';
import { supabase } from '../lib/auth';

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOpportunities(data || []);
      } catch (err) {
        console.error('Error fetching opportunities:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Top Header Row: Title & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        
        {/* Title Area */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Personalized Feed
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Curated tasks for your career ladder.
          </p>
        </div>

        {/* Pill-shaped Filter Bar */}
        <div className="flex bg-gray-100 p-1.5 rounded-full self-start shadow-inner border border-gray-200/60 overflow-x-auto max-w-full">
          <button className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap rounded-full">
            Everything
          </button>
          <button className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap rounded-full">
            High School
          </button>
          <button className="px-5 py-2 text-sm font-bold text-gray-900 bg-white rounded-full shadow-sm whitespace-nowrap transition-transform active:scale-95">
            Undergraduate
          </button>
          <button className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap rounded-full">
            Graduate / PhD
          </button>
          <button className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap rounded-full">
            Professional
          </button>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="relative flex items-center w-full mb-10">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input 
          type="text" 
          placeholder="Search opportunities, roles, or skills..." 
          className="w-full py-4 pl-12 pr-32 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-sm"
        />

        {/* 'ALL TASKS' Filter Button inside the search bar */}
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            ALL TASKS
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid rendering the cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-gray-500 animate-pulse font-medium">Loading your opportunities...</div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No opportunities found. Run your python scraper to populate the database!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
