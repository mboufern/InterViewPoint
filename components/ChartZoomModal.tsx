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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-none md:rounded-xl shadow-2xl w-full max-w-7xl h-full md:h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
            <div className="flex flex-col gap-0.5 mt-0.5 md:mt-1">
                {description && <p className="text-xs md:text-sm text-gray-500">{description}</p>}
                {runInfo && (
                    <p className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wide">
                        {runInfo.name} • <span className="text-gray-400 font-medium">{runInfo.dates}</span>
                    </p>
                )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-5 md:w-6 h-5 md:h-6" />
          </button>
        </div>
        <div className="flex-1 p-3 md:p-6 overflow-hidden bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
