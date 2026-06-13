"use client";

import * as React from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Biểu cảm",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😋", "😛", "😜", 
      "🤪", "🤨", "😎", "🤓", "🧐", "🥳", "😏", "😒", "😔", "😟", 
      "😕", "😢", "😭", "😤", "😠", "😡", "🤯", "😳", "🥵", "🥶", 
      "😱", "😨", "😰", "🤔", "🫣", "🤫", "🤥", "😐", "😑", "😬",
      "🫨", "😴", "🤢", "🤮", "🤠", "😷", "😈", "👿", "👻", "💀"
    ]
  },
  {
    id: "hands",
    name: "Cử chỉ",
    icon: "👍",
    emojis: [
      "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "👏", 
      "🙌", "🙏", "🤝", "✍️", "🤳", "💪", "🧠", "🦷", "👀", "👁️", 
      "👂", "👃", "👣", "✊", "👊", "🤛", "🤜", "☝️", "👆", "👇",
      "👈", "👉", "🖕", "🖐️", "✋", "🖖", "💄", "💅", "💆", "💇"
    ]
  },
  {
    id: "nature",
    name: "Tự nhiên",
    icon: "🐱",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", 
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐝", 
      "🦋", "🐌", "🐞", "🐢", "🐍", "🐙", "🐠", "🐬", "🌲", "🌳", 
      "🌴", "🌵", "🌾", "🌿", "🍀", "🍁", "🍂", "🌸", "🌹", "🌻", 
      "🌞", "🌝", "🌙", "⭐", "☁️", "🌧️", "❄️", "🔥", "🌈", "🌊"
    ]
  },
  {
    id: "food",
    name: "Ẩm thực",
    icon: "🍔",
    emojis: [
      "🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🍍", "🥥", "🥝", "🍅", 
      "🍆", "🥑", "🥦", "🌽", "🍞", "🍕", "🍔", "🍟", "🌮", "🍣", 
      "🍜", "🍰", "🍩", "🍪", "🍫", "🍬", "🍿", "🍺", "🍷", "☕", 
      "🥤", "🍨", "🧁", "🍳", "🧇", "🥩", "🍗", "🌭", "🧂", "🧉"
    ]
  },
  {
    id: "activities",
    name: "Hoạt động & Biểu tượng",
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎮", "🎯", "🎲", 
      "🎸", "🎨", "🎬", "🚗", "✈️", "⏰", "💡", "💻", "📱", "✉️", 
      "🔑", "🔒", "❤️", "💔", "💕", "💖", "💝", "💬", "🔔", "⚙️", 
      "🚧", "🚩", "🏳️‍🌈", "☠️", "🛸", "🌍", "✨", "🎈", "🎉", "🎁"
    ]
  }
];

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = React.useState("smileys");
  const pickerRef = React.useRef<HTMLDivElement | null>(null);

  // Close picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const activeEmojis = React.useMemo(() => {
    return EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis || [];
  }, [activeCategory]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-16 right-12 z-50 w-72 h-80 bg-white dark:bg-[#22272b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Category Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1d2125]/50 px-2 pt-2 pb-1 gap-1 shrink-0">
        {EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            title={category.name}
            className={`flex-1 py-1.5 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none ${
              activeCategory === category.id
                ? "bg-blue-50 dark:bg-slate-800/80 scale-105 border border-blue-100 dark:border-slate-700"
                : ""
            }`}
          >
            {category.icon}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-3 custom-chat-scrollbar">
        <div className="grid grid-cols-7 gap-1">
          {activeEmojis.map((emoji, idx) => (
            <button
              key={`${activeCategory}-${idx}`}
              type="button"
              onClick={() => onSelect(emoji)}
              className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all transform hover:scale-125 cursor-pointer active:scale-95 select-none"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Category Name */}
      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1d2125]/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 select-none">
        {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.name}
      </div>
    </div>
  );
}
