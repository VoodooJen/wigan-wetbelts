import { getPublicReviews } from "@/lib/queries";
import { ReviewCard } from "@/components/ui";

const placeholderReviews = [
  {
    id: "placeholder-1",
    rating: 5,
    body: "Very clear pricing, excellent communication, and the booking process was far easier than chasing garages by phone.",
    customer_name: "Martin T."
  },
  {
    id: "placeholder-2",
    rating: 5,
    body: "Professional from start to finish. The online slot system gave us confidence that the job was actually planned properly.",
    customer_name: "Sarah P."
  },
  {
    id: "placeholder-3",
    rating: 5,
    body: "Exactly the sort of specialist service we wanted. Straightforward booking, fixed price, and no unnecessary fuss.",
    customer_name: "Daniel R."
  }
];

export async function ReviewsGrid({ limit }: { limit?: number }) {
  const liveReviews = await getPublicReviews();
  const source = liveReviews.length > 0 ? liveReviews : placeholderReviews;
  const reviews = typeof limit === "number" ? source.slice(0, limit) : source;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          rating={review.rating}
          body={review.body}
          author={review.customer_name}
        />
      ))}
    </div>
  );
}
