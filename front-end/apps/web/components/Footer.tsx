import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-100/50 to-white/40 border-t border-orange-100 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/static/envio.png"
              alt="Envio Logo"
              width={369}
              height={92}
              className="h-6 w-auto"
            />
            <span className="text-sm text-gray-700">
              Made by{" "}
              <Link
                href="https://envio.dev"
                className="font-medium text-orange-700 hover:text-orange-900 transition-colors"
                target="_blank"
              >
                envio
              </Link>{" "}
              and powered by{" "}
              <Link
                href="https://docs.envio.dev/docs/HyperSync/overview"
                className="font-medium text-orange-700 hover:text-orange-900 transition-colors"
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
