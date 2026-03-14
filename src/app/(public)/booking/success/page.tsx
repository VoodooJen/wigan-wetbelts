export default function BookingSuccessPage() {
  return (
    <section className="container-shell py-16">
      <div className="panel mx-auto max-w-2xl p-8 text-center">
        <span className="badge">Booking fee received</span>
        <h1 className="page-title mt-4">Thanks, your booking fee was paid successfully.</h1>
        <p className="mt-4 subtle">
          Your booking is only finalised after the Stripe webhook confirms the payment and creates the booking record.
          The £50 booking fee will be deducted from your final bill.
        </p>
      </div>
    </section>
  );
}
