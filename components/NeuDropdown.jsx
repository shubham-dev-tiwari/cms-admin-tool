import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
// --- NEW COMPONENT: Country Select (Matches Input Style) ---
const COUNTRIES = [
  { code: 'US', label: 'United States', icon: '🇺🇸' },
  { code: 'IN', label: 'India', icon: '🇮🇳' },
  { code: 'GB', label: 'United Kingdom', icon: '🇬🇧' },
  { code: 'CA', label: 'Canada', icon: '🇨🇦' },
  { code: 'AU', label: 'Australia', icon: '🇦🇺' },
  { code: 'DE', label: 'Germany', icon: '🇩🇪' },
];

const NeuDropdown = ({ label, value, optionSet, onChange,error, required }) => {
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

  const selectedOption = optionSet?.find(c => c.label === value) || "";

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

      {/* Trigger Button (Styled exactly like your Input component) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[var(--surface)] border rounded-xl px-4 py-3 text-sm transition-all duration-300
        focus:outline-none ${
          error 
            ? 'border-red-500/50' 
            : isOpen 
              ? 'border-[var(--accent-purple)] shadow-[0_0_0_3px_rgba(139,92,246,0.1)]' 
              : 'border-[var(--border)]'
        }`}
      >
        <span className="flex items-center gap-2 text-[var(--text-primary)]">
          <span className="">{selectedOption.icon}</span>
          <span>{selectedOption.label}</span>
        </span>
        <ArrowDown
          size={16} 
          className={`text-[var(--text-tertiary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : '0'}`} 
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
              {optionSet?.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    onChange(option.label);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
                    ${value === option.label ? 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]' : 'text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5'}
                  `}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {value === option.label && <Sparkles size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default NeuDropdown;