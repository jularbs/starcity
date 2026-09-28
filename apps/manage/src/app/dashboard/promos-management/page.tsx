import { NewPromoForm } from '@/components/Forms/PromosManagement/NewPromoForm';
import { PromoListComponent } from '@/components/Forms/PromosManagement/PromoListComponent';

export default function Page() {
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-[500px_1fr]">
          <NewPromoForm />
          <div className="grid grid-cols-1 gap-4">
            <div>
              <PromoListComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
