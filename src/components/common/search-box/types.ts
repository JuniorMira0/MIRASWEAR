export type Result = {
  id: string;
  name: string;
  productName?: string | null;
  variantName?: string | null;
  productSlug?: string;
  variantSlug?: string;
  imageUrl?: string | null;
  priceInCents?: number | null;
};

export type SearchBoxProps = {
  inline?: boolean;
  visible?: boolean;
  onClose?: () => void;
  initialQuery?: string;
  syncQueryToUrl?: boolean;
  collapsible?: boolean;
  expandLeft?: boolean;
  showResults?: boolean;
  hideInput?: boolean;
};
