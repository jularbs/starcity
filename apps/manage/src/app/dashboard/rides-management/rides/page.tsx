import { NewRideForm } from '@/components/Forms/RidesManagement/NewRideForm';
import RideListComponent from '@/components/Forms/RidesManagement/RideListComponent';

export default function Page() {
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-[500px_1fr]">
          <NewRideForm />
          <div className="grid grid-cols-1 gap-4">
            <div>
              <RideListComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
