import { ChangePasswordForm } from '@/components/Forms/AuthForms/ChangePasswordForm';
import MfaSettings from '@/components/Forms/AuthForms/MfaSettings';

export default function Page() {
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[500px_1fr]">
          <ChangePasswordForm />
          <MfaSettings />
        </div>
      </div>
    </div>
  );
}
