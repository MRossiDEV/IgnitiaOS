import PricingCard from "./PricingCard";
import { getPricingServices } from "@/lib/db/services";

export default async function PricingSection() {
  const services = await getPricingServices();

  const professionalPlans = services.filter(
    (s) => s.service_categories?.slug === "professionals"
  );

  const businessPlans = services.filter(
    (s) => s.service_categories?.slug === "businesses"
  );

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">

      <h2 className="mb-10 text-3xl font-bold">
        Para Profesionales
      </h2>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {professionalPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            title={plan.name}
            subtitle={plan.short_description}
            price={
              plan.setup_price
                ? `USD$${plan.setup_price}`
                : "Custom"
            }
            monthly={
              plan.monthly_price
                ? `USD$${plan.monthly_price}`
                : undefined
            }
            popular={plan.featured}
            features={
              plan.service_features
                ?.sort(
                  (a, b) =>
                    a.display_order - b.display_order
                )
                .map((f) => f.title) ?? []
            }
          />
        ))}
      </div>

      <h2 className="mt-24 mb-10 text-3xl font-bold">
        Para Empresas
      </h2>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {businessPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            title={plan.name}
            subtitle={plan.short_description}
            price={
              plan.setup_price
                ? `USD$${plan.setup_price}`
                : "Custom"
            }
            monthly={
              plan.monthly_price
                ? `USD$${plan.monthly_price}`
                : undefined
            }
            popular={plan.featured}
            features={
              plan.service_features
                ?.sort(
                  (a, b) =>
                    a.display_order - b.display_order
                )
                .map((f) => f.title) ?? []
            }
          />
        ))}
      </div>

    </section>
  );
}