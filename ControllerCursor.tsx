import { useState, useEffect, useRef } from 'react';
import { controllerManager } from '../utils/controllerManager';
import { Gamepad2, ChevronUp, ChevronDown } from 'lucide-react';

interface ControllerCursorProps {
  onElementClick?: (element: HTMLElement) => void;
}

export function ControllerCursor({ onElementClick }: ControllerCursorProps) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const cursorSpeed = 8;
  const scrollSpeed = 20;
  const edgeScrollThreshold = 100; // Distance from edge to trigger auto-scroll
  const animationFrameRef = useRef<number>();
  const lastScrollTimeRef = useRef<number>(0);
  const scrollCooldown = 150; // ms between scroll actions
  const scrollIndicatorTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateCursor = () => {
      controllerManager.update();
      
      // Only show cursor if controller is connected and being used
      const isConnected = controllerManager.isConnected();
      setIsVisible(isConnected);

      if (!isConnected) {
        animationFrameRef.current = requestAnimationFrame(updateCursor);
        return;
      }

      // Get right joystick input for cursor movement
      const movement = controllerManager.getCursorMovement();
      
      if (movement.x !== 0 || movement.y !== 0) {
        setPosition(prev => {
          const newX = Math.max(0, Math.min(window.innerWidth - 20, prev.x + movement.x * cursorSpeed));
          const newY = Math.max(0, Math.min(window.innerHeight - 20, prev.y + movement.y * cursorSpeed));
          
          // Check what element is under the cursor
          const elements = document.elementsFromPoint(newX + 10, newY + 10);
          const interactiveElement = elements.find(el => 
            el instanceof HTMLElement && (
              el.tagName === 'BUTTON' ||
              el.tagName === 'A' ||
              el.hasAttribute('data-cursor-interactive') ||
              el.closest('button') ||
              el.closest('a')
            )
          );
          
          if (interactiveElement instanceof HTMLElement) {
            const button = interactiveElement.closest('button') || 
                          interactiveElement.closest('a') || 
                          interactiveElement;
            setHoveredElement(button as HTMLElement);
          } else {
            setHoveredElement(null);
          }
          
          return { x: newX, y: newY };
        });
      }

      // Check for A button press to click
      if (controllerManager.getButtonPressed('a') && hoveredElement) {
        // Trigger click on hovered element
        hoveredElement.click();
        controllerManager.vibrate(100, 0.3, 0.3);
        if (onElementClick) {
          onElementClick(hoveredElement);
        }
      }

      // Handle scrolling with shoulder buttons (LB/RB), triggers (LT/RT), and D-pad
      const currentTime = Date.now();
      if (currentTime - lastScrollTimeRef.current > scrollCooldown) {
        const scrollUp = controllerManager.getButton('lb') || 
                        controllerManager.getButton('lt') || 
                        controllerManager.getButtonPressed('up');
        const scrollDown = controllerManager.getButton('rb') || 
                          controllerManager.getButton('rt') || 
                          controllerManager.getButtonPressed('down');
        
        if (scrollUp) {
          // Scroll up
          window.scrollBy({ top: -scrollSpeed, behavior: 'smooth' });
          lastScrollTimeRef.current = currentTime;
          controllerManager.vibrate(50, 0.2, 0.2);
          
          // Show scroll indicator
          setScrollDirection('up');
          if (scrollIndicatorTimeoutRef.current) {
            clearTimeout(scrollIndicatorTimeoutRef.current);
          }
          scrollIndicatorTimeoutRef.current = setTimeout(() => {
            setScrollDirection(null);
          }, 500);
        } else if (scrollDown) {
          // Scroll down
          window.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
          lastScrollTimeRef.current = currentTime;
          controllerManager.vibrate(50, 0.2, 0.2);
          
          // Show scroll indicator
          setScrollDirection('down');
          if (scrollIndicatorTimeoutRef.current) {
            clearTimeout(scrollIndicatorTimeoutRef.current);
          }
          scrollIndicatorTimeoutRef.current = setTimeout(() => {
            setScrollDirection(null);
          }, 500);
        }
      }

      // Auto-scroll when cursor is near screen edges
      const viewportHeight = window.innerHeight;
      if (position.y < edgeScrollThreshold) {
        // Near top edge - scroll up
        const scrollAmount = -((edgeScrollThreshold - position.y) / edgeScrollThreshold) * 5;
        window.scrollBy({ top: scrollAmount, behavior: 'auto' });
      } else if (position.y > viewportHeight - edgeScrollThreshold) {
        // Near bottom edge - scroll down
        const scrollAmount = ((position.y - (viewportHeight - edgeScrollThreshold)) / edgeScrollThreshold) * 5;
        window.scrollBy({ top: scrollAmount, behavior: 'auto' });
      }

      animationFrameRef.current = requestAnimationFrame(updateCursor);
    };

    animationFrameRef.current = requestAnimationFrame(updateCursor);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scrollIndicatorTimeoutRef.current) {
        clearTimeout(scrollIndicatorTimeoutRef.current);
      }
    };
  }, [hoveredElement, onElementClick]);

  // Add visual highlight to hovered elements
  useEffect(() => {
    if (hoveredElement) {
      hoveredElement.style.outline = '3px solid #667eea';
      hoveredElement.style.outlineOffset = '2px';
      return () => {
        hoveredElement.style.outline = '';
        hoveredElement.style.outlineOffset = '';
      };
    }
  }, [hoveredElement]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 animate-pulse">
            <div className="w-10 h-10 bg-purple-500 rounded-full blur-lg opacity-50"></div>
          </div>
          
          {/* Main cursor */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hoveredElement 
              ? 'bg-gradient-to-br from-green-400 to-blue-500 scale-125' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Interaction hint */}
          {hoveredElement && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white px-2 py-1 rounded text-xs">
              Press A to select
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {scrollDirection && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 pointer-events-none z-[9999]">
          <div className="bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
            {scrollDirection === 'up' ? (
              <>
                <ChevronUp className="w-8 h-8" />
                <span>Scrolling Up</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-8 h-8" />
                <span>Scrolling Down</span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
