import React from "react";
import { AnalyzedItem } from "../types";

interface PopupProps {
  item: AnalyzedItem;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{item.title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-600">Type:</p>
            <p className="text-gray-800">{item.type}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-600">Content:</p>
            <p className="text-gray-800">{item.content}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-600">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map(
                (tag: { text: string; color: string }, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.text}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-600">
              Classification:
            </p>
            <p className="text-gray-800">{item.classification}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <button
            className="px-6 py-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
