import type { ProductItemProduct } from '@/components/common/product-item';

export type Result = ProductItemProduct;

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
