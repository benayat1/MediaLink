import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AnalyzedItemCard } from "./components/AnalyzedItemCard";
import { RelationshipGraph } from "./components/RelationshipGraph";
import { useItems } from "./hooks/useItems";
import { AnalyzedItem } from "./types";
import { PlusCircle } from "lucide-react";
import Popup from "./components/Popup";

function App() {
  const [selectedItem, setSelectedItem] = useState<AnalyzedItem | undefined>();
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { items, relationships, addItem, setItems } = useItems();
  const [searchQuery, setSearchQuery] = useState("");

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("No files selected");
      return;
    }
  
    const validFileTypes = ["text/plain", "image/png", "image/jpeg", "image/jpg", "audio/wav", "audio/x-wav"];
    const totalFiles = files.length;
    let successfulUploads = 0;
  
    setUploading(true);
    setUploadProgress(0);
  
    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        if (!validFileTypes.includes(file.type)) {
          console.warn(`File type not supported: ${file.name}`);
          continue;
        }
  
        const formData = new FormData();
        formData.append("file", file, file.name); // הוספתי את file.name כאן
  
        const response = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          const analyzedItem = await response.json();
          addItem(analyzedItem);
          successfulUploads++;
        } else {
          const errorMessage = await response.text();
          console.error(`Failed to upload file: ${file.name}, Error: ${errorMessage}`);
        }
  
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
    } catch (err) {
      console.error("Unexpected error occurred:", err);
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setUploading(false);
      setShowPopup(false);
    }
  };  

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:8000/items");
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        } else {
          console.error("Failed to fetch items");
        }
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, [setItems]);

  const filteredItems = items.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.classification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header onSearch={setSearchQuery} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Analyzed Items</h2>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <AnalyzedItemCard
                  key={item.id}
                  item={item}
                  onClick={(selected) => {
                    setSelectedItem(selected);
                    setShowDetailsPopup(true);
                  }}
                />
              ))}
            </div>
          </div>
          <div>
          <h2 className="text-xl font-semibold text-gray-900">Relationship Graph</h2>
          <br/>
            <RelationshipGraph
              items={items}
              relationships={relationships}
              selectedItem={selectedItem}
            />
          </div>
        </div>
      </main>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Upload Folder</h2>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            <form>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Choose a folder
              </label>
              <input
                type="file"
                id="file"
                name="file"
                webkitdirectory=""
                directory=""
                className="mt-2 p-2 border rounded w-full"
                onChange={handleFolderUpload}
              />
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-red-500 hover:underline"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      )}

      {showDetailsPopup && selectedItem && (
        <Popup item={selectedItem} onClose={() => setShowDetailsPopup(false)} />
      )}
    </div>
  );
}

export default App;
