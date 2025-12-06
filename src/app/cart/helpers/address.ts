export const formatAddress = (address: {
  recipientName: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}) => {
  const complement = address.complement?.toString().trim();
  const complementPart = complement ? `, ${complement}` : '';

  return `${address.recipientName} • ${address.street}, ${address.number}${complementPart}, ${address.neighborhood}, ${address.city} - ${address.state} • CEP: ${address.zipCode}`;
};
