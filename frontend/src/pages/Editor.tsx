import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '@/store/useEditorStore';
import { Save, Eye, Code, ChevronLeft, Download, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export const EditorPage: React.FC = () => {
  const { currentHtml, setCurrentHtml } = useEditorStore();
  const [code, setCode] = useState(currentHtml);
  const [activeTab, setActiveTab] = useState<'html' | 'data'>('html');
  const [jsonData, setJsonData] = useState(JSON.stringify({
    customer_name: "Apple Inc.",
    shipping_address: "1 Infinite Loop, Cupertino, CA",
    invoice_no: "INV-2025-001",
    invoice_date: new Date().toLocaleDateString(),
    subtotal: "$1,247.00",
    total_amount: "$1,250.00",
    items: [
      { qty: 1, description: "iPhone 16 Pro", price: "$999.00", total: "$999.00" },
      { qty: 1, description: "Leather Case", price: "$59.00", total: "$59.00" },
      { qty: 2, description: "AirPods Pro", price: "$249.00", total: "$498.00" },
    ]
  }, null, 2));

  const navigate = useNavigate();

  useEffect(() => {
    setCode(currentHtml);
  }, [currentHtml]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ROW_SELECTED') {
        const rowIndex = event.data.rowIndex;
        convertRowToTemplate(rowIndex);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [code]);

  const convertRowToTemplate = (index: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const selectedRow = doc.querySelector(`[data-row-index="${index}"]`);

    if (!selectedRow) {
      message.error('Could not find selected row in code.');
      return;
    }

    const parent = selectedRow.parentElement;
    if (!parent) return;

    const templateContent = selectedRow.outerHTML;
    parent.innerHTML = `{{#each items}}\n    ${templateContent}\n    {{/each}}`;

    const newCode = doc.body.innerHTML;
    setCode(newCode);
    message.success('Converted row to dynamic template!');
  };

  const handleSave = () => {
    setCurrentHtml(code);
    message.success('Template saved locally');
  };

  const generatePreview = () => {
    let mockData: any = {};
    try {
      mockData = JSON.parse(jsonData);
    } catch (e) {
      return `<div style="color:red; padding:20px; font-family:sans-serif;">
                <h3 style="margin-top:0;">JSON Syntax Error</h3>
                <p>${(e as Error).message}</p>
              </div>`;
    }

    let previewHtml = code;

    // 1. Simple Handlebars loop simulation for {{#each items}}...{{/each}}
    const eachRegex = /{{#each items}}([\s\S]*?){{\/each}}/g;
    previewHtml = previewHtml.replace(eachRegex, (_, innerTemplate) => {
      if (!Array.isArray(mockData.items)) return '';
      return mockData.items.map((item: any) => {
        let row = innerTemplate;
        Object.keys(item).forEach(key => {
          row = row.replace(new RegExp(`{{(this\.)?${key}}}`, 'g'), item[key]);
        });
        return row;
      }).join('');
    });

    // 2. Simple variable replacement
    Object.keys(mockData).forEach(key => {
      if (key !== 'items') {
        previewHtml = previewHtml.replace(new RegExp(`{{${key}}}`, 'g'), mockData[key]);
      }
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            body { background: white; min-height: 100vh; padding: 40px; cursor: default; font-family: sans-serif; }
            [data-row-index] { cursor: pointer; transition: all 0.2s; position: relative; }
            [data-row-index]:hover { 
              background-color: rgba(59, 130, 246, 0.05) !important; 
              outline: 1.5px dashed #3b82f6;
              z-index: 10;
            }
            [data-row-index]:hover::after {
              content: 'Click to convert row to template loop';
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              background: #3b82f6;
              color: white;
              font-size: 10px;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 600;
              pointer-events: none;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            @page { size: A4; margin: 0; }
          </style>
        </head>
        <body>
          <div class="max-w-[800px] mx-auto bg-white">
            ${previewHtml}
          </div>
          <script>
            document.querySelectorAll('[data-row-index]').forEach(el => {
                el.addEventListener('click', (e) => {
                  e.stopPropagation();
                  window.parent.postMessage({ 
                    type: 'ROW_SELECTED', 
                    rowIndex: el.getAttribute('data-row-index') 
                  }, '*');
                });
              });
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-white font-bold leading-none mb-1">Design Studio</h1>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">AI Template Editor</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Save size={16} />
            Save Changes
          </button>
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10">
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor (Left) */}
        <section className="w-1/2 border-r border-white/5 flex flex-col bg-[#1e1e1e]">
          <div className="flex h-12 bg-black/20 items-center justify-between px-4 border-b border-white/5">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-2 text-[11px] font-bold transition-all relative py-3 ${activeTab === 'html' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Code size={14} />
                TEMPLATE HTML
                {activeTab === 'html' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2 text-[11px] font-bold transition-all relative py-3 ${activeTab === 'data' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Database size={14} />
                MOCK DATA (JSON)
                {activeTab === 'data' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'html' ? (
              <Editor
                height="100%"
                defaultLanguage="html"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  wordWrap: 'on',
                  padding: { top: 12 },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={jsonData}
                onChange={(val) => setJsonData(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  wordWrap: 'on',
                  padding: { top: 12 },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            )}
          </div>
        </section>

        {/* Preview (Right) */}
        <section className="w-1/2 flex flex-col bg-[#f5f5f7] relative">
          <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live Render Mode</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-400 font-medium">A4 Canvas • 210mm x 297mm</span>
            </div>
          </div>

          <div className="flex-1 p-12 overflow-auto flex justify-center scrollbar-hide">
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] origin-top mb-12">
              <iframe
                title="Preview"
                className="w-full h-full border-none"
                srcDoc={generatePreview()}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditorPage;
