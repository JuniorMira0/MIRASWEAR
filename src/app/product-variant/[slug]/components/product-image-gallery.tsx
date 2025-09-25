'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageGalleryProps {
  imageUrl: string;
  alt: string;
  showOutOfStock?: boolean;
}

const ProductImageGallery = ({ imageUrl, alt, showOutOfStock }: ProductImageGalleryProps) => {
  const images = [imageUrl, imageUrl, imageUrl, imageUrl, imageUrl];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[56px_1fr]">
      <div className="hidden max-h-[440px] flex-col gap-2 overflow-auto pr-1 md:flex [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`relative aspect-square w-full overflow-hidden rounded-lg ring-2 transition ${activeIndex === i ? 'ring-primary' : 'ring-transparent'}`}
            aria-label={`Imagem ${i + 1}`}
          >
            <Image
              src={src}
              alt={alt}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="bg-muted/10 relative h-[300px] w-full overflow-hidden rounded-2xl border md:h-[420px] lg:h-[460px]">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          className="object-contain p-3 md:p-4"
          sizes="(max-width: 1024px) 100vw, 700px"
          priority
        />
        {showOutOfStock && (
          <span className="bg-destructive absolute top-3 right-3 z-10 rounded px-3 py-1 text-xs font-bold text-white shadow">
            Esgotado
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
