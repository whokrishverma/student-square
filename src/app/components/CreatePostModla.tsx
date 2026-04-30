
import { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (caption: string, imageUrl?: string) => void;
  currentUserAvatar: string;
  currentUserName: string;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  currentUserAvatar,
  currentUserName,
}: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (caption.trim()) {
      onSubmit(caption, imageUrl || undefined);
      setCaption('');
      setImageUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Create new post</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <ImageWithFallback
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-10 h-10 rounded-full object-cover"
              query="user avatar"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm mb-2">{currentUserName}</p>
              <textarea
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full min-h-[120px] text-sm outline-none resize-none"
                autoFocus
              />
            </div>
          </div>

          {/* Image URL Input */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <ImagePlus size={18} />
              Add image URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="mb-4">
              <ImageWithFallback
                src={imageUrl}
                alt="Preview"
                className="w-full rounded-lg object-cover max-h-[300px]"
                query="preview image"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!caption.trim()}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
