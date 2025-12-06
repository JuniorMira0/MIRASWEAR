import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
} from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type StaticSearchFieldProps = {
  query: string;
  inline: boolean;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
};

export function StaticSearchField({
  query,
  inline,
  inputRef,
  onChange,
  onKeyDown,
}: StaticSearchFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Buscar produtos..."
        className={cn(inline ? 'w-full' : 'w-64 border-blue-500')}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
