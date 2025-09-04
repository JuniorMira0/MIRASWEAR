"use client";

import clsx from "clsx";

export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Sacola", "Identificação", "Pagamento"];
  return (
    <div className="mx-auto mb-6 max-w-7xl px-5">
      <div className="flex items-center gap-6">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const isActive = step === current;
          const isDone = step < current;
          return (
            <div key={label} className="flex items-center gap-4">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  {
                    "bg-primary border-primary text-white": isDone || isActive,
                    "text-muted-foreground border-muted bg-white":
                      !isDone && !isActive,
                  },
                )}
              >
                {isDone ? (
                  <svg
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.5 1L4.5 7L1.5 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <div className="hidden md:block">
                <div
                  className={clsx("text-sm font-medium", {
                    "text-primary": isDone || isActive,
                    "text-muted-foreground": !isDone && !isActive,
                  })}
                >
                  {label}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="bg-muted hidden h-[1px] w-12 md:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
