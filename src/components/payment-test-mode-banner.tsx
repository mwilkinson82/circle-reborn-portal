const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;

  return (
    <div className="w-full bg-amber-soft border-b border-hairline px-4 py-2 text-center text-xs font-mono uppercase tracking-wider text-accent-foreground">
      Test mode · No real card will be charged
    </div>
  );
}
