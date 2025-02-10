import { useState, useEffect } from "react";
import { FileText, Image, Tag } from "lucide-react";
import { AnalyzedItem } from "../types";
import { fetchFile } from "../hooks/apiService";

interface Props {
  item: AnalyzedItem;
  onClick: (item: AnalyzedItem) => void;
}

export function AnalyzedItemCard({ item, onClick }: Props) {
  const [fileSrc, setFileSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
        try {
            const fileUrl = await fetchFile(item.type, item.title); // שימוש בפונקציה המעודכנת
            setFileSrc(fileUrl); // שמירת ה-URL שנוצר
        } catch (error) {
            console.error("Error loading file:", error);
        }
    };

    if (item.type === "image" || item.type === "audio") {
        loadFile();
    }
  }, [item.type, item.title]);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(item)}
    >
      {/* הצגת קובץ בהתאם לסוגו */}
      {item.type === "image" && fileSrc && (
        <img src={fileSrc} alt={item.title} className="w-full h-48 object-cover" />
      )}
      {item.type === "audio" && fileSrc && (
        <audio controls>
          <source src={fileSrc} type="audio/wav" />
          Your browser does not support the audio tag.
        </audio>
      )}
      {/* שאר התצוגה */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          {item.type === "image" ? (
            <Image className="h-4 w-4 text-indigo-600" />
          ) : (
            <FileText className="h-4 w-4 text-indigo-600" />
          )}
          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map((tag) => (
            <span
              key={tag.text}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tag.color,
                color: "#fff",
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag.text}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Classification: {item.classification}</span>
          <span>{new Date(item.dateAnalyzed).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
