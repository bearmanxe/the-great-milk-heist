import { useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

interface EdgeFunctionCheckProps {
  onStatusChange?: (isAvailable: boolean) => void;
}

export function EdgeFunctionCheck({ onStatusChange }: EdgeFunctionCheckProps) {
  // Multiplayer has been removed from this game
  // This component is kept for compatibility but always reports unavailable
  
  useEffect(() => {
    // Immediately report as unavailable since multiplayer is removed
    onStatusChange?.(false);
  }, [onStatusChange]);

  return (
    <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-1">Multiplayer Not Available</h3>
          <p className="text-sm text-blue-800 mb-2">
            This game features local co-op mode instead of online multiplayer.
          </p>
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-bold">✅ Available Game Modes:</p>
            <ul className="list-none space-y-1 ml-2 text-xs">
              <li>✓ Single Player</li>
              <li>✓ Local Co-op (2 players, same computer)</li>
              <li>✓ Normal & Reverse Mode</li>
              <li>✓ 4 Difficulty Levels</li>
            </ul>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onStatusChange?.(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Continue with Local Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
