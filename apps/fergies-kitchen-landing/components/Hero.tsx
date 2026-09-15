export default function Hero() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-cream via-cream to-sage/5">
      <div className="container-custom">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-charcoal mb-6 leading-tight">
            Exceptional Catering Experience Elevated
          </h1>
          <p className="text-lg md:text-xl text-charcoal/80 mb-8 leading-relaxed">
            Premium culinary services powered by WISE², delivering unforgettable dining moments for your most important events. From intimate gatherings to grand celebrations, we craft experiences that inspire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-bronze text-cream px-8 py-3 rounded-lg hover:bg-bronze/90 transition font-semibold">
              Explore Our Services
            </button>
            <button className="border-2 border-bronze text-bronze px-8 py-3 rounded-lg hover:bg-bronze/10 transition font-semibold">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
