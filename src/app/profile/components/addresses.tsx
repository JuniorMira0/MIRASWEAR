'use client';

import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AddressForm,
  type AddressFormValues,
} from '@/app/cart/identification/components/address-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { shippingAddressTable } from '@/db/schema';
import { useCreateShippingAddress } from '@/hooks/mutations/use-create-shipping-address';
import { useDeleteShippingAddress } from '@/hooks/mutations/use-delete-shipping-address';
import { useUserAddresses } from '@/hooks/queries/use-user-addresses';

import { formatAddress } from '../../cart/helpers/address';

const Addresses = () => {
  const { data: addresses, isLoading } = useUserAddresses();
  const createMutation = useCreateShippingAddress();
  const deleteMutation = useDeleteShippingAddress();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (values: AddressFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Endereço salvo com sucesso');
      setShowForm(false);
    } catch (e) {
      toast.error('Não foi possível salvar o endereço');
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Endereço excluído com sucesso');
      setDeletingId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível excluir o endereço';
      toast.error(msg);
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Meus endereços</h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Endereços cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando endereços...</p>
            ) : (
              <div className="space-y-3">
                {addresses?.length === 0 && (
                  <p className="text-muted-foreground text-sm">Nenhum endereço cadastrado.</p>
                )}

                {addresses?.map((a: typeof shippingAddressTable.$inferSelect) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between rounded-md border p-3"
                  >
                    <div className="text-sm">{formatAddress(a)}</div>
                    <div className="ml-4">
                      <Dialog
                        open={deletingId === a.id}
                        onOpenChange={o => setDeletingId(o ? a.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" aria-label="Excluir endereço">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Excluir endereço?</DialogTitle>
                            <DialogDescription>
                              Essa ação não pode ser desfeita. Deseja remover este endereço da sua
                              conta?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeletingId(null)}>
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(a.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          {showForm ? (
            <Card>
              <CardContent>
                <AddressForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
                <div className="mt-2 flex justify-end">
                  <Button variant="ghost" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowForm(true)}>Adicionar novo endereço</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Addresses;
