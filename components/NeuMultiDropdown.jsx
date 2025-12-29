import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Check, X, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const NeuMultiDropdown = ({ label, value = [], optionSet, onChange, error, required, placeholder = "Select options..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle toggling an option
  const toggleOption = (optionLabel) => {
    if (value.includes(optionLabel)) {
      // Remove it
      onChange(value.filter((item) => item !== optionLabel));
    } else {
      // Add it
      onChange([...value, optionLabel]);
    }
  };

  // Remove a tag specifically (clicked the X on the chip)
  const removeTag = (e, optionLabel) => {
    e.stopPropagation(); // Prevent dropdown toggle
    onChange(value.filter((item) => item !== optionLabel));
  };

  return (
    <motion.div 
      ref={dropdownRef}
      className="relative mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Label */}
      <div className="flex justify-between items-center mb-2 ml-1">
        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {error && (
          <span className="text-[10px] text-red-400 font-medium animate-pulse">
            {error.message}
          </span>
        )}
      </div>

      {/* Trigger Area (Displays Chips) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[var(--surface)] border rounded-xl px-2 py-2 min-h-[46px] text-sm transition-all duration-300
        focus:outline-none ${
          error 
            ? 'border-red-500/50' 
            : isOpen 
              ? 'border-[var(--accent-purple)] shadow-[0_0_0_3px_rgba(139,92,246,0.1)]' 
              : 'border-[var(--border)]'
        }`}
      >
        <div className="flex flex-wrap gap-2 items-center w-full pr-2">
          {value.length === 0 ? (
             <span className="text-[var(--text-tertiary)] px-2">{placeholder}</span>
          ) : (
            value.map((selectedLabel) => {
              // Find full object to get icon if needed
              const optionData = optionSet.find(o => o.label === selectedLabel);
              return (
                <span 
                  key={selectedLabel}
                  className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/20 text-xs font-medium"
                >
                  {optionData?.icon && <span>{optionData.icon}</span>}
                  <span>{selectedLabel}</span>
                  <div 
                    role="button"
                    onClick={(e) => removeTag(e, selectedLabel)}
                    className="hover:bg-[var(--accent-purple)]/20 rounded-md p-0.5 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </div>
                </span>
              );
            })
          )}
        </div>
        
        <ArrowDown
          size={16} 
          className={`text-[var(--text-tertiary)] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : '0'}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto p-1">
              {optionSet?.map((option) => {
                const isSelected = value.includes(option.label);
                return (
                  <button
                    key={option.code || option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)} // Don't close dropdown on multi-select
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors group
                      ${isSelected ? 'bg-[var(--accent-purple)]/5 text-[var(--text-primary)]' : 'text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                        {/* Checkbox visual */}
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[var(--accent-purple)] border-[var(--accent-purple)]' : 'border-[var(--text-tertiary)]'
                        }`}>
                            {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        
                        {option.icon && <span className="text-lg">{option.icon}</span>}
                        <span className="font-medium">{option.label}</span>
                    </div>

                    {isSelected && <Sparkles size={14} className="text-[var(--accent-purple)]" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NeuMultiDropdown;