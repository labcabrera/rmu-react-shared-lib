import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it } from 'vitest';
import { TABLES_NAMESPACE, useTableText } from './table-text';

/* Workspace spec 086. Invented texts. */

const Texts = ({ texts }: { texts: string[] }) => {
  const tableText = useTableText();
  return (
    <>
      {texts.map((text) => (
        <p key={text}>{tableText(text)}</p>
      ))}
    </>
  );
};

const withLanguage = async (lng: string) => {
  const i18n = i18next.createInstance();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    ns: ['common', TABLES_NAMESPACE],
    defaultNS: 'common',
    resources: {
      en: { common: {}, [TABLES_NAMESPACE]: {} },
      es: {
        common: {},
        [TABLES_NAMESPACE]: {
          'Strike glances off the shield.': 'El golpe resbala en el escudo.',
          'Foe stunned: 2 rounds. Ouch.': 'Enemigo aturdido: 2 asaltos. Ay.',
          'Empty translation.': '',
        },
      },
    },
  });
  return i18n;
};

const renderTexts = async (lng: string, texts: string[]) =>
  render(
    <I18nextProvider i18n={await withLanguage(lng)}>
      <Texts texts={texts} />
    </I18nextProvider>
  );

describe('useTableText', () => {
  it('translates a text by its English literal', async () => {
    await renderTexts('es', ['Strike glances off the shield.']);
    expect(screen.getByText('El golpe resbala en el escudo.')).toBeInTheDocument();
  });

  it("keeps '.' and ':' as text, not as key or namespace separators", async () => {
    await renderTexts('es', ['Foe stunned: 2 rounds. Ouch.']);
    expect(screen.getByText('Enemigo aturdido: 2 asaltos. Ay.')).toBeInTheDocument();
  });

  it('shows the English text when there is no translation, or it is empty', async () => {
    await renderTexts('es', ['Not translated: yet.', 'Empty translation.']);
    expect(screen.getByText('Not translated: yet.')).toBeInTheDocument();
    expect(screen.getByText('Empty translation.')).toBeInTheDocument();
  });

  it('shows the English text in English', async () => {
    await renderTexts('en', ['Strike glances off the shield.']);
    expect(screen.getByText('Strike glances off the shield.')).toBeInTheDocument();
  });
});
