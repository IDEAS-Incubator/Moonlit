import { useEffect } from 'react';

type ModalProps = {
  showModal: boolean;
  onClose: () => void;
  pdfUrl: string;
};

export const Modal: React.FC<ModalProps> = ({ showModal, onClose, pdfUrl }) => {
  // Close the modal when clicking outside the iframe or pressing escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative w-full max-w-4xl h-3/4">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>
        <iframe
          src={pdfUrl}
          title="Comic PDF"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
