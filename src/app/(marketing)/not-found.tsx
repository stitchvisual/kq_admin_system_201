import { Section } from '@/components/marketing/ui/section';
import { ButtonLink } from '@/components/marketing/ui/button-link';

export default function NotFound() {
  return (
    <Section variant="lg" className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-display text-4xl sm:text-5xl font-medium text-text-primary mb-4">
        Page not found
      </h1>
      <p className="text-body text-text-secondary max-w-md mb-8">
        The page you’re looking for doesn’t exist or has been moved. Head home or try one of the links below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/events" variant="outline">Events</ButtonLink>
        <ButtonLink href="/contact" variant="outline">Contact</ButtonLink>
      </div>
    </Section>
  );
}
