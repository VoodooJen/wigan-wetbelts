import { ReviewsGrid } from "@/components/public/reviews-grid";
import { Pill, Section } from "@/components/ui";

export default function ReviewsPage() {
  return (
    <Section className="pb-16 pt-10 md:pt-14 md:pb-20">
      <div className="max-w-3xl">
        <Pill>Customer feedback</Pill>
        <h1 className="page-title mt-5">Customer Reviews</h1>
        <p className="mt-5 text-base leading-8 subtle md:text-lg">
          Honest feedback from customers who have booked specialist wet belt and timing work with us.
        </p>
      </div>

      <div className="mt-10">
        <ReviewsGrid />
      </div>
    </Section>
  );
}
