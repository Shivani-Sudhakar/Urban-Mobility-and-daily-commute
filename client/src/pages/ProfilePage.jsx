import React from 'react';

export default function ProfilePage({ user, onLogout }) {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] justify-between">
      <div className="flex flex-col">
        <header className="px-6 py-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-[#1e293b] font-inter">Profile</h1>
        </header>

        <main className="p-6 flex flex-col gap-6">
          {/* User Info Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div>
              <span className="text-[12px] font-medium text-[#64748b] uppercase tracking-wider block mb-1">
                Name
              </span>
              <span className="text-base font-semibold text-[#1e293b]">
                {user?.name || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-[12px] font-medium text-[#64748b] uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <span className="text-base font-medium text-[#1e293b]">
                {user?.email || 'N/A'}
              </span>
            </div>
          </div>
        </main>
      </div>

      <div className="p-6">
        <button
          onClick={onLogout}
          className="w-full py-3 bg-[#EF4444] text-white font-semibold rounded-lg text-[14px] hover:bg-[#DC2626] transition-colors cursor-pointer text-center"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
