import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
} from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type CollapsibleSearchFieldProps = {
  query: string;
  expandLeft: boolean;
  open: boolean;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onBlur: () => void;
  onIconClick: () => void;
  onIconMouseDown: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onRequestOpen: () => void;
};

export function CollapsibleSearchField({
  query,
  expandLeft,
  open,
  inputRef,
  onChange,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onBlur,
  onIconClick,
  onIconMouseDown,
  onRequestOpen,
}: CollapsibleSearchFieldProps) {
  return (
    <div
      className={cn(
        'group relative flex h-9 items-center',
        expandLeft ? 'justify-end' : 'justify-start',
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative h-full w-9 overflow-visible">
        <Input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Buscar produtos..."
          className={cn(
            'border-input bg-background placeholder:text-muted-foreground focus:border-primary absolute inset-y-0 h-full rounded-full border text-sm transition-all duration-300 ease-in-out focus:ring-0 focus:outline-none',
            expandLeft ? 'right-0 origin-right pr-10 pl-4' : 'left-0 origin-left pr-4 pl-10',
            open
              ? 'text-foreground caret-primary w-60 opacity-100 shadow-sm placeholder:opacity-100'
              : 'w-9 cursor-pointer text-transparent caret-transparent opacity-100 placeholder:opacity-0',
          )}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onRequestOpen}
          onBlur={onBlur}
          onClick={() => {
            if (!open) {
              onRequestOpen();
            }
          }}
        />
        <button
          type="button"
          aria-label="Abrir busca"
          aria-expanded={open}
          className={cn(
            'text-muted-foreground absolute inset-y-0 flex w-9 items-center justify-center transition-colors focus:outline-none',
            expandLeft ? 'right-0' : 'left-0',
            open ? 'text-primary' : 'group-hover:text-primary',
          )}
          onMouseDown={onIconMouseDown}
          onClick={onIconClick}
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
