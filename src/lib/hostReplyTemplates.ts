/**
 * Canned replies a host can drop into a conversation with one tap. Kept
 * generic on purpose: nothing here states a check-in time, price or policy,
 * because those belong to the listing and a template must never say the
 * wrong thing for a particular stay.
 */
export const HOST_REPLY_TEMPLATES = [
  { label: "Thanks for getting in touch", body: "Thanks for getting in touch - happy to help. What would you like to know?" },
  { label: "Check-in time?", body: "Could you let me know roughly what time you expect to arrive, so I can plan your arrival?" },
  { label: "Booking question", body: "Thanks for your message. I'll check the dates and come back to you shortly." },
  { label: "Still looking into it", body: "Sorry for the wait - I'm looking into this now and will reply as soon as I can." },
  { label: "Thanks for staying", body: "Thank you for staying with us. I hope you enjoyed it - a review would be really appreciated when you have a moment." },
] as const;
