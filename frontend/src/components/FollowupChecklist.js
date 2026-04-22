import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function FollowupChecklist({ items }) {
  const [checkedItems, setCheckedItems] = useState({});

  // Reset checkboxes when new data arrives
  useEffect(() => {
    setCheckedItems({});
  }, [items]);

  const toggleItem = (index) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-[#edf2ed] p-6 rounded-[2rem] border border-[#dae3da] mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#2e7d32] rounded-md p-1">
            <Check size={14} className="text-white" />
          </div>
          <h3 className="text-gray-700 text-sm font-medium">
            Follow-up · ಅನುಸರಣಾ ಪರಿಶೀಲನೆ
          </h3>
        </div>
        <span className="text-[#2e7d32] text-sm font-bold">
          {completedCount}/{items.length}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 cursor-pointer group" onClick={() => toggleItem(index)}>
            <div className={`w-6 h-6 rounded-md border-2 shrink-0 transition-colors flex items-center justify-center ${
              checkedItems[index] ? 'bg-[#2e7d32] border-[#2e7d32]' : 'bg-white border-gray-300'
            }`}>
              {checkedItems[index] && <Check size={16} className="text-white" />}
            </div>
            <div>
              <p className={`text-sm leading-tight ${checkedItems[index] ? 'text-gray-400 line-through' : 'text-[#4a4a4a]'}`}>
                {item.en}
              </p>
              <p className={`text-sm mt-0.5 ${checkedItems[index] ? 'text-gray-300 line-through' : 'text-[#8a8a8a]'}`}>
                {item.kn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}