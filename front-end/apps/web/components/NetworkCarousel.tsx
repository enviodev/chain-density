import { useState, useEffect, useRef } from "react";

interface NetworkCarouselProps {
  networks: string[];
}

export default function NetworkCarousel({ networks }: NetworkCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [displayNetworks, setDisplayNetworks] = useState<string[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  // Default networks to use if none are provided
  const defaultNetworks = [
    "Ethereum",
    "Optimism",
    "Arbitrum",
    "Polygon",
    "Avalanche",
    "Base",
    "Unichain",
    "BSC",
    "Fantom",
    "Gnosis",
    "Celo",
    "Moonbeam",
    "zkSync",
    "Linea",
    "Scroll",
  ];

  // Shuffle and set networks on mount or when networks change
  useEffect(() => {
    // Shuffle function
    const shuffle = (arr: string[]) => {
      const array = [...arr];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Type assertion to avoid TypeScript errors
        const temp = array[i] as string;
        array[i] = array[j] as string;
        array[j] = temp;
      }
      return array;
    };

    // Use provided networks or defaults
    const networksToUse = networks.length > 0 ? networks : defaultNetworks;

    // Create a longer list by repeating the networks multiple times
    // This ensures we have enough items for a long continuous animation
    let extendedNetworks: string[] = [];
    for (let i = 0; i < 3; i++) {
      extendedNetworks = [...extendedNetworks, ...shuffle(networksToUse)];
    }

    // Set the extended shuffled networks
    setDisplayNetworks(extendedNetworks);
  }, [networks]);

  // Set up the Web Animation API for smoother control
  useEffect(() => {
    if (!carouselRef.current || displayNetworks.length === 0) return;

    // Create keyframes for the animation
    const keyframes = [
      { transform: "translateX(0)" },
      { transform: "translateX(-33.33%)" }, // Only animate through 1/3 of the list to ensure seamless looping
    ];

    // Animation options - back to original speed but still ensuring all networks are shown
    const options = {
      duration: 30000, // 30 seconds (original speed)
      iterations: Infinity,
      easing: "linear",
    };

    // Create and start the animation
    const animation = carouselRef.current.animate(keyframes, options);
    animationRef.current = animation;

    // Store the animation's current time when the component unmounts
    // This helps maintain animation state across re-renders
    const currentAnimation = animation;

    // Clean up
    return () => {
      if (currentAnimation) {
        currentAnimation.cancel();
      }
    };
  }, [displayNetworks]);

  // Handle pause/play without resetting
  const handleMouseEnter = () => {
    if (animationRef.current) {
      animationRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (animationRef.current) {
      animationRef.current.play();
      setIsPaused(false);
    }
  };

  // Don't render until networks are ready
  if (displayNetworks.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <div
        className="relative mx-auto max-w-5xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        {/* Center highlight */}
        <div className="absolute left-1/2 top-0 bottom-0 w-28 -ml-14 bg-gradient-to-r from-transparent via-envio-50/30 to-transparent z-0 pointer-events-none"></div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div ref={carouselRef} className="flex gap-3 py-2 px-8">
            {/* Display the extended network list */}
            {displayNetworks.map((network, i) => (
              <NetworkBubble
                key={`network-${i}`}
                name={network}
                isPaused={isPaused}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual network bubble
function NetworkBubble({
  name,
  isPaused,
}: {
  name: string;
  isPaused: boolean;
}) {
  const [isCenter, setIsCenter] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Check if bubble is in center of viewport
  useEffect(() => {
    // Only check position when not paused to prevent jumping
    if (isPaused) return;

    const checkIfCenter = () => {
      if (!bubbleRef.current) return;

      const rect = bubbleRef.current.getBoundingClientRect();
      const viewportCenter = window.innerWidth / 2;
      const bubbleCenter = rect.left + rect.width / 2;
      const distance = Math.abs(viewportCenter - bubbleCenter);

      setIsCenter(distance < 60);
    };

    const interval = setInterval(checkIfCenter, 50);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      ref={bubbleRef}
      className={`transition-all duration-300 ease-in-out ${isCenter ? "z-20" : "z-10"}`}
    >
      <div
        className={`
          px-3 py-1 rounded-full whitespace-nowrap transition-all duration-300
          ${
            isCenter
              ? "bg-gradient-to-r from-white to-orange-50 shadow-md border border-envio-200 transform scale-110"
              : "bg-white shadow-sm border border-gray-100 hover:shadow-md"
          }
        `}
      >
        <span
          className={`
            text-xs font-medium transition-all duration-300
            ${isCenter ? "text-envio-700 font-semibold" : "text-gray-700"}
          `}
        >
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </span>
      </div>
    </div>
  );
}
