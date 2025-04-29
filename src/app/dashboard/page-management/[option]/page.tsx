import PageManagementComponent from "@/components/Forms/PageManagement/PageManagementComponent";

export default async function Page({
  params,
}: {
  params: Promise<{ option: string }>
}) {

  const { option } = await params
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div className="grid grid-cols-1 gap-4">
          <PageManagementComponent option={option} />
        </div>
      </div>
    </div>

  )
}
