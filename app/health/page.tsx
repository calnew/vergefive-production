import { Badge, Button, Card, CardContent, CreditCardFace, ProgressBar, ReadinessRing } from "@/components/ui";

export default function HealthPage() {
  return (
    <main className="min-h-screen bg-surface-page px-6 py-12 text-vfText-strong">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <Badge variant="info">Health Check</Badge>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-[-0.04em] text-brand-navy">Verge Five OK</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-vfText-body">
              Space Grotesk is loaded for display type, Plus Jakarta Sans is loaded as the default interface font, and the Prompt 0 brand colors are available through Tailwind tokens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge variant="ready">ready</Badge>
              <Badge variant="unlock">unlock</Badge>
              <Badge variant="flagged">flagged</Badge>
              <Badge variant="info">info</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-7 p-8">
            <div className="flex items-center gap-6">
              <ReadinessRing value={78} size={118} />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-vfText-muted">Business Readiness</p>
                <p className="mt-2 text-vfText-body">Brand primitives are scaffolded and ready.</p>
              </div>
            </div>
            <ProgressBar value={63} />
            <CreditCardFace memberName="TurnCom 360 LLC" cardTypeLabel="Business" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
