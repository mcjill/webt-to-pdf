const features = [
  {
    title: "Header/footer options",
    emoji: "🎨",
    description: "Customize your PDF headers and footers"
  },
  {
    title: "Custom CSS injection",
    emoji: "🔥",
    description: "Add custom styling to your PDFs"
  },
  {
    title: "Page section selection",
    emoji: "✂️",
    description: "Choose specific parts of the webpage to convert"
  },
  {
    title: "Password protection",
    emoji: "🔒",
    description: "Secure your PDFs with password encryption"
  },
  {
    title: "Digital signatures",
    emoji: "✍️",
    description: "Add digital signatures to your documents"
  },
  {
    title: "Ad removal",
    emoji: "🚫",
    description: "Remove unwanted ads and popups"
  },
  {
    title: "Offline support",
    emoji: "📱",
    description: "Use the app even without internet (PWA)"
  },
  {
    title: "Mobile-friendly",
    emoji: "📲",
    description: "Fully responsive on all devices"
  },
  {
    title: "Batch conversion",
    emoji: "📚",
    description: "Convert multiple URLs at once"
  }
]

export default function Features() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Coming Soon</h2>
        <h3 className="text-4xl font-bold text-white mb-4">Upcoming Features</h3>
        <p className="text-xl text-gray-300">
          We're constantly working to make Web2PDF even better. Here's what's in our
          development pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#0A0A1B]/50 backdrop-blur-lg rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl border border-gray-800/50 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <span className="text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {feature.emoji}
              </span>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
