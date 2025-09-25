import { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading: boolean;
  loadingText?: string;
  children: ReactNode;
  asChild?: boolean;
}

export const LoadingButton = ({
  isLoading,
  loadingText,
  children,
  disabled,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      asChild={asChild}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn('gap-2', className)}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? loadingText || 'Carregando...' : children}
    </Button>
  );
};
