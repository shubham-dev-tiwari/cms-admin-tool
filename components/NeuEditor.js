"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, Italic, Underline as UnderlineIcon, Quote, 
  List, ListOrdered, Image as ImageIcon, 
  Highlighter, Maximize2, Minimize2, Check, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useCallback, useState, useEffect, useRef } from 'react';

// --- Liquid Glass Button ---
const EditorBtn = ({ onClick, isActive = false, children, title, className }) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

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

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        createRipple(e);
        onClick(e);
      }}
      title={title}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "relative p-2.5 rounded-lg transition-all duration-300 flex items-center justify-center overflow-hidden",
        "liquid-glass-btn",
        isActive 
          ? "bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border-[var(--accent-purple)]/30" 
          : "text-[var(--text-secondary)] hover:text-[var(--accent-purple)] hover:border-[var(--accent-purple)]/20",
        className
      )}
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
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// --- Custom Floating Menu ---
const CustomFloatingMenu = ({ editor }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { selection } = editor.state;
      const { empty, from, to } = selection;

      if (empty || from === to) {
        setIsVisible(false);
        return;
      }

      const view = editor.view;
      if (!view || !view.coordsAtPos) return;

      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      const left = (start.left + end.left) / 2;
      const top = start.top - 60; 

      setCoords({ top, left });
      setIsVisible(true);
    };

    editor.on('selectionUpdate', updateMenu);
    
    return () => {
      editor.off('selectionUpdate', updateMenu);
    };
  }, [editor]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed z-[1001] flex gap-1 glass-strong p-2 rounded-xl"
          style={{ 
            top: coords.top, 
            left: coords.left,
            transform: 'translateX(-50%)' 
          }}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </EditorBtn>
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </EditorBtn>
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </EditorBtn>
          
          <div className="w-px h-6 bg-[var(--border)] mx-1 self-center"></div>

          <EditorBtn 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={16} />
          </EditorBtn>
          
          {/* Color Picker */}
          <div className="relative flex items-center justify-center p-2.5 rounded-lg liquid-glass-btn cursor-pointer group">
            <input
              type="color"
              onInput={(event) => {
                  editor.chain().focus().setColor(event.target.value).run();
              }}
              defaultValue={editor.getAttributes('textStyle').color || '#8B5CF6'}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              title="Text Color"
            />
            <motion.div 
              className="w-4 h-4 rounded-full border border-[var(--border-bright)]" 
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#8B5CF6' }}
              whileHover={{ scale: 1.2 }}
            ></motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Editor Component ---
export default function NeuEditor({ value, onChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image,
      TextStyle, 
      Color,     
      Highlight.configure({ multicolor: true }),
    ],
    content: value || '',
    onCreate: ({ editor }) => {
      const initialCount = editor.getText().length;
      setCharCount(initialCount);
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setCharCount(editor.getText().length);
    },
    editorProps: {
      attributes: {
        class: clsx(
          "prose prose-invert prose-sm max-w-none",
          "text-[var(--text-primary)] leading-relaxed",
          "focus:outline-none p-5",
          "[&_p]:mb-3 [&_p]:text-[var(--text-primary)]",
          "[&_h1]:text-[var(--text-primary)] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4",
          "[&_h2]:text-[var(--text-primary)] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3",
          "[&_h3]:text-[var(--text-primary)] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2",
          "[&_strong]:!text-inherit [&_strong]:font-bold",
          "[&_em]:!text-inherit [&_em]:italic",
          "[&_u]:!text-inherit [&_u]:underline [&_u]:decoration-[var(--text-primary)]",
          "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 [&_ul]:text-[var(--text-primary)]",
          "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3 [&_ol]:text-[var(--text-primary)]",
          "[&_li]:mb-1.5 [&_li]:text-[var(--text-primary)]",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--text-primary)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-secondary)] [&_blockquote]:my-4",
          "[&_code]:bg-[var(--surface)] [&_code]:text-[var(--text-primary)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
          "[&_pre]:bg-[var(--surface)] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4",
          "[&_img]:rounded-lg [&_img]:my-4 [&_img]:border [&_img]:border-[var(--border)]",
          "[&_a]:text-[var(--text-primary)] [&_a]:underline [&_a]:hover:text-[var(--text-primary)]"
        ),
      },
    },
  });

  // Handle fullscreen with ESC key
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          setIsFullscreen(false);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFullscreen]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  // Fullscreen Overlay Component
  if (isFullscreen) {
    return (
      <motion.div
        className="fixed inset-0 z-[1000] bg-[var(--bg-primary)] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-animated"></div>

        {/* Fullscreen Toolbar */}
        <motion.div 
          className="flex flex-wrap gap-2 p-4 glass-strong mx-4 mt-4 rounded-lg items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 mr-4">
            <Sparkles size={18} className="text-[var(--accent-purple)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Body Text Editor</h3>
          </div>

          <div className="w-px h-7 bg-[var(--border)]"></div>

          {/* B/I/U buttons */}
          <div className="flex items-center gap-1.5">
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              isActive={editor.isActive('bold')} 
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </EditorBtn>
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              isActive={editor.isActive('italic')} 
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </EditorBtn>
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleUnderline().run()} 
              isActive={editor.isActive('underline')} 
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={18} />
            </EditorBtn>
          </div>

          <div className="w-px h-7 bg-[var(--border)]"></div>

          {/* List buttons */}
          <div className="flex items-center gap-1.5">
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              isActive={editor.isActive('bulletList')} 
              title="Bullet List"
            >
              <List size={18} />
            </EditorBtn>
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              isActive={editor.isActive('orderedList')} 
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </EditorBtn>
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              isActive={editor.isActive('blockquote')} 
              title="Quote"
            >
              <Quote size={18} />
            </EditorBtn>
          </div>

          <div className="w-px h-7 bg-[var(--border)]"></div>

          {/* Highlight & Image */}
          <div className="flex items-center gap-1.5">
            <EditorBtn 
              onClick={() => editor.chain().focus().toggleHighlight().run()} 
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter size={18} />
            </EditorBtn>

            <EditorBtn onClick={addImage} title="Embed Image">
              <ImageIcon size={18} />
            </EditorBtn>

            {/* Color Picker */}
            <div className="relative flex items-center justify-center p-2.5 rounded-lg liquid-glass-btn cursor-pointer">
              <input
                type="color"
                onInput={(event) => {
                    editor.chain().focus().setColor(event.target.value).run();
                }}
                defaultValue={editor.getAttributes('textStyle').color || '#8B5CF6'}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                title="Text Color"
              />
              <motion.div 
                className="w-4 h-4 rounded-full border border-[var(--border-bright)]" 
                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#8B5CF6' }}
                whileHover={{ scale: 1.2 }}
              ></motion.div>
            </div>
          </div>

          {/* Right Side - Character Count & Exit */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
              <Sparkles size={12} className="text-[var(--accent-purple)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                {charCount} characters
              </span>
            </div>
            
            <motion.button 
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-4 py-2.5 liquid-glass-primary rounded-lg font-semibold text-sm text-white"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Check size={16} /> Done Editing
            </motion.button>
          </div>
        </motion.div>

        {/* Floating Menu */}
        <CustomFloatingMenu editor={editor} />

        {/* Editor Area - FULL HEIGHT */}
        <div className="flex-1 overflow-hidden px-4 pb-4 pt-2">
          <motion.div 
            className="h-full overflow-y-auto rounded-xl glass-strong"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <EditorContent editor={editor} />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Normal (inline) mode
  return (
    <motion.div 
      className="glass rounded-xl p-4 flex flex-col relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Gradient Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl gradient-animated"></div>
      
      {/* TOOLBAR */}
      <motion.div 
        className="flex flex-wrap gap-2 mb-4 p-3 glass-strong rounded-lg items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* B/I/U buttons */}
        <div className="flex items-center gap-1.5">
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')} 
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </EditorBtn>
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')} 
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </EditorBtn>
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            isActive={editor.isActive('underline')} 
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </EditorBtn>
        </div>

        <div className="w-px h-7 bg-[var(--border)] mx-1"></div>

        {/* List buttons */}
        <div className="flex items-center gap-1.5">
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive('bulletList')} 
            title="Bullet List"
          >
            <List size={18} />
          </EditorBtn>
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            isActive={editor.isActive('orderedList')} 
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </EditorBtn>
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            isActive={editor.isActive('blockquote')} 
            title="Quote"
          >
            <Quote size={18} />
          </EditorBtn>
        </div>

        <div className="w-px h-7 bg-[var(--border)] mx-1"></div>

        {/* Highlight & Image */}
        <div className="flex items-center gap-1.5">
          <EditorBtn 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={18} />
          </EditorBtn>

          <EditorBtn onClick={addImage} title="Embed Image">
            <ImageIcon size={18} />
          </EditorBtn>

          {/* Color Picker */}
          <div className="relative flex items-center justify-center p-2.5 rounded-lg liquid-glass-btn cursor-pointer">
            <input
              type="color"
              onInput={(event) => {
                  editor.chain().focus().setColor(event.target.value).run();
              }}
              defaultValue={editor.getAttributes('textStyle').color || '#8B5CF6'}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              title="Text Color"
            />
            <motion.div 
              className="w-4 h-4 rounded-full border border-[var(--border-bright)]" 
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#8B5CF6' }}
              whileHover={{ scale: 1.2 }}
            ></motion.div>
          </div>
        </div>

        {/* Right Side - Fullscreen button */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
            <Sparkles size={12} className="text-[var(--accent-purple)]" />
            <span className="text-xs text-[var(--text-secondary)]">
              {charCount} chars
            </span>
          </div>
          
          <EditorBtn 
            onClick={() => setIsFullscreen(true)} 
            title="Enter Fullscreen"
          >
            <Maximize2 size={18} />
          </EditorBtn>
        </div>
      </motion.div>

      {/* Floating Menu */}
      <CustomFloatingMenu editor={editor} />

      {/* EDITOR AREA - Normal Mode */}
      <motion.div 
        className="flex-grow overflow-y-auto rounded-lg glass-strong min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <EditorContent editor={editor} />
      </motion.div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-[var(--accent-purple)]/5 to-transparent rounded-b-xl"></div>
    </motion.div>
  );
}
