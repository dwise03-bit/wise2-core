import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-bronze text-cream">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for an Exceptional Experience?</h2>
          <p className="text-lg mb-8 opacity-90">
            Let's discuss your event and create something truly memorable together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-cream text-bronze px-8 py-3 rounded-lg hover:bg-cream/90 transition font-semibold flex items-center justify-center gap-2">
              Book a Consultation
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-cream text-cream px-8 py-3 rounded-lg hover:bg-bronze/50 transition font-semibold">
              View Menu Options
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
