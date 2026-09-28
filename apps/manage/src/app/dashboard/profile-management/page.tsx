import { ChangePasswordForm } from "@/components/Forms/AuthForms/ChangePasswordForm";

export default function Page() {
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-[500px_1fr]">
          <ChangePasswordForm />
        </div>
      </div>
    </div>

  )
}
