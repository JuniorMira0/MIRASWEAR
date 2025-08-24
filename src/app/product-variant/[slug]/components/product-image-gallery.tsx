"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
  imageUrl: string;
  alt: string;
}

const ProductImageGallery = ({ imageUrl, alt }: ProductImageGalleryProps) => {
  const images = [imageUrl, imageUrl, imageUrl, imageUrl, imageUrl];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[72px_1fr]">
      <div className="hidden max-h-[520px] flex-col gap-3 overflow-auto pr-1 md:flex [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`relative aspect-square w-full overflow-hidden rounded-lg ring-2 transition ${activeIndex === i ? "ring-primary" : "ring-transparent"}`}
            aria-label={`Imagem ${i + 1}`}
          >
            <Image
              src={src}
              alt={alt}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="bg-muted/10 relative h-[340px] w-full overflow-hidden rounded-2xl border md:h-[480px] lg:h-[520px]">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 100vw, 700px"
          priority
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;
