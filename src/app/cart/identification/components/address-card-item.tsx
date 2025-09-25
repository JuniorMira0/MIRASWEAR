'use client';

import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { shippingAddressTable } from '@/db/schema';
import { useDeleteShippingAddress } from '@/hooks/mutations/use-delete-shipping-address';

import { formatAddress } from '../../helpers/address';

interface AddressCardItemProps {
  address: typeof shippingAddressTable.$inferSelect;
  onDeleted?: (id: string) => void;
}

export function AddressCardItem({ address, onDeleted }: AddressCardItemProps) {
  const deleteMutation = useDeleteShippingAddress();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await deleteMutation.mutateAsync(address.id);
      toast.success('Endereço excluído com sucesso');
      onDeleted?.(address.id);
      setOpen(false);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível excluir o endereço';
      toast.error(msg);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value={address.id} id={address.id} />
          <div className="flex-1">
            <Label htmlFor={address.id} className="cursor-pointer">
              <div>
                <p className="text-sm">{formatAddress(address)}</p>
              </div>
            </Label>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Excluir endereço">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir endereço?</DialogTitle>
                <DialogDescription>
                  Essa ação não pode ser desfeita. Deseja remover este endereço da sua conta?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
