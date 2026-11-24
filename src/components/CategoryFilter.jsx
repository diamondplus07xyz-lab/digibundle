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
    <div className="py-2 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-950 text-white shadow-md scale-102'
                  : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-300 shadow-xs'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
