export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-heading text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">Page not found</p>
        <a
          href="/admin"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
