import React from 'react';
import { 
  Sparkles, Flame, Bot, Sun, DollarSign, Dumbbell, Gamepad2, Wand2, Smile, Tv 
} from 'lucide-react';

const iconMap = {
  Sparkles,
  Flame,
  Bot,
  Sun,
  DollarSign,
  Dumbbell,
  Gamepad2,
  Wand2,
  Smile,
  Tv
};

export default function CategoryFilter({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="py-3 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'glow-amber-btn text-white scale-[1.03] shadow-md'
                  : 'bg-white/95 hover:bg-amber-50 text-slate-700 hover:text-slate-950 border border-amber-200/90 shadow-2xs'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-600'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
