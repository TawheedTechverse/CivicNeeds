import { Clock, MapPin, Shirt, UtensilsCrossed } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { ThemeToggle } from "../components/ThemeToggle";

interface PickupListing {
  title: string;
  time: string;
  location: string;
}

const FOOD_PICKUPS: PickupListing[] = [
  {
    title: "Community Pantry — surplus bread & produce",
    time: "Today, 4:00 PM – 6:00 PM",
    location: "Parramatta Community Centre, 123 Church St",
  },
  {
    title: "Weekend Grocery Giveaway",
    time: "Saturday, 10:00 AM – 12:00 PM",
    location: "Bankstown Uniting Church, 45 Rickard Rd",
  },
];

const CLOTHES_PICKUPS: PickupListing[] = [
  {
    title: "Winter Coats & Jackets Drive",
    time: "Friday, 9:00 AM – 1:00 PM",
    location: "Liverpool Neighbourhood Centre, 12 Speed St",
  },
  {
    title: "Kids Clothing Swap",
    time: "Sunday, 11:00 AM – 3:00 PM",
    location: "Blacktown Showground Hall, 2 Reservoir Rd",
  },
];

function PickupCard({ listing }: { listing: PickupListing }) {
  return (
    <GlassCard className="flex flex-col gap-2">
      <h3 className="font-medium">{listing.title}</h3>
      <div className="flex items-center gap-2 text-sm text-charcoal-900/60 dark:text-sage-50/60">
        <Clock size={16} />
        <span>{listing.time}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-charcoal-900/60 dark:text-sage-50/60">
        <MapPin size={16} />
        <span>{listing.location}</span>
      </div>
    </GlassCard>
  );
}

export function Donations() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Donations</h1>
        <ThemeToggle />
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <UtensilsCrossed size={20} className="text-sage-600 dark:text-sage-300" />
          <h2 className="text-lg font-medium">Free food pickup</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FOOD_PICKUPS.map((listing) => (
            <PickupCard key={listing.title} listing={listing} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Shirt size={20} className="text-sage-600 dark:text-sage-300" />
          <h2 className="text-lg font-medium">Free clothes pickup</h2>
        </div>
        <div className="flex flex-col gap-3">
          {CLOTHES_PICKUPS.map((listing) => (
            <PickupCard key={listing.title} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
