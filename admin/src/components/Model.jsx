import { CheckCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Modal = ({
    open,
    close,
    title,
    children,
    items = [],
    onSelect,
    onSubmit,
    submitText = "Submit",
    cancelText = "Cancel",
    loading = false,
    selectedValue = null,        
}) => {
    const [internalSelected, setInternalSelected] = useState(null);

    // Sync with external selectedValue if provided
    useEffect(() => {
        if (selectedValue !== undefined && selectedValue !== null) {
            setInternalSelected(selectedValue);
        }
    }, [selectedValue]);

    const handleSelect = (item) => {
        const value = item.value || item.id || item;
        setInternalSelected(value);
        onSelect?.(item);           // Call parent's onSelect
    };

    const isSelected = (item) => {
        const itemValue = item.value || item.id || item;
        return internalSelected === itemValue || selectedValue === itemValue;
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") close();
        };

        if (open) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden"; // Prevent background scroll
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [open, close]);

    if (!open || typeof window === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={close}
            />

            {/* Modal Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                className="relative bg-white w-full max-w-md h-[90%] overflow-y-scroll rounded-2xl shadow-2xl "
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b">
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                    <button
                        onClick={close}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}

                    {/* Selectable Items */}
                    {items.length > 0 && (
                        <div className="max-h-80 overflow-auto space-y-2 mt-4 pr-2 custom-scroll">
                            {items.map((item, index) => {
                                const displayName = item.name || item.label || item;
                                const isItemSelected = isSelected(item);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelect(item)}
                                        className={`w-full text-left px-4 py-3.5 border rounded-xl transition-all duration-200 hover:bg-slate-50 flex items-center justify-between group
                                            ${isItemSelected
                                                ? "bg-blue-50 border-blue-500 shadow-sm"
                                                : "border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        <span className="text-sm text-slate-700 font-medium">
                                            {displayName}
                                        </span>
                                        {isItemSelected && (
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                <CheckCircle size={14} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-5 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={close}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-medium transition"
                    >
                        {cancelText}
                    </button>

                    {onSubmit && (
                        <button
                            onClick={onSubmit}
                            disabled={loading || (items.length > 0 && !internalSelected && !selectedValue)}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            {loading ? "Processing..." : submitText}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;