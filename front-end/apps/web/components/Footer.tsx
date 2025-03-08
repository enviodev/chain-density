import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2">
            <img src="/static/envio.png" alt="Envio Logo" className="h-6" />
            <span className="text-sm text-gray-600">
              Made by{" "}
              <Link
                href="https://envio.dev"
                className="font-medium hover:text-gray-900 transition-colors"
                target="_blank"
              >
                envio
              </Link>{" "}
              and powered by{" "}
              <Link
                href="https://envio.dev"
                className="font-medium hover:text-gray-900 transition-colors"
                target="_blank"
              >
                Hypersync
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
