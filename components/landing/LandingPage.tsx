import { AssessmentPreview } from "./AssessmentPreview";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { HowItWorks } from "./HowItWorks";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { TrustBar } from "./TrustBar";
import { ValueProposition } from "./ValueProposition";

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <TrustBar />
      <ValueProposition />
      <HowItWorks />
      <LeadCaptureForm />
      <AssessmentPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}
