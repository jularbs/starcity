import PaymentOptionListComponent from '@/components/Forms/PaymentOptionManagement/PaymentOptionListComponent';
import SalesSummaryComponent from '@/components/Forms/SaleManagement/SalesSummaryComponent';
import TicketListComponent from '@/components/Forms/TicketsManagement/TicketListComponent';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-xl font-extrabold uppercase">Month Sales Summary</h2>
      <SalesSummaryComponent />
      <h2 className="text-xl font-extrabold uppercase">Tickets</h2>
      <TicketListComponent />
      <h2 className="text-xl font-extrabold uppercase">
        Accepted Payment Methods
      </h2>
      <PaymentOptionListComponent />
    </div>
  );
}
