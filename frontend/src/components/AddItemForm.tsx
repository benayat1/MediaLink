import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { AnalyzedItem } from '../types';

interface Props {
  onSubmit: (item: Omit<AnalyzedItem, 'id' | 'dateAnalyzed'>) => void;
  onCancel: () => void;
}

export function AddItemForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'image' | 'text'>('image');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [currentEntity, setCurrentEntity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      title,
      content,
      thumbnail: type === 'image' ? thumbnail : undefined,
      tags,
      entities,
      confidence: 1.0,
    });
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const addEntity = () => {
    if (currentEntity && !entities.includes(currentEntity)) {
      setEntities([...entities, currentEntity]);
      setCurrentEntity('');
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) {
      setError('No files found in the selected folder.');
      return;
    }

    const supportedTypes = ['text/plain', 'image/png', 'image/jpeg', 'audio/wav', 'audio/x-wav'];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (!supportedTypes.includes(file.type)) {
        invalidFiles.push(file.name);
      } else {
        // Example: process the file or call onSubmit with its data
        const reader = new FileReader();
        reader.onload = () => {
          onSubmit({
            type: file.type.includes('image') ? 'image' : 'text',
            title: file.name,
            content: reader.result as string,
            tags: [],
            entities: [],
            confidence: 1.0,
          });
        };
        reader.readAsDataURL(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`The following files are not supported: ${invalidFiles.join(', ')}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Add New Item</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Folder</label>
          <input
            type="file"
            webkitdirectory=""
            multiple
            onChange={handleFolderUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'image' | 'text')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="image">Image</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          {type === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              required
            />
          ) : (
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Image URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Item
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </form>
  );
}
