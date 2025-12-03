import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Services } from "@/components/landing/services"
import { WalletPreview } from "@/components/landing/wallet-preview"
import { Steps } from "@/components/landing/steps"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <Services />
      <WalletPreview />
      <Steps />
      <FeaturesGrid />
      <CTA />
      <Footer />
    </main>
  )
}
