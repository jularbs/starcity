import PendingListComponent from '@/components/Forms/UserManagement/PendingListComponent';
import UserListComponent from '@/components/Forms/UserManagement/UserListComponent';

export default function Page() {
  return (
    <div>
      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        <PendingListComponent />
        <UserListComponent />
      </div>
    </div>
  );
}
