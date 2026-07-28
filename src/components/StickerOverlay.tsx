import React, { useState } from 'react';
import { PlacedSticker } from '../lib/stickers';

interface StickerOverlayProps {
  stickers: PlacedSticker[];
  onRemoveSticker: (id: string) => void;
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
}

export const StickerOverlay: React.FC<StickerOverlayProps> = ({
  stickers,
  onRemoveSticker,
  onUpdateSticker,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (stickers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {stickers.map((sticker) => {
        const isSelected = selectedId === sticker.id;

        return (
          <div
            key={sticker.id}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
            }}
            className="absolute pointer-events-auto group cursor-grab active:cursor-grabbing select-none transition-transform duration-100"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(sticker.id === selectedId ? null : sticker.id);
            }}
          >
            {/* Sticker Content */}
            <div className="relative flex items-center justify-center">
              {sticker.type === 'emoji' ? (
                <span className="text-4xl filter drop-shadow-md hover:scale-110 transition-transform inline-block leading-none">
                  {sticker.content}
                </span>
              ) : (
                <div
                  style={{ background: sticker.bg, color: sticker.textColor }}
                  className="px-3.5 py-1.5 rounded-full font-mono-caps text-xs font-black tracking-widest uppercase shadow-xl border border-white/40 backdrop-blur-xs text-center flex items-center gap-1"
                >
                  {sticker.content}
                </div>
              )}

              {/* Controls overlay (visible on hover or when selected) */}
              <div
                className={`no-capture absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-white/30 text-white text-[10px] shadow-lg transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {/* Rotate */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateSticker(sticker.id, {
                      rotation: (sticker.rotation + 15) % 360,
                    });
                  }}
                  className="hover:text-emerald-400 p-0.5"
                  title="Pivoter"
                >
                  🔄
                </button>

                {/* Scale Up */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newScale = sticker.scale >= 1.8 ? 0.8 : sticker.scale + 0.2;
                    onUpdateSticker(sticker.id, { scale: Number(newScale.toFixed(1)) });
                  }}
                  className="hover:text-emerald-400 p-0.5 font-bold font-mono"
                  title="Taille"
                >
                  🔍
                </button>

                {/* Remove */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSticker(sticker.id);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold p-0.5 ml-1"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
