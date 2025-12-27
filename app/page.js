"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { 
  RefreshCw, Plus, Save, Trash2, Edit3, Database, 
  Search, X, Sparkles, TrendingUp, Zap,
  BarChart3, Clock, Users, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import dynamic from 'next/dynamic';

const NeuEditor = dynamic(() => import('@/components/NeuEditor'), { ssr: false });

// Animations
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Input Component
const Input = ({ label, register, name, required = false, type = "text" }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">
        {label}
      </label>
      <input
        {...register(name, { required })}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-[var(--surface)] border ${
          focused ? 'border-[var(--accent-purple)]' : 'border-[var(--border)]'
        } rounded-xl px-4 py-3 text-sm transition-all duration-300
        focus:outline-none placeholder:text-[var(--text-tertiary)]`}
        style={{
          boxShadow: focused ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
        }}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </motion.div>
  );
};

// Liquid Glass Button Component
const LiquidButton = ({ children, onClick, variant = "default", className = "", type = "button", icon: Icon }) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const createRipple = (e) => {
    if (!buttonRef.current) return;
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = { x, y, size, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e) => {
    createRipple(e);
    onClick && onClick(e);
  };

  const baseClass = "liquid-glass-btn";
  const variantClass = variant === "primary" ? "liquid-glass-primary" : variant === "danger" ? "border-red-500/20 hover:border-red-500/40 text-red-400" : "";

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 
                  transition-all duration-300 ${baseClass} ${variantClass} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
      {Icon && <Icon size={18} />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Refined Card Component
const Card = ({ item, onEdit, onDelete, index }) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      custom={index}
      layout
      onMouseMove={handleMouseMove}
      className="card-refined rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
    >
      {/* Subtle Spotlight Effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.06), transparent 60%)`
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <motion.div 
            className="w-14 h-14 rounded-xl glass flex items-center justify-center overflow-hidden relative flex-shrink-0"
            whileHover={{ scale: 1.05 }}
          >
            {item.brand_logo ? (
              <img src={item.brand_logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gradient text-sm font-bold">{item.s_no}</div>
            )}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[var(--text-primary)] truncate mb-1">
              {item.brand_name}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full glass text-[var(--text-secondary)]">
                {item.Category_tags}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg glass text-xs font-semibold">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-[var(--text-primary)]">{item.New_MRR}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass rounded-lg p-2.5 text-center">
            <Users size={13} className="mx-auto mb-1 text-[var(--accent-blue)]" />
            <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Founder</p>
            <p className="text-xs font-semibold truncate">{item.Founder_name?.split(' ')[0] || 'N/A'}</p>
          </div>
          <div className="glass rounded-lg p-2.5 text-center">
            <Clock size={13} className="mx-auto mb-1 text-[var(--accent-cyan)]" />
            <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Timeline</p>
            <p className="text-xs font-semibold">{item.timeline || 'N/A'}</p>
          </div>
          <div className="glass rounded-lg p-2.5 text-center">
            <BarChart3 size={13} className="mx-auto mb-1 text-[var(--accent-pink)]" />
            <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Slug</p>
            <p className="text-xs font-semibold truncate">/{item.slug}</p>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={11} className="text-[var(--accent-purple)]" />
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Preview</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed line-clamp-2">
            {item.Cover_text || 'No description available'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <LiquidButton
            onClick={() => onEdit(item)}
            className="flex-1"
            icon={Edit3}
          >
            Edit
          </LiquidButton>
          
          <LiquidButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.s_no);
            }}
            variant="danger"
            icon={Trash2}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard
export default function CMSDashboard() {
  const [loading, setLoading] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState("");
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const bodyTextValue = watch("body_text");

  const filteredData = data.filter(item =>
    item.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.Category_tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.Founder_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchData = async (sheetName) => {
    setLoading(true);
    try {
      const param = sheetName ? `?sheet=${sheetName}` : "";
      const res = await fetch(`/api/cms${param}`);
      const json = await res.json();
      
      if(json.sheets) {
        setSheets(json.sheets);
        if (!currentSheet && json.sheets.length > 0) {
          setCurrentSheet(json.sheets[0]);
        }
      }
      if(json.data) setData(json.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentSheet) fetchData(currentSheet);
  }, [currentSheet]);

  const openAddModal = () => {
    setEditingItem(null);
    reset({});
    setValue("s_no", (data.length + 1).toString());
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset(item);
    setValue("body_text", item.body_text || "");
    setIsModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    const action = editingItem ? "UPDATE" : "CREATE";
    
    if (action === "CREATE") {
      setData([...data, formData]);
    } else {
      setData(data.map(item => item.s_no === formData.s_no ? formData : item));
    }
    setIsModalOpen(false);

    try {
      await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetName: currentSheet, data: formData, action })
      });
      await fetchData(currentSheet);
    } catch (err) {
      alert("Failed to sync");
      fetchData(currentSheet);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (s_no) => {
    if (!confirm("Delete this entry?")) return;
    setData(data.filter(item => item.s_no !== s_no));
    await fetch("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetName: currentSheet, data: { s_no }, action: "DELETE" })
    });
    fetchData(currentSheet);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 relative">
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-purple), transparent)', top: '-10%', left: '-10%' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-blue), transparent)', bottom: '-10%', right: '-10%' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-xl liquid-glass-primary flex items-center justify-center"
               
                transition={{ duration: 0.2 }}
              >
                <Database size={22} className="text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gradient">SheetCMS</h1>
                  <Sparkles size={18} className="text-[var(--accent-purple)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Premium Content Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={currentSheet}
                  onChange={(e) => setCurrentSheet(e.target.value)}
                  className="glass rounded-xl px-5 py-2.5 text-sm font-medium appearance-none cursor-pointer
                             border border-[var(--border)] hover:border-[var(--accent-purple)] transition-all pr-10"
                >
                  {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ArrowUpRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
              
              <LiquidButton onClick={() => fetchData(currentSheet)}>
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw size={16} />
                </motion.div>
              </LiquidButton>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="glass-strong rounded-xl p-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-purple)]" size={18} />
                <input
                  type="text"
                  placeholder="Search brands, categories, founders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-12 py-3 text-sm outline-none"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass flex items-center justify-center
                                 hover:bg-red-500/20 transition-colors"
                    >
                      <X size={12} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="glass px-4 py-2 rounded-lg">
                <span className="text-xs text-[var(--text-secondary)]">Total: </span>
                <span className="text-sm font-bold text-gradient">{filteredData.length}</span>
              </div>
            </div>
            <LiquidButton onClick={openAddModal} variant="primary" icon={Plus}>
              Create Entry
            </LiquidButton>
          </div>

          {loading && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <motion.div
                className="w-14 h-14 rounded-xl liquid-glass-primary flex items-center justify-center mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={28} className="text-white" />
              </motion.div>
              <p className="text-[var(--text-secondary)] text-sm">Loading content...</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="popLayout">
                {filteredData.map((item, index) => (
                  <Card
                    key={item.s_no}
                    item={item}
                    index={index}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                className="glass-strong rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-y-auto p-8 relative"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl liquid-glass-primary flex items-center justify-center">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gradient">
                        {editingItem ? `Edit ${editingItem.brand_name}` : "Create New Entry"}
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {editingItem ? 'Update your content' : 'Add a new brand'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="w-9 h-9 rounded-xl glass hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <Input label="Serial No" name="s_no" register={register} required />
                    <Input label="Brand Name" name="brand_name" register={register} required />
                    <Input label="Slug" name="slug" register={register} required />
                    <Input label="Brand Logo URL" name="brand_logo" register={register} />
                    <Input label="Founder Name" name="Founder_name" register={register} />
                    <Input label="Founder Image" name="Founder_image" register={register} />
                    <Input label="Category Tags" name="Category_tags" register={register} />
                    <Input label="Cover Image" name="Cover_Image_link" register={register} />
                  </div>

                  {/* Middle Column */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Old MRR" name="OLD_MRR" register={register} />
                      <Input label="New MRR" name="New_MRR" register={register} />
                    </div>
                    <Input label="Timeline" name="timeline" register={register} />
                    <Input label="Cover Text" name="Cover_text" register={register} />
                    <Input label="Custom CTA" name="Custom_CTA" register={register} />
                    <Input label="Tags" name="tag" register={register} />
                    <Input label="SEO Meta" name="SEO_meta_data" register={register} />
                  </div>

                  {/* Right Column - Editor */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 ml-1">
                      Body Text (Rich Editor)
                    </label>
                    <div className="flex-1 glass rounded-xl overflow-hidden mb-6 min-h-[400px]">
                      <NeuEditor 
                        value={bodyTextValue} 
                        onChange={(html) => setValue("body_text", html)} 
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <LiquidButton onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </LiquidButton>
                      <LiquidButton type="submit" variant="primary" icon={Save}>
                        {editingItem ? 'Update' : 'Create'}
                      </LiquidButton>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
