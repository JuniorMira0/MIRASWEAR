'use client';

import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
} from 'react';

import { cn } from '@/lib/utils';

import { CollapsibleSearchField } from './components/collapsible-search-field';
import { SearchResultsList } from './components/search-results-list';
import { StaticSearchField } from './components/static-search-field';
import { useCollapsibleControl } from './hooks/use-collapsible-control';
import { useSearchState } from './hooks/use-search-state';
import type { SearchBoxProps } from './types';

export default function SearchBox({
  inline = false,
  visible,
  onClose,
  initialQuery,
  syncQueryToUrl,
  collapsible = false,
  expandLeft = false,
  showResults = true,
  hideInput = false,
}: SearchBoxProps) {
  const router = useRouter();

  const { query, setQuery, results, loading } = useSearchState({
    router,
    initialQuery,
    showResults,
    syncQueryToUrl,
  });

  const { open, setOpen, containerRef, inputRef, focusInput, closeIfInactive } =
    useCollapsibleControl({ collapsible, inline, visible, onClose });

  const shouldShowResults = showResults && (inline || !collapsible || open);
  const showCollapsibleInput = collapsible && !hideInput;
  const showStaticInput = !collapsible && !hideInput;

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    router.push(`/busca?busca=${encodeURIComponent(trimmed)}`);

    if (!inline && !collapsible) {
      setOpen(false);
      onClose?.();
    }
  }, [query, router, inline, collapsible, onClose, setOpen]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [setQuery],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const openAndFocus = useCallback(() => {
    if (!open) {
      setOpen(true);
    }
    requestAnimationFrame(() => focusInput());
  }, [open, setOpen, focusInput]);

  const handleMouseEnter = useCallback(() => {
    if (collapsible) {
      setOpen(true);
    }
  }, [collapsible, setOpen]);

  const scheduleCollapse = useCallback(() => {
    if (!collapsible) return;
    window.setTimeout(() => {
      closeIfInactive();
    }, 80);
  }, [collapsible, closeIfInactive]);

  const handleIconMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      openAndFocus();
    },
    [openAndFocus],
  );

  const handleIconClick = useCallback(() => {
    if (!query.trim()) {
      return;
    }

    handleSubmit();
  }, [query, handleSubmit]);

  return (
    <div ref={containerRef} className="max-w-full">
      <div className="w-full transform transition-all duration-200">
        {showCollapsibleInput ? (
          <CollapsibleSearchField
            query={query}
            expandLeft={expandLeft}
            open={open}
            inputRef={inputRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={scheduleCollapse}
            onBlur={scheduleCollapse}
            onIconClick={handleIconClick}
            onIconMouseDown={handleIconMouseDown}
            onRequestOpen={openAndFocus}
          />
        ) : null}

        {showStaticInput ? (
          <StaticSearchField
            query={query}
            inline={inline}
            inputRef={inputRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        ) : null}

        {shouldShowResults ? (
          <div className={cn('mt-3', hideInput && 'mt-0')}>
            <SearchResultsList loading={loading} query={query} results={results} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
