import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/enviodev/event-density-hack"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
            >
              GitHub
            </Link>
            <Link
              href="https://discord.gg/zNZYBNtbZV"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
            >
              Discord
            </Link>
            <Link
              href="https://envio.dev"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
