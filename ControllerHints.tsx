import { useEffect, useState } from 'react';
import { controllerManager } from '../utils/controllerManager';
import { Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ControllerHints() {
  const [isConnected, setIsConnected] = useState(false);
  const [controllerType, setControllerType] = useState<'xbox' | 'playstation' | 'generic'>('generic');

  useEffect(() => {
    const checkController = setInterval(() => {
      setIsConnected(controllerManager.isConnected());
      setControllerType(controllerManager.getControllerType());
    }, 1000);

    return () => clearInterval(checkController);
  }, []);

  const getButtonName = (button: string) => {
    if (controllerType === 'playstation') {
      const psMap: Record<string, string> = {
        'A': 'Cross (✕)',
        'B': 'Circle (○)',
        'X': 'Square (□)',
        'Y': 'Triangle (△)',
        'LB': 'L1',
        'RB': 'R1',
        'LT': 'L2',
        'RT': 'R2',
        'Start': 'Options',
        'Select': 'Share'
      };
      return psMap[button] || button;
    }
    return button;
  };

  if (!isConnected) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 z-40 bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-green-400" />
          <div className="text-sm">
            <p className="font-bold mb-1">Controller Connected</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>• Right Stick: Move cursor</p>
              <p>• {getButtonName('A')}: Select/Click</p>
              <p>• Shoulders/Triggers/D-Pad: Scroll</p>
              <p>• Edge scrolling: Auto when near top/bottom</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
