"use client";

import clsx from "clsx";

export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Sacola", "Identificação", "Pagamento"];
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-3">
      <div className="flex items-center">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const isActive = step === current;
          const isDone = step < current;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    {
                      "bg-primary border-primary text-white":
                        isDone || isActive,
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
              </div>

              {idx < steps.length - 1 && (
                <div
                  aria-hidden
                  className={clsx("mx-4 hidden h-1 flex-1 rounded md:block", {
                    "bg-primary": isDone,
                    "bg-muted": !isDone,
                  })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
