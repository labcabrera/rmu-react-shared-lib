import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it } from 'vitest';
import { SKILL_TEXT_NAMESPACE, useSkillText } from './skill-text';

/* Workspace spec 090. Invented texts. */

const renderIn = async (lng: string, element: React.ReactElement) => {
  const i18n = i18next.createInstance();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    ns: ['common', SKILL_TEXT_NAMESPACE],
    defaultNS: 'common',
    resources: {
      en: { common: {}, [SKILL_TEXT_NAMESPACE]: { juggling: 'Keeps things in the air.\nTakes a while.' } },
      es: {
        common: { napping: 'Siesta' },
        [SKILL_TEXT_NAMESPACE]: { juggling: 'Mantiene cosas en el aire.\nLleva un rato.' },
      },
    },
  });
  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
};

const Probe = ({ id }: { id: string }) => {
  const text = useSkillText();
  return <p>{`${text.description(id)}|${text.summary(id)}`}</p>;
};

describe('useSkillText', () => {
  it('gives the description and its first paragraph in the current language', async () => {
    await renderIn('es', <Probe id="juggling" />);
    expect(screen.getByText((content) => content.endsWith('Lleva un rato.|Mantiene cosas en el aire.'))).toBeTruthy();
  });

  it('uses the text of the skill for a specialized id', async () => {
    await renderIn('en', <Probe id="juggling@clubs" />);
    expect(screen.getByText((content) => content.endsWith('|Keeps things in the air.'))).toBeTruthy();
  });

  it('is empty without text, even if the id matches a key of another namespace', async () => {
    const { container } = await renderIn('es', <Probe id="napping" />);
    expect(container.textContent).toBe('|');
  });
});
