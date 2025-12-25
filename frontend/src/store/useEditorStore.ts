import { create } from 'zustand';

interface EditorState {
  currentHtml: string;
  setCurrentHtml: (html: string) => void;
  originalImage: string;
  setOriginalImage: (image: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentHtml: '',
  setCurrentHtml: (html) => set({ currentHtml: html }),
  originalImage: '',
  setOriginalImage: (image) => set({ originalImage: image }),
}));
