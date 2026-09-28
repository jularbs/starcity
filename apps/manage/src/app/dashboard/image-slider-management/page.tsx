
import { NewImageSliderForm } from "@/components/Forms/ImageSliderManagement/NewImageSliderForm";
import ImageSliderListComponent from "@/components/Forms/ImageSliderManagement/ImageSliderListComponent";

export default function Page() {
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-[500px_1fr]">
          <div>
            <NewImageSliderForm />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <ImageSliderListComponent />
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
