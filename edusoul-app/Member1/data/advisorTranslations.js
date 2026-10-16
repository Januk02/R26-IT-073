import { useLanguage } from '../../src/contexts/LanguageContext';
import { translateAdvisor } from './advisorLocale';
export { advisorMessages, translateAdvisor } from './advisorLocale';

export function useAdvisorTranslation() {
  const { language } = useLanguage();
  return (text) => translateAdvisor(text, language);
}
