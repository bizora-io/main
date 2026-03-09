import React, { useEffect } from 'react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // Prevent common keyboard shortcuts for DevTools and saving
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac) - DevTools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      
      // Ctrl+Shift+J (Windows/Linux) or Cmd+Option+J (Mac) - Console
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      
      // Ctrl+Shift+C (Windows/Linux) or Cmd+Option+C (Mac) - Inspect Element
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }

      // Ctrl+U (Windows/Linux) or Cmd+Option+U (Mac) - View Source
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }

      // Ctrl+S (Windows/Linux) or Cmd+S (Mac) - Save Page
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
      
      // Ctrl+P (Windows/Linux) or Cmd+P (Mac) - Print Page
      if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
      }
    };

    // Prevent drag and drop of images/text
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // Detect DevTools opening (basic detection)
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDiff || heightDiff) {
        // DevTools might be open, we could clear console or show a warning
        console.clear();
        console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold;");
        console.log("%cThis is a browser feature intended for developers. Do not paste any code here.", "font-size: 18px;");
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('resize', detectDevTools);

    // Initial check and periodic check
    detectDevTools();
    const interval = setInterval(detectDevTools, 2000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="security-wrapper h-full w-full">
      {children}
    </div>
  );
};

export default SecurityWrapper;
