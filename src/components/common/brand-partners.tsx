"use client";

import Image from "next/image";

type Brand = {
  name: string;
  src: string;
};

const BRANDS: Brand[] = [
  { name: "Nike", src: "/nike.png" },
  { name: "Adidas", src: "/adidas.png" },
  { name: "Puma", src: "/puma.png" },
  { name: "New Balance", src: "/new-balance.png" },
  { name: "Converse", src: "/converse.png" },
  { name: "Polo", src: "/polo.png" },
  { name: "Zara", src: "/zara.png" },
];

export default function BrandPartners() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Marcas parceiras</h2>
      <div className="[--card-size:8.5rem] md:[--card-size:9.5rem]">
        <div className="grid auto-cols-[var(--card-size)] grid-flow-col gap-4 overflow-x-auto pb-2 md:auto-cols-auto md:grid-flow-row md:grid-cols-7 md:gap-6 md:overflow-visible md:pb-0">
          {BRANDS.map((b) => (
            <div key={b.name} className="flex flex-col items-center">
              <div className="flex h-[var(--card-size)] w-[var(--card-size)] items-center justify-center rounded-2xl border bg-white">
                <Image
                  src={b.src}
                  alt={b.name}
                  width={80}
                  height={40}
                  className="h-auto w-20 object-contain md:w-24"
                  priority={false}
                />
              </div>
              <span className="text-foreground/80 mt-2 text-sm">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
