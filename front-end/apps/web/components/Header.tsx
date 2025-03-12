import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-orange-100/50 to-white/40 backdrop-blur-md border-b border-orange-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/static/densityImage2.png"
              alt="Chain Density Logo"
              className="h-8 w-8"
            />
            <div className="font-bold text-xl text-gray-900">Chain Density</div>
          </Link>
        </div>
      </div>
    </header>
  );
}
