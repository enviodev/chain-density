import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/static/densityImage2.png"
              alt="ChainDensity Logo"
              className="h-8 w-8"
            />
            <span className="font-bold text-xl text-gray-900">
              ChainDensity
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="https://envio.dev"
              target="_blank"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="https://discord.gg/zNZYBNtbZV"
              target="_blank"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Discord
            </Link>
          </nav>

          <Link
            href="https://github.com/enviodev/event-density-hack"
            target="_blank"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.52 21.272 9.52 21.006C9.52 20.765 9.512 20.012 9.508 19.156C6.726 19.796 6.139 17.783 6.139 17.783C5.685 16.627 5.028 16.319 5.028 16.319C4.109 15.676 5.095 15.689 5.095 15.689C6.113 15.76 6.64 16.744 6.64 16.744C7.545 18.27 9.008 17.829 9.54 17.575C9.629 16.917 9.889 16.477 10.175 16.219C7.954 15.959 5.62 15.088 5.62 11.294C5.62 10.183 6.01 9.276 6.659 8.568C6.559 8.313 6.219 7.382 6.759 6.043C6.759 6.043 7.609 5.775 9.497 7.033C10.297 6.813 11.147 6.703 11.997 6.699C12.847 6.703 13.697 6.813 14.497 7.033C16.385 5.775 17.235 6.043 17.235 6.043C17.775 7.382 17.435 8.313 17.335 8.568C17.985 9.276 18.375 10.183 18.375 11.294C18.375 15.097 16.038 15.956 13.811 16.212C14.171 16.53 14.491 17.161 14.491 18.131C14.491 19.508 14.478 20.676 14.478 21.006C14.478 21.274 14.658 21.587 15.167 21.489C19.138 20.162 22 16.417 22 12C22 6.477 17.523 2 12 2Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
