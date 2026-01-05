/**
 * Rich Text Editor Component
 * Simple contentEditable based rich text editor
 */

import { useEffect, useRef } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = '', className = '', error = false }) => {
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    const currentContent = editorRef.current.innerHTML;
    if (currentContent !== (value || '')) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value || '';
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [value]);

  const handleInput = () => {
    if (isUpdatingRef.current) return;
    
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={`${error ? 'border border-red-300 rounded-lg' : 'border border-gray-300 rounded-lg'} ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
        >
          <strong className="font-bold">B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
        >
          <em className="italic">I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer border-b-2 border-gray-600"
          title="Underline"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="text-sm">U</span>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          title="Bullet List"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13m-13 6h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          title="Numbered List"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm"
          title="Paragraph"
          onMouseDown={(e) => e.preventDefault()}
        >
          P
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm font-bold"
          title="Heading 2"
          onMouseDown={(e) => e.preventDefault()}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm font-bold"
          title="Heading 3"
          onMouseDown={(e) => e.preventDefault()}
        >
          H3
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm"
          title="Clear Formatting"
          onMouseDown={(e) => e.preventDefault()}
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div className="relative bg-white" style={{ minHeight: '200px' }}>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className="outline-none px-3 py-2 min-h-[200px] focus:ring-1 focus:ring-blue-500"
          style={{ minHeight: '200px' }}
          suppressContentEditableWarning
        />
        {!value && (
          <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
