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
      <div className="[--card-h:8.4375rem] [--card-w:10.785rem]">
        <div className="grid auto-cols-[var(--card-w)] grid-flow-col gap-6 overflow-x-auto pb-2 md:auto-cols-auto md:grid-flow-row md:grid-cols-7 md:gap-6 md:overflow-visible md:pb-0">
          {BRANDS.map((b) => (
            <div key={b.name} className="flex flex-col items-center">
              <div className="flex h-[var(--card-h)] w-[var(--card-w)] items-center justify-center rounded-2xl border bg-white md:w-full">
                <Image
                  src={b.src}
                  alt={b.name}
                  width={50}
                  height={50}
                  className="h-[50px] w-[50px] object-contain"
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
