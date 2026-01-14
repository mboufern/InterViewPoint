import React from 'react';
import { X } from 'lucide-react';

interface ChartZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  runInfo?: {
    name: string;
    dates: string;
  };
  children: React.ReactNode;
}

export const ChartZoomModal: React.FC<ChartZoomModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  runInfo,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <div className="flex flex-col gap-0.5 mt-1">
                {description && <p className="text-sm text-gray-500">{description}</p>}
                {runInfo && (
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {runInfo.name} • <span className="text-gray-400 font-medium">{runInfo.dates}</span>
                    </p>
                )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-hidden bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
