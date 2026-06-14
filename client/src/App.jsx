import React, { useState } from 'react';
import { Navigation, Clock, Banknote, MapPin, Zap, AlertCircle, RefreshCw } from 'lucide-react';

export default function AIRoutePage() {
  // Input tracking states
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  // Data and UI feedback states
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSearchRoutes = async (e) => {
    e.preventDefault();
    
    // Validation: Check if inputs are blank
    if (!from.trim() || !to.trim()) {
      setErr('Please fill out both the departure and destination hubs.');
      return;
    }

    setLoading(true);
    setErr('');
    setRoutes(null);

    try {
      // Connects directly to the backend endpoint you configured in your server file
      const res = await fetch('http://localhost:5000/api/route/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          from: from.trim(), 
          to: to.trim() 
        })
      });
      
      if (!res.ok) {
        throw new Error('Server returned an evaluation fault.');
      }
      
      const data = await res.json();
      setRoutes(data);
    } catch (error) {
      setErr('Could not establish connection to the backend route engine.');
      console.error('Routing fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 font-inter max-w-md mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex items-center gap-2 mb-6">
        <Navigation className="text-[#0f766e]" size={24} strokeWidth={2.5} />
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Namma AI Smart Router</h1>
      </div>

      {/* Input Form Card */}
      <form onSubmit={handleSearchRoutes} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Starting Hub</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} />
            <input 
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g., Central, Guindy, Adyar, SSN"
              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-[#0f766e] transition-colors shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination Hub</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-rose-500" size={16} />
            <input 
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g., Guindy, T_Nagar, Sholinganallur, SSN"
              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-[#0f766e] transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Dynamic Error Messaging banner */}
        {err && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-600 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <p>{err}</p>
          </div>
        )}

        {/* Interactive Submit Button */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#0f766e] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0d635c] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 shadow-md active:scale-[0.99]"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Compiling Transit Matrices...
            </>
          ) : (
            'Generate Route Strategy'
          )}
        </button>
      </form>

      {/* Results Dynamic Matrices Renders */}
      {routes && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-slate-400 font-medium">
              Evaluated Distance: <span className="text-slate-700 font-bold">{routes.fastest.distance} km</span>
            </p>
          </div>
          
          {/* OPTION CARD 1: FASTEST METHOD STRATEGY */}
          <div className="bg-white border-2 border-amber-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold rounded-bl-lg flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> Fastest Method
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1 pr-24">{routes.fastest.mode}</h3>
            <p className="text-xs text-slate-500 mb-4 pr-4 leading-relaxed">{routes.fastest.description}</p>
            
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Clock size={16} className="text-[#0f766e]" /> {routes.fastest.time} mins
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base">
                <Banknote size={18} className="text-emerald-600" /> ₹{routes.fastest.cost}
              </div>
            </div>
          </div>

          {/* OPTION CARD 2: CHEAPEST METHOD STRATEGY */}
          <div className="bg-white border-2 border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold rounded-bl-lg">
              Cheapest Method
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1 pr-24">{routes.cheapest.mode}</h3>
            <p className="text-xs text-slate-500 mb-4 pr-4 leading-relaxed">{routes.cheapest.description}</p>
            
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Clock size={16} className="text-[#0f766e]" /> {routes.cheapest.time} mins
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base">
                <Banknote size={18} className="text-emerald-600" /> ₹{routes.cheapest.cost}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
