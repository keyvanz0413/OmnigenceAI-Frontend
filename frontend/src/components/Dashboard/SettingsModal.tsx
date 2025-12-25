import React, { useState } from 'react';
import { Modal, Input, message, Button, Divider, Select, Badge } from 'antd';
import { useConfigStore } from '@/store/useConfigStore';
import { Key, Globe, TestTube, CheckCircle2, XCircle, Cpu } from 'lucide-react';
import OpenAI from 'openai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { openaiApiKey, apiBaseUrl, preferredModel, setOpenaiApiKey, setApiBaseUrl, setPreferredModel } = useConfigStore();
  const [tempKey, setTempKey] = useState(openaiApiKey);
  const [tempUrl, setTempUrl] = useState(apiBaseUrl);
  const [tempModel, setTempModel] = useState(preferredModel);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleSave = () => {
    setOpenaiApiKey(tempKey);
    setApiBaseUrl(tempUrl);
    setPreferredModel(tempModel);
    message.success('Settings saved successfully');
    onClose();
  };

  const testConnection = async () => {
    if (!tempKey) {
      message.error('Please enter an API Key first');
      return;
    }

    setIsTesting(true);
    const hide = message.loading('Testing connection and fetching models...', 0);

    try {
      const openai = new OpenAI({
        apiKey: tempKey,
        baseURL: tempUrl || 'https://api.openai.com/v1',
        dangerouslyAllowBrowser: true,
      });

      // 1. Fetch available models
      const modelsList = await openai.models.list();

      // 2. Filter or process models (optional: filter for vision models if preferred)
      const modelIds = modelsList.data
        .map(m => m.id)
        .sort((a, b) => a.localeCompare(b));

      setAvailableModels(modelIds);

      // If current selected model isn't in the new list, suggest the first gpt-4o or just use the first one
      if (modelIds.length > 0 && !modelIds.includes(tempModel)) {
        const defaultModel = modelIds.find(m => m.includes('gpt-4o')) || modelIds[0];
        setTempModel(defaultModel);
      }

      message.success({
        content: `Connection successful! Fetched ${modelIds.length} models.`,
        icon: <CheckCircle2 className="text-emerald-500 inline-block mr-2" size={18} />,
      });
    } catch (error: any) {
      console.error(error);
      message.error({
        content: `Connection failed: ${error.message || 'Unknown error'}`,
        icon: <XCircle className="text-rose-500 inline-block mr-2" size={18} />,
      });
    } finally {
      hide();
      setIsTesting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Globe className="text-blue-500" size={20} />
          <span>API Configuration</span>
        </div>
      }
      open={isOpen}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save Settings"
      cancelText="Cancel"
      width={550}
      footer={[
        <Button key="cancel" onClick={onClose} className="rounded-xl">Cancel</Button>,
        <Button
          key="test"
          loading={isTesting}
          onClick={testConnection}
          icon={<TestTube size={14} />}
          className="rounded-xl border-dashed"
        >
          Test & Fetch Models
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} className="rounded-xl bg-blue-600">
          Save Settings
        </Button>,
      ]}
    >
      <div className="space-y-6 py-4">
        {/* Base URL Section */}
        <section>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Globe className="text-blue-500" size={16} />
            API Base URL
          </label>
          <Input
            placeholder="https://api.openai.com/v1"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            className="rounded-xl py-2.5 bg-slate-50/50"
          />
        </section>

        {/* API Key Section */}
        <section>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Key className="text-amber-500" size={16} />
            API Key
          </label>
          <Input.Password
            placeholder="sk-..."
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            className="rounded-xl py-2.5 bg-slate-50/50"
          />
        </section>

        <Divider className="my-2" />

        {/* Model Selection Section */}
        <section className={`transition-opacity duration-300 ${availableModels.length > 0 ? 'opacity-100' : 'opacity-50'}`}>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="text-indigo-500" size={16} />
              Preferred AI Model
            </div>
            {availableModels.length > 0 && (
              <Badge status="success" text={`${availableModels.length} models available`} className="text-[10px]" />
            )}
          </label>

          <Select
            className="w-full h-11"
            placeholder={availableModels.length > 0 ? "Select a model" : "Test API to load models"}
            disabled={availableModels.length === 0}
            value={tempModel}
            onChange={(val) => setTempModel(val)}
            showSearch
            options={availableModels.map(m => ({ label: m, value: m }))}
            dropdownStyle={{ borderRadius: '12px' }}
          />
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {availableModels.length > 0
              ? "Select which model you want to use for document analysis. GPT-4o is recommended for vision tasks."
              : "Click 'Test & Fetch Models' above to see the models available with your current API key."}
          </p>
        </section>
      </div>
    </Modal>
  );
};
