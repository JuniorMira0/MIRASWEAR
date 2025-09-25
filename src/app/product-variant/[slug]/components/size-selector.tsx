'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface SizeSelectorProps {
  sizes: string[];
  value?: string | null;
  onChange?: (size: string) => void;
}

const SizeSelector = ({ sizes, value, onChange }: SizeSelectorProps) => {
  const [internal, setInternal] = useState<string | null>(value ?? null);
  const selected = value ?? internal;

  if (!sizes || sizes.length === 0) return null;

  const handleClick = (s: string) => {
    setInternal(s);
    onChange?.(s);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Selecionar tamanho</h3>
      <div className="grid grid-cols-3 gap-3">
        {sizes.map(size => (
          <Button
            key={size}
            type="button"
            variant={selected === size ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={() => handleClick(size)}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
