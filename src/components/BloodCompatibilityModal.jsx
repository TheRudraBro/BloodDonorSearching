import React from 'react';

const compatibilityMatrix = [
  { group: "A+", giveTo: ["A+", "AB+"], receiveFrom: ["A+", "A-", "O+", "O-"] },
  { group: "O+", giveTo: ["O+", "A+", "B+", "AB+"], receiveFrom: ["O+", "O-"] },
  { group: "B+", giveTo: ["B+", "AB+"], receiveFrom: ["B+", "B-", "O+", "O-"] },
  { group: "AB+", giveTo: ["AB+"], receiveFrom: ["Everyone (Universal Recipient)"] },
  { group: "A-", giveTo: ["A+", "A-", "AB+", "AB-"], receiveFrom: ["A-", "O-"] },
  { group: "O-", giveTo: ["Everyone (Universal Donor)"], receiveFrom: ["O-"] },
  { group: "B-", giveTo: ["B+", "B-", "AB+", "AB-"], receiveFrom: ["B-", "O-"] },
  { group: "AB-", giveTo: ["AB+", "AB-"], receiveFrom: ["AB-", "A-", "B-", "O-"] },
];

const BloodCompatibilityModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🩸</span> Blood Group Compatibility Chart
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Learn which blood groups are compatible for safe blood donation and reception.
        </p>

        {/* Compatibility Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="table w-full text-white text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Can Give Blood To (Donates)</th>
                <th className="py-3 px-4">Can Receive Blood From</th>
              </tr>
            </thead>
            <tbody>
              {compatibilityMatrix.map((item, index) => (
                <tr key={index} className="bg-slate-900 border-b border-slate-800/60 hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-red-500 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                      {item.group}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">
                    {item.giveTo.join(", ")}
                  </td>
                  <td className="py-3 px-4 font-semibold text-sky-400">
                    {item.receiveFrom.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="btn bg-red-600 hover:bg-red-700 text-white border-none text-xs font-bold px-6"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default BloodCompatibilityModal;