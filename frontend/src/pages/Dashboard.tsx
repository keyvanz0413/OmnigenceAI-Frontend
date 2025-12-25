import React, { useRef, useState } from 'react';
import { Upload, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useConfigStore } from '@/store/useConfigStore';
import { useEditorStore } from '@/store/useEditorStore';
import { convertPdfToImage } from '@/utils/pdfLoader';
import { generateTemplateFromImage } from '@/utils/aiClient';

const Dashboard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { openaiApiKey, apiBaseUrl, preferredModel, isConfigured } = useConfigStore();
  const { setOriginalImage, setCurrentHtml } = useEditorStore();

  const handleUploadClick = () => {
    if (!isConfigured()) {
      message.error('Please configure your OpenAI API Key in Settings first.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);

    try {
      let imageUrl = '';

      // 1. Convert Task: PDF to Image or Image to Base64
      if (file.type === 'application/pdf') {
        message.loading({ content: 'Converting PDF to image...', key: 'process' });
        imageUrl = await convertPdfToImage(file);
      } else if (file.type.startsWith('image/')) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        throw new Error('Unsupported file type. Please use PDF or Images.');
      }

      setOriginalImage(imageUrl);

      // 2. AI Task: Send to GPT-4o
      message.loading({ content: 'AI is analyzing your document...', key: 'process' });
      const htmlTemplate = await generateTemplateFromImage(openaiApiKey, imageUrl, apiBaseUrl, preferredModel);

      setCurrentHtml(htmlTemplate);
      message.success({ content: 'Template generated successfully!', key: 'process' });

      // 3. Navigation to Editor
      navigate('/editor');

    } catch (error: any) {
      console.error(error);
      message.error({ content: error.message || 'Processing failed', key: 'process' });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight"
        >
          Transform Documents with <span className="text-blue-600">Omnigence AI</span>
        </motion.h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-64 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-slate-50/50 group hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/*"
              className="hidden"
            />

            {isProcessing ? (
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={40} />
                <p className="text-slate-600 font-medium">Processing your document...</p>
              </div>
            ) : (
              <button
                onClick={handleUploadClick}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <p className="text-slate-900 font-bold text-lg">Click to Upload</p>
                <p className="text-slate-500 text-sm mt-1">PDF or Images (Max 10MB)</p>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            Supported Workflows
          </h2>
          <div className="space-y-4">
            <FeatureItem title="Invoice Extractions" desc="Convert paper invoices to structured digital templates." />
            <FeatureItem title="Shipping Labels" desc="AI-mapped layouts for international logistics." />
            <FeatureItem title="Custom Forms" desc="Any document to editable HTML in seconds." />
          </div>
        </div>
      </div>

      {!isConfigured() && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0" size={24} />
          <div>
            <h3 className="text-amber-900 font-bold mb-1">OpenAI API Key Required</h3>
            <p className="text-amber-800 text-sm">
              To use AI document modeling, please enter your OpenAI API key in the <strong>Settings</strong> menu on the sidebar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
  </div>
);

import { motion } from 'framer-motion';

export default Dashboard;
