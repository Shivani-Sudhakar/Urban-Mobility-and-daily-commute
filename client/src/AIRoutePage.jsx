import React, { useState } from 'react';
import { Navigation, Clock, Banknote, MapPin, Zap } from 'lucide-react';

export default function AIRoutePage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSearchRoutes = async (e) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) {
      setErr('Please fill out both entry bars to compute paths.');
      return;
    }

    setLoading(true);
    setErr('');
    try {
      const res = await fetch('http://localhost:5000/api/route/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: from.trim(), to: to.trim() })
      });
      
      if (!res.ok) throw new Error('Network fault evaluating maps.');
      const data = await res.json();
      setRoutes(data);
    } catch (error) {
      setErr('Could not establish connection to the backend server calculation engine.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 font-inter max-w-md mx-auto pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Navigation className="text-[#0f766e]" size={24} />
        <h1 className="text-xl font-bold text-slate-800">Namma AI Smart Router</h1>
      </div>

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
              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-[#0f766e] transition-colors"
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
              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-[#0f766e] transition-colors"
            />
          </div>
        </div>

        {err && <p className="text-xs font-semibold text-rose-500">{err}</p>}

        <button type="submit" disabled={loading} className="w-full bg-[#0f766e] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0d635c] transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50">
          {loading ? 'Processing Dynamic AI Matrices...' : 'Generate Route Strategy'}
        </button>
      </form>

      {routes && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 px-1 font-medium">Approximate Distance: <span className="text-slate-700 font-bold">{routes.fastest.distance} km</span></p>
          
          {/* FASTEST STRATEGY CONTAINER */}
          <div className="bg-white border-2 border-amber-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold rounded-bl-lg flex items-center gap-1">
              <Zap size={10} /> Fastest Method
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">{routes.fastest.mode}</h3>
            <p className="text-xs text-slate-500 mb-4 pr-16 leading-relaxed">{routes.fastest.description}</p>
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Clock size={16} className="text-[#0f766e]" /> {routes.fastest.time} mins
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base">
                <Banknote size={18} className="text-emerald-600" /> ₹{routes.fastest.cost}
              </div>
            </div>
          </div>

          {/* CHEAPEST STRATEGY CONTAINER */}
          <div className="bg-white border-2 border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold rounded-bl-lg">
              Cheapest Method
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">{routes.cheapest.mode}</h3>
            <p className="text-xs text-slate-500 mb-4 pr-16 leading-relaxed">{routes.cheapest.description}</p>
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
