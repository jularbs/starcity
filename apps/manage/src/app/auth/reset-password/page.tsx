import { ResetPasswordForm } from "@/components/Forms/AuthForms/ResetPasswordForm";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>
}) {
    const filters = await searchParams;

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-lg">
                <ResetPasswordForm token={filters.token ?? ""} />
            </div>
        </div>
    )
}
