import { useCallback, useEffect, useRef, useState } from 'react';

type UseCollapsibleControlOptions = {
  collapsible: boolean;
  inline: boolean;
  visible?: boolean;
  onClose?: () => void;
};

export function useCollapsibleControl({
  collapsible,
  inline,
  visible,
  onClose,
}: UseCollapsibleControlOptions) {
  const [open, setOpen] = useState(!collapsible);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!collapsible) {
      setOpen(true);
    }
  }, [collapsible]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const closeIfInactive = useCallback(() => {
    const stillHovering = containerRef.current?.matches(':hover');
    const isFocused = document.activeElement === inputRef.current;

    if (!stillHovering && !isFocused) {
      setOpen(false);
    }
  }, [setOpen]);

  useEffect(() => {
    if (inline) return;
    if (open) {
      focusInput();
    }
  }, [inline, open, focusInput]);

  useEffect(() => {
    if (!inline || !visible) return;

    const timer = window.setTimeout(() => focusInput(), 50);
    return () => clearTimeout(timer);
  }, [inline, visible, focusInput]);

  useEffect(() => {
    if (!inline) return;

    const handleDocClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!(event.target instanceof Node)) return;
      if (!containerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [inline, onClose]);

  return { open, setOpen, containerRef, inputRef, focusInput, closeIfInactive };
}
