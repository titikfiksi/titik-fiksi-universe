"use client";
import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List } from 'lucide-react';

export default function RichTextEditor({ defaultValue, name }: { defaultValue?: string, name: string }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editorRef.current && defaultValue) {
            editorRef.current.innerHTML = defaultValue;
        }
    }, [defaultValue]);

    const handleInput = () => {
        if (editorRef.current && inputRef.current) {
            inputRef.current.value = editorRef.current.innerHTML;
        }
    };

    const executeCommand = (cmd: string, arg?: string) => {
        document.execCommand(cmd, false, arg);
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
            <input type="hidden" name={name} ref={inputRef} defaultValue={defaultValue} />
            
            {/* Toolbar Profesional */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                <button type="button" onClick={() => executeCommand('bold')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Bold"><Bold size={16}/></button>
                <button type="button" onClick={() => executeCommand('italic')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Italic"><Italic size={16}/></button>
                <button type="button" onClick={() => executeCommand('underline')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Underline"><Underline size={16}/></button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => executeCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Align Left"><AlignLeft size={16}/></button>
                <button type="button" onClick={() => executeCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Align Center"><AlignCenter size={16}/></button>
                <button type="button" onClick={() => executeCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Align Right"><AlignRight size={16}/></button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition" title="Bullet List"><List size={16}/></button>
            </div>

            {/* Area Mengetik */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                className="p-5 min-h-[500px] outline-none prose max-w-none text-gray-800 bg-white leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
            />
        </div>
    );
}