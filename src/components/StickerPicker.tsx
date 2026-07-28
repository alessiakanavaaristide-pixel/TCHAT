import React, { useState } from 'react';
import { STICKER_LIBRARY, PresetSticker, PlacedSticker } from '../lib/stickers';

interface StickerPickerProps {
  placedStickers: PlacedSticker[];
  onAddSticker: (sticker: PresetSticker) => void;
  onRemoveSticker: (id: string) => void;
  onClearAll: () => void;
  onUpdateSticker?: (id: string, updates: Partial<PlacedSticker>) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  placedStickers,
  onAddSticker,
  onRemoveSticker,
  onClearAll,
  onUpdateSticker,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'stickers' | 'emojis'>('badges');
  const [isOpen, setIsOpen] = useState(false);

  const filteredStickers = STICKER_LIBRARY.filter((s) => s.category === activeTab);

  return (
    <div className="bg-white rounded-2xl border border-[#ebe1d4] p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-display font-bold text-[#1c1b1b] hover:text-[#25D366] transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-emerald-600">
            {isOpen ? 'expand_less' : 'add_circle'}
          </span>
          <span>
            {isOpen ? 'Masquer la bibliothèque de stickers' : '🎨 Ajouter des Stickers & Emojis à l\'image'}
          </span>
          {placedStickers.length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
              {placedStickers.length}
            </span>
          )}
        </button>

        {placedStickers.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-mono-caps text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Tout Effacer
          </button>
        )}
      </div>

      {/* Quick list of currently active stickers */}
      {placedStickers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#f1e8dc]">
          <span className="text-[10px] font-mono text-[#787875] mr-1 self-center">Sur l'image:</span>
          {placedStickers.map((ps, idx) => (
            <div
              key={ps.id}
              className="inline-flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded-full text-xs"
            >
              <span className="truncate max-w-[100px]">{ps.content}</span>
              {/* Rotation toggle */}
              {onUpdateSticker && (
                <button
                  onClick={() => onUpdateSticker(ps.id, { rotation: (ps.rotation + 15) % 360 })}
                  className="text-[10px] text-slate-500 hover:text-black font-mono ml-0.5"
                  title="Pivoter"
                >
                  🔄
                </button>
              )}
              {/* Delete */}
              <button
                onClick={() => onRemoveSticker(ps.id)}
                className="text-red-500 hover:text-red-700 font-bold ml-1 text-[11px]"
                title="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expandable Picker Body */}
      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-[#f1e8dc]">
          {/* Category Tabs */}
          <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono-caps font-bold transition-all ${
                activeTab === 'badges'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🔥 Badges ({STICKER_LIBRARY.filter((s) => s.category === 'badges').length})
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono-caps font-bold transition-all ${
                activeTab === 'stickers'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🎨 Stickers ({STICKER_LIBRARY.filter((s) => s.category === 'stickers').length})
            </button>
            <button
              onClick={() => setActiveTab('emojis')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono-caps font-bold transition-all ${
                activeTab === 'emojis'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              😀 Emojis ({STICKER_LIBRARY.filter((s) => s.category === 'emojis').length})
            </button>
          </div>

          {/* Sticker Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {filteredStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onAddSticker(sticker)}
                className="group relative p-2 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left flex items-center justify-center min-h-[42px] shadow-2xs active:scale-95"
              >
                {sticker.type === 'badge' || sticker.type === 'sticker' ? (
                  <span
                    style={{ background: sticker.bg, color: sticker.textColor }}
                    className="px-2 py-1 rounded-full text-[10px] font-mono-caps font-extrabold tracking-wider shadow-xs uppercase truncate max-w-full"
                  >
                    {sticker.content}
                  </span>
                ) : (
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {sticker.content}
                  </span>
                )}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-mono text-[#787875] text-center italic">
            💡 Astuce : Cliquez sur un sticker pour l'ajouter sur votre visuel Story. Vous pouvez en mettre plusieurs !
          </p>
        </div>
      )}
    </div>
  );
};
