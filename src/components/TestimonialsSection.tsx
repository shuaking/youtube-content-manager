const testimonials = [
  {
    quote: "Immersion doesn't mean you have to pack your bags and move to Europe",
    source: "The Verge",
    url: "https://www.theverge.com/2019/2/12/18220289/language-learning-netflix-chrome-extension-two-subtitles",
  },
  {
    quote: "...turns the streaming service Netflix into a sofa-based language lab.",
    source: "The Guardian",
    url: "https://www.theguardian.com/education/2019/mar/02/netflix-languages-education",
  },
  {
    quote: "...it's an incredibly handy tool (and may only feed into your Netflix addiction).",
    source: "Lifehacker",
    url: "https://lifehacker.com/learn-a-new-language-while-watching-netflix-1832564649",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <a
              key={index}
              href={testimonial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-white/10 bg-card p-6 transition-all hover:border-white/20 hover:shadow-lg"
            >
              <blockquote className="mb-4 text-base leading-relaxed text-white/80">
                "{testimonial.quote}"
              </blockquote>
              <cite className="text-sm font-semibold not-italic text-white/60 transition-colors group-hover:text-white/80">
                — {testimonial.source}
              </cite>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
