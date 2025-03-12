import React from "react";

export default function UseCaseDisplay() {
  // Define use cases with their display properties
  const useCases = [
    {
      id: "spot-trends",
      text: "Spot trends",
      bg: "bg-blue-50/80",
      border: "border-blue-200",
      text_color: "text-blue-700",
      icon: "📈",
    },
    {
      id: "indexing-efforts",
      text: "Understand indexing efforts",
      bg: "bg-pink-50/80",
      border: "border-pink-200",
      text_color: "text-pink-700",
      icon: "🔍",
    },
    {
      id: "contract-usage",
      text: "Analyze contracts",
      bg: "bg-indigo-50/80",
      border: "border-indigo-200",
      text_color: "text-indigo-700",
      icon: "📝",
    },
    {
      id: "activity-patterns",
      text: "Detect patterns",
      bg: "bg-green-50/80",
      border: "border-green-200",
      text_color: "text-green-700",
      icon: "🔄",
    },
    // {
    //   id: "volume-analysis",
    //   text: "Measure volumes",
    //   bg: "bg-orange-50/80",
    //   border: "border-orange-200",
    //   text_color: "text-orange-700",
    //   icon: "📊",
    // },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-3 py-3">
        {useCases.map((useCase) => (
          <UseCaseBubble
            key={useCase.id}
            text={useCase.text}
            bg={useCase.bg}
            border={useCase.border}
            text_color={useCase.text_color}
            icon={useCase.icon}
          />
        ))}
      </div>
    </div>
  );
}

interface UseCaseBubbleProps {
  text: string;
  bg: string;
  border: string;
  text_color: string;
  icon: string;
}

function UseCaseBubble({
  text,
  bg,
  border,
  text_color,
  icon,
}: UseCaseBubbleProps) {
  return (
    <div
      className={`px-4 py-1.5 rounded-full whitespace-nowrap border shadow-sm hover:shadow-md transition-all duration-200 ${bg} ${border}`}
    >
      <span className={`text-xs font-medium ${text_color} flex items-center`}>
        <span className="mr-1.5">{icon}</span>
        {text}
      </span>
    </div>
  );
}
