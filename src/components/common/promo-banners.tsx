'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';

function Tile({ title, imageSrc }: { title: string; imageSrc: string }) {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-2xl border bg-white md:h-[307px]">
      <Image
        src={imageSrc}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
        priority={false}
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-black/0 to-black/0" />
      <div className="absolute top-4 left-4 text-sm font-medium text-white drop-shadow">
        {title}
      </div>
      <div className="absolute right-4 bottom-4">
        <Button className="rounded-full bg-white text-black shadow-sm hover:bg-white/90">
          Comprar
        </Button>
      </div>
    </div>
  );
}

export default function PromoBanners() {
  return (
    <section>
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <Tile title="Nike Therma FIT Headed" imageSrc="/banner-02-desk.png" />
          <Tile title="Nike Therma FIT Headed" imageSrc="/banner-03-desk.png" />
        </div>
        <div className="relative h-[340px] overflow-hidden rounded-2xl border bg-white md:col-span-2 md:h-[638px]">
          <Image
            src="/banner-04-desk.png"
            alt="Nike Therma FIT Headed"
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute top-5 left-5 text-sm font-medium text-white drop-shadow">
            Nike Therma FIT Headed
          </div>
          <div className="absolute right-5 bottom-5">
            <Button className="rounded-full bg-white text-black shadow-sm hover:bg-white/90">
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
