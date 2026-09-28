import { SocialMediaForm } from '@/components/Forms/SettingsManagement/SocialMediaForm';

export default function Page() {
  return (
    <div className="p-4 pt-0">
      <div className="flex flex-wrap">
        <div className="w-full lg:w-1/2">
          <SocialMediaForm />
        </div>
        <div className="w-full lg:w-1/2"></div>
      </div>
    </div>
  );
}
