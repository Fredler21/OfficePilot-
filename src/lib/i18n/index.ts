export type SupportedLanguage = 'en' | 'fr' | 'ht';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  ht: 'Kreyòl Ayisyen',
};

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'app.name': 'OfficePilot',
    'app.tagline': 'Your AI Copilot for Microsoft Office',
    'mode.word': 'Word',
    'mode.excel': 'Excel',
    'mode.powerpoint': 'PowerPoint',
    'mode.access': 'Access',
    'chat.placeholder': 'Ask me anything about Word, Excel, PowerPoint, or Access...',
    'chat.send': 'Send',
    'action.preview': 'Preview Changes',
    'action.apply': 'Apply',
    'action.cancel': 'Cancel',
    'action.undo': 'Undo',
    'action.copy': 'Copy',
    'error.generic': 'Something went wrong. Please try again.',
    'error.fileparse': 'Could not parse the uploaded file.',
    'upload.prompt': 'Upload a file',
    'upload.supported': 'Supports .docx, .xlsx, .pptx',
    'learning.doforme': 'Do it for me',
    'learning.walkthrough': 'Walk me through it',
    'learning.beginner': 'Explain like I\'m a beginner',
    'learning.both': 'Show me answer and steps',
  },
  fr: {
    'app.name': 'OfficePilot',
    'app.tagline': 'Votre copilote IA pour Microsoft Office',
    'mode.word': 'Word',
    'mode.excel': 'Excel',
    'mode.powerpoint': 'PowerPoint',
    'mode.access': 'Access',
    'chat.placeholder': 'Posez-moi des questions sur Word, Excel, PowerPoint ou Access...',
    'chat.send': 'Envoyer',
    'action.preview': 'Aperçu des modifications',
    'action.apply': 'Appliquer',
    'action.cancel': 'Annuler',
    'action.undo': 'Annuler',
    'action.copy': 'Copier',
    'error.generic': 'Un problème est survenu. Veuillez réessayer.',
    'error.fileparse': 'Impossible de lire le fichier.',
    'upload.prompt': 'Télécharger un fichier',
    'upload.supported': 'Formats .docx, .xlsx, .pptx',
    'learning.doforme': 'Faites-le pour moi',
    'learning.walkthrough': 'Guidez-moi',
    'learning.beginner': 'Expliquez simplement',
    'learning.both': 'Montrez la réponse et les étapes',
  },
  ht: {
    'app.name': 'OfficePilot',
    'app.tagline': 'Asistan AI ou pou Microsoft Office',
    'mode.word': 'Word',
    'mode.excel': 'Excel',
    'mode.powerpoint': 'PowerPoint',
    'mode.access': 'Access',
    'chat.placeholder': 'Mande m nenpòt bagay sou Word, Excel, PowerPoint, oswa Access...',
    'chat.send': 'Voye',
    'action.preview': 'Gade chanjman yo',
    'action.apply': 'Aplike',
    'action.cancel': 'Anile',
    'action.undo': 'Defèt',
    'action.copy': 'Kopye',
    'error.generic': 'Gen yon pwoblèm. Tanpri eseye ankò.',
    'error.fileparse': 'Pa kapab li fichye a.',
    'upload.prompt': 'Telechaje yon fichye',
    'upload.supported': 'Fòma .docx, .xlsx, .pptx',
    'learning.doforme': 'Fè l pou mwen',
    'learning.walkthrough': 'Gide m',
    'learning.beginner': 'Eksplike senp',
    'learning.both': 'Montre repons ak etap yo',
  },
};

export function t(key: string, lang: SupportedLanguage = 'en'): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export function detectLanguage(text: string): SupportedLanguage {
  const lower = text.toLowerCase();
  const frWords = ['bonjour', 'merci', 'comment', "s'il", 'vous', 'est-ce', 'je', 'nous', 'pouvez'];
  const htWords = ['mwen', 'tanpri', 'kijan', 'èske', 'pou', 'yon', 'nan', 'kapab', 'ede'];

  const frScore = frWords.filter((w) => lower.includes(w)).length;
  const htScore = htWords.filter((w) => lower.includes(w)).length;

  if (htScore >= 2) return 'ht';
  if (frScore >= 2) return 'fr';
  return 'en';
}

export function getSystemLanguageDirective(lang: SupportedLanguage): string {
  switch (lang) {
    case 'fr':
      return 'Respond in French. Use clear, professional French.';
    case 'ht':
      return 'Respond in Haitian Creole (Kreyòl Ayisyen). Use natural, clear Kreyòl.';
    default:
      return 'Respond in English.';
  }
}
