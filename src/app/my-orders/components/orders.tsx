'use client';

import Image from 'next/image';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { orderTable } from '@/db/schema';
import { formatCentsToBRL } from '@/helpers/money';

interface OrdersProps {
  orders: Array<{
    id: string;
    totalPriceInCents: number;
    status: (typeof orderTable.$inferSelect)['status'];
    createdAt: Date;
    items: Array<{
      id: string;
      imageUrl: string;
      productName: string;
      productVariantName: string;
      sizeLabel?: string | null;
      priceInCents: number;
      quantity: number;
    }>;
  }>;
}

const Orders = ({ orders }: OrdersProps) => {
  return (
    <div className="space-y-5">
      {orders.map(order => (
        <Card key={order.id}>
          <CardContent>
            <Accordion type="single" collapsible key={order.id}>
              <AccordionItem value={order.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="grid w-full grid-cols-1 items-center gap-4 md:grid-cols-5">
                    <div>
                      <p className="text-muted-foreground text-sm">Número do Pedido</p>
                      <p className="font-medium break-words">#{order.id}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <div>
                        {order.status === 'paid' && <Badge>Pago</Badge>}
                        {order.status === 'pending' && (
                          <Badge variant="outline">Pagamento pendente</Badge>
                        )}
                        {order.status === 'canceled' && (
                          <Badge variant="destructive">Cancelado</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Data</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Pagamento</p>
                      <p className="font-medium">Cartão</p>
                    </div>

                    <div className="text-right">
                      <AccordionTrigger className="text-primary text-sm">
                        Detalhes do Pedido
                      </AccordionTrigger>
                    </div>
                  </div>
                </div>

                <AccordionContent>
                  <div className="mt-4 space-y-4">
                    {order.items.map(product => (
                      <div className="flex items-center justify-between" key={product.id}>
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            width={78}
                            height={78}
                            className="rounded-lg"
                          />
                          <div className="flex max-w-[60vw] flex-col gap-1 md:max-w-[40vw]">
                            <p className="text-sm font-semibold break-words">
                              {product.productName}
                            </p>
                            <p className="text-muted-foreground text-xs font-medium break-words">
                              {product.productVariantName}
                              {product.sizeLabel ? ` · ${product.sizeLabel}` : ''}
                              {` x ${product.quantity}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-2">
                          <p className="text-sm font-bold">
                            {formatCentsToBRL(product.priceInCents * product.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="py-5">
                      <Separator />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Subtotal</p>
                        <p className="text-muted-foreground text-sm font-medium">
                          {formatCentsToBRL(order.totalPriceInCents)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Transporte e Manuseio</p>
                        <p className="text-muted-foreground text-sm font-medium">Grátis</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Total</p>
                        <p className="text-sm font-semibold">
                          {formatCentsToBRL(order.totalPriceInCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Orders;
