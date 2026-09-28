import Link from 'next/link';

const ClientFooter = () => {
  return (
    <>
      <footer className="sticky top-[100vh]">
        <div className="flex flex-col items-center justify-between p-5 md:flex-row">
          <div className="text-sm font-semibold whitespace-nowrap mb-4 md:mb-0">
            <span className="mr-2">© {new Date().getFullYear()}</span>
            <a href="/" target="_blank">
              Star Parks Corp
            </a>
          </div>
          <div className="flex flex-wrap justify-center">
            <Link
              href="/page/faqs"
              className="mx-3 pt-2 md:pt-0 text-sm font-semibold"
            >
              FAQs
            </Link>
            <Link
              href="/page/park_directions"
              className="mx-3 pt-2 md:pt-0 text-sm font-semibold"
            >
              Directions
            </Link>
            <Link
              href="/page/park_regulations"
              className="mx-3 pt-2 md:pt-0 text-sm font-semibold"
            >
              Park Regulations
            </Link>
            <Link
              href="/page/privacy_policy"
              className="mx-3 pt-2 md:pt-0 text-sm font-semibold"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ClientFooter;
