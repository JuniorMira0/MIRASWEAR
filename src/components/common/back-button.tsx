'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" /> Voltar
    </Button>
  );
}
