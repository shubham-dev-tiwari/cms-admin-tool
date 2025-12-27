"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RefreshCw, Plus, Save, Trash2, Edit3, Database } from "lucide-react";
import clsx from "clsx";
// Remove this:
// import NeuEditor from "./components/NeuEditor";

// Add this instead:
import dynamic from 'next/dynamic';
const NeuEditor = dynamic(() => import('@/components/NeuEditor'), { ssr: false });

// --- Reusable Neumorphic Components ---

const NeuButton = ({ children, onClick, variant = "primary", className, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2",
        "shadow-neu hover:shadow-neu-pressed active:shadow-neu-pressed",
        variant === "primary" ? "text-neu-text hover:text-neu-accent" : "text-red-500",
        className
      )}
    >
      {children}
    </button>
  );
};

const NeuInput = ({ label, register, name, required = false, type = "text" }) => (
  <div className="flex flex-col gap-2 mb-4">
    <label className="text-xs font-bold text-neu-text uppercase tracking-wider ml-1">{label}</label>
    <input
      {...register(name, { required })}
      type={type}
      className="w-full bg-neu-base p-3 rounded-xl shadow-neu-pressed outline-none focus:ring-2 focus:ring-neu-accent/20 text-neu-text placeholder-gray-400 transition-all"
      placeholder={`Enter ${label}...`}
    />
  </div>
);

// --- Main Application ---

export default function CMSDashboard() {
  const [loading, setLoading] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState("");
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form handling
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  // Watch body_text so we can pass it into the editor
  const bodyTextValue = watch("body_text"); 

  // Fetch Data
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
      if(json.data) {
        setData(json.data);
      }
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

  const handleSheetChange = (e) => {
    setCurrentSheet(e.target.value);
  };

  const openAddModal = () => {
    setEditingItem(null);
    reset({});
    setValue("s_no", (data.length + 1).toString());
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset(item);
    // Explicitly set body_text for the editor to pick up
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
        body: JSON.stringify({
          sheetName: currentSheet,
          data: formData,
          action: action
        })
      });
      await fetchData(currentSheet);
    } catch (err) {
      alert("Failed to sync with Google Sheets");
      fetchData(currentSheet);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (s_no) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    setData(data.filter(item => item.s_no !== s_no));
    await fetch("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheetName: currentSheet,
        data: { s_no },
        action: "DELETE"
      })
    });
    fetchData(currentSheet);
  };

  return (
    <div className="min-h-screen bg-neu-base text-neu-text p-4 md:p-8 font-sans">
      
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full shadow-neu text-neu-accent">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SheetCMS</h1>
            <p className="text-sm opacity-60">Production Interface</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <select 
              value={currentSheet}
              onChange={handleSheetChange}
              className="w-full appearance-none bg-neu-base p-4 rounded-xl shadow-neu cursor-pointer outline-none focus:text-neu-accent font-semibold"
            >
              {sheets.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
          </div>
          
          <NeuButton onClick={() => fetchData(currentSheet)}>
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </NeuButton>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold opacity-80">{currentSheet} Data</h2>
            <NeuButton onClick={openAddModal} className="bg-neu-base">
                <Plus size={20} /> <span className="hidden md:inline">Add Entry</span>
            </NeuButton>
        </div>

        {loading && data.length === 0 ? (
           <div className="flex justify-center p-20 opacity-50">Loading Spreadsheet...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {data.map((item, index) => (
              <article key={item.s_no || index} className="bg-neu-base rounded-2xl p-6 shadow-neu transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full shadow-neu-pressed overflow-hidden flex items-center justify-center bg-gray-100">
                      {item.brand_logo ? (
                         <img src={item.brand_logo} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xs font-bold">{item.s_no}</span>
                      )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{item.brand_name}</h3>
                        <p className="text-xs text-neu-accent">{item.Category_tags}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full shadow-neu text-xs font-bold">
                    {item.New_MRR}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 text-sm opacity-70">
                    <p className="truncate"><strong>Slug:</strong> /{item.slug}</p>
                    <p className="truncate"><strong>Founder:</strong> {item.Founder_name}</p>
                    {/* Render HTML preview safely if needed, or just text */}
                    <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: item.body_text }}></div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <NeuButton onClick={() => openEditModal(item)} className="flex-1 py-2 text-sm">
                    <Edit3 size={16} /> Edit
                  </NeuButton>
                  <NeuButton onClick={() => handleDelete(item.s_no)} variant="danger" className="py-2 text-sm text-red-500">
                    <Trash2 size={16} />
                  </NeuButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-base/50 backdrop-blur-sm">
          <div className="bg-neu-base w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-neu p-8 border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-neu-accent">
                {editingItem ? `Edit ${editingItem.brand_name}` : "New Entry"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full shadow-neu hover:text-red-500">✕</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column - Meta Data */}
              <div className="space-y-4 md:col-span-1">
                <NeuInput label="S. No" name="s_no" register={register} required />
                <NeuInput label="Brand Name" name="brand_name" register={register} required />
                <NeuInput label="Slug" name="slug" register={register} required />
                <NeuInput label="Brand Logo URL" name="brand_logo" register={register} />
                <NeuInput label="Founder Name" name="Founder_name" register={register} />
                <NeuInput label="Founder Image URL" name="Founder_image" register={register} />
                <NeuInput label="Category Tags" name="Category_tags" register={register} />
                <NeuInput label="Cover Image URL" name="Cover_Image_link" register={register} />
              </div>

              {/* Middle Column - More Meta */}
              <div className="space-y-4 md:col-span-1">
                 <div className="grid grid-cols-2 gap-4">
                    <NeuInput label="Old MRR" name="OLD_MRR" register={register} />
                    <NeuInput label="New MRR" name="New_MRR" register={register} />
                 </div>
                 <NeuInput label="Timeline" name="timeline" register={register} />
                 <NeuInput label="Cover Text" name="Cover_text" register={register} />
                 <NeuInput label="Custom CTA" name="Custom_CTA" register={register} />
                 <NeuInput label="Tags" name="tag" register={register} />
                 <NeuInput label="SEO Meta" name="SEO_meta_data" register={register} />
              </div>

              {/* Right Column - RICH TEXT EDITOR */}
              <div className="md:col-span-3 lg:col-span-1 lg:row-span-2 flex flex-col">
                 <label className="text-xs font-bold text-neu-text uppercase tracking-wider ml-1 mb-2 block">Body Text (Rich Editor)</label>
                 
                 {/* REPLACED TEXTAREA WITH NEUEDITOR */}
                 <div className="flex-grow">
                   <NeuEditor 
                      value={bodyTextValue} 
                      onChange={(html) => setValue("body_text", html)} 
                   />
                 </div>
                 
                 <div className="mt-8 flex justify-end gap-4">
                   <NeuButton onClick={() => setIsModalOpen(false)}>Cancel</NeuButton>
                   <NeuButton type="submit" className="text-neu-accent">
                      <Save size={18} /> Publish
                   </NeuButton>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}