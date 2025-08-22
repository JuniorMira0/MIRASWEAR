"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TOAST_MESSAGES } from "@/constants/toast-messages";
import { shippingAddressTable } from "@/db/schema";
import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";
import { useUserAddresses } from "@/hooks/queries/use-user-addresses";

import { AddressCardItem } from "./address-card-item";
import { AddressForm, type AddressFormValues } from "./address-form";

interface AddressesProps {
  shippingAddresses: (typeof shippingAddressTable.$inferSelect)[];
  defaultShippingAddressId: string | null;
}

const Addresses = ({
  shippingAddresses,
  defaultShippingAddressId,
}: AddressesProps) => {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultShippingAddressId || null,
  );
  const createShippingAddressMutation = useCreateShippingAddress();
  const updateCartShippingAddressMutation = useUpdateCartShippingAddress();
  const { data: addresses, isLoading } = useUserAddresses({
    initialData: shippingAddresses,
  });
  const onSubmit = async (values: AddressFormValues) => {
    try {
      const newAddress =
        await createShippingAddressMutation.mutateAsync(values);
      toast.success(TOAST_MESSAGES.ADDRESS.CREATED_SUCCESS);
      setSelectedAddress(newAddress.id);

      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: newAddress.id,
      });
      toast.success(TOAST_MESSAGES.ADDRESS.LINKED_SUCCESS);
    } catch (error) {
      toast.error(TOAST_MESSAGES.ADDRESS.CREATED_ERROR);
      console.error(error);
    }
  };

  const handleGoToPayment = async () => {
    if (!selectedAddress || selectedAddress === "add_new") return;

    try {
      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: selectedAddress,
      });
      toast.success(TOAST_MESSAGES.ADDRESS.SELECTED_SUCCESS);
      router.push("/cart/confirmation");
    } catch (error) {
      toast.error(TOAST_MESSAGES.ADDRESS.SELECTED_ERROR);
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identificação</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center">
            <p>Carregando endereços...</p>
          </div>
        ) : (
          <RadioGroup
            value={selectedAddress}
            onValueChange={setSelectedAddress}
          >
            {addresses?.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  Você ainda não possui endereços cadastrados.
                </p>
              </div>
            )}

            {addresses?.map((address) => (
              <AddressCardItem
                key={address.id}
                address={address}
                onDeleted={(id) => {
                  if (selectedAddress === id) setSelectedAddress(null);
                }}
              />
            ))}

            <Card>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add_new" id="add_new" />
                  <Label htmlFor="add_new">Adicionar novo endereço</Label>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        )}

        {selectedAddress && selectedAddress !== "add_new" && (
          <div className="mt-4">
            <LoadingButton
              onClick={handleGoToPayment}
              className="w-full"
              isLoading={updateCartShippingAddressMutation.isPending}
              loadingText="Processando..."
            >
              Ir para pagamento
            </LoadingButton>
          </div>
        )}

        {selectedAddress === "add_new" && (
          <AddressForm
            onSubmit={onSubmit}
            isSubmitting={
              createShippingAddressMutation.isPending ||
              updateCartShippingAddressMutation.isPending
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Addresses;
