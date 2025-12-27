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
  Highlighter, Maximize2, Minimize2, Check
} from 'lucide-react';
import clsx from 'clsx';
import { useCallback, useState, useEffect } from 'react';

// --- Neumorphic Button ---
const EditorBtn = ({ onClick, isActive = false, children, title, className }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    title={title}
    className={clsx(
      "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
      isActive 
        ? "shadow-neu-pressed text-neu-accent" 
        : "shadow-neu text-neu-text hover:text-neu-accent",
      className
    )}
  >
    {children}
  </button>
);

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
      const top = start.top - 50; 

      setCoords({ top, left });
      setIsVisible(true);
    };

    editor.on('selectionUpdate', updateMenu);
    
    return () => {
      editor.off('selectionUpdate', updateMenu);
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[70] flex gap-1 bg-neu-base p-2 rounded-xl shadow-neu border border-white/50 animate-in fade-in zoom-in duration-200"
      style={{ 
        top: coords.top, 
        left: coords.left,
        transform: 'translateX(-50%)' 
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
        <EditorBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <Bold size={16} />
        </EditorBtn>
        <EditorBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <Italic size={16} />
        </EditorBtn>
        <EditorBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
          <UnderlineIcon size={16} />
        </EditorBtn>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

        <EditorBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')}>
          <Highlighter size={16} />
        </EditorBtn>
        
        {/* Color Picker */}
        <div className="relative flex items-center justify-center p-2 rounded-lg shadow-neu hover:shadow-neu-pressed cursor-pointer group">
          <input
            type="color"
            onInput={(event) => {
                editor.chain().focus().setColor(event.target.value).run();
            }}
            defaultValue={editor.getAttributes('textStyle').color || '#000000'}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
            title="Text Color"
          />
          <div 
            className="w-4 h-4 rounded-full border border-gray-300" 
            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#4A5568' }}
          ></div>
        </div>
    </div>
  );
};

// --- Main Editor Component ---
export default function NeuEditor({ value, onChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // FIX: Using clsx to handle newlines properly
        class: clsx(
          "prose prose-sm max-w-none",
          "text-neu-text leading-snug",
          "focus:outline-none min-h-[300px] p-4",
          "[&_p]:mb-2 [&_li]:mb-1"
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
       if (editor.getText() === '' && value !== '<p></p>') {
          editor.commands.setContent(value);
       }
    }
  }, [editor, value]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div 
      className={clsx(
        "bg-neu-base border border-white/20 transition-all duration-300 flex flex-col",
        isFullscreen 
          ? "fixed inset-0 z-[60] rounded-none p-6" 
          : "rounded-xl shadow-neu-pressed p-4 relative"
      )}
    >
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 mb-4 p-2 border-b border-gray-300/20 pb-4 items-center">
        
        <EditorBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List size={18} />
        </EditorBtn>
        <EditorBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={18} />
        </EditorBtn>
        <EditorBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <Quote size={18} />
        </EditorBtn>

        <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>

        <EditorBtn onClick={addImage} title="Embed Image">
          <ImageIcon size={18} />
        </EditorBtn>

        {/* Right Side Actions */}
        <div className="ml-auto flex gap-2">
            {isFullscreen && (
                 <button 
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-neu-accent text-white rounded-lg shadow-neu active:scale-95 transition-transform"
                 >
                    <Check size={16} /> Done
                 </button>
            )}
            
            <EditorBtn onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Minimize" : "Maximize (Pop out)"}>
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </EditorBtn>
        </div>
      </div>

      {/* CUSTOM FLOATING MENU */}
      <CustomFloatingMenu editor={editor} />

      {/* EDITOR AREA */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}