import MfaSettings from '@/components/Forms/AuthForms/MfaSettings';

export default function EnrollMfaPage() {
  return (
    <main className="min-h-svh bg-muted px-4 py-10">
      <div className="mx-auto grid w-full max-w-lg gap-5">
        <header className="grid gap-1">
          <h1 className="text-2xl font-bold">Secure your account</h1>
          <p className="text-sm text-muted-foreground">
            Set up an authenticator app before continuing to the dashboard.
          </p>
        </header>
        <MfaSettings required />
      </div>
    </main>
  );
}
