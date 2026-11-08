import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it } from 'vitest';
import {
  SPELL_NAME_MATCHES_MAX,
  SPELL_NAMES_NAMESPACE,
  spellNameRsql,
  spellTextNamespace,
  useSpellName,
  useSpellNameMatches,
  useSpellText,
} from './spell-text';

/* Workspace spec 088. Invented texts. */

const LIST = spellTextNamespace('test-list');

const withLanguage = async (lng: string) => {
  const i18n = i18next.createInstance();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    ns: ['common', SPELL_NAMES_NAMESPACE, LIST],
    defaultNS: 'common',
    fallbackNS: ['common'],
    resources: {
      en: { common: { description: 'Description' }, [SPELL_NAMES_NAMESPACE]: {}, [LIST]: {} },
      es: {
        common: { description: 'Descripción', 'level-2': 'Nivel 2', Gleam: 'No es un hechizo' },
        [SPELL_NAMES_NAMESPACE]: { 'Med. Gleam I': 'Destello med. I', 'Great Spark': 'Gran chispa' },
        [LIST]: { 'level-1': 'Un destello.' },
      },
    },
  });
  return i18n;
};

const Probe = ({ children }: { children: () => string }) => <p>{children()}</p>;

const Names = ({ names }: { names: string[] }) => {
  const spellName = useSpellName();
  return <Probe>{() => names.map(spellName).join('|')}</Probe>;
};

const Texts = ({ code }: { code: string | null }) => {
  const text = useSpellText(code);
  return (
    <Probe>{() => [text.spell(1, 'A gleam.'), text.spell(2, 'A spark.'), text.list('The list.')].join('|')}</Probe>
  );
};

const Matches = ({ query }: { query: string }) => {
  const matches = useSpellNameMatches();
  return <Probe>{() => matches(query).join('|') || 'none'}</Probe>;
};

const renderIn = async (lng: string, element: React.ReactElement) =>
  render(<I18nextProvider i18n={await withLanguage(lng)}>{element}</I18nextProvider>);

describe('useSpellName', () => {
  it('translates a name with a dot', async () => {
    await renderIn('es', <Names names={['Med. Gleam I']} />);
    expect(screen.getByText('Destello med. I')).toBeTruthy();
  });

  it('keeps a name without translation, even if it matches a key of another namespace', async () => {
    await renderIn('es', <Names names={['Own Spell', 'Gleam']} />);
    expect(screen.getByText('Own Spell|Gleam')).toBeTruthy();
  });

  it('shows the English name in English', async () => {
    await renderIn('en', <Names names={['Med. Gleam I']} />);
    expect(screen.getByText('Med. Gleam I')).toBeTruthy();
  });
});

describe('useSpellText', () => {
  it('translates the level it has and keeps the original of the others, never another namespace', async () => {
    await renderIn('es', <Texts code="test-list" />);
    expect(screen.getByText('Un destello.|A spark.|The list.')).toBeTruthy();
  });

  it('shows the originals for a list without code', async () => {
    await renderIn('es', <Texts code={null} />);
    expect(screen.getByText('A gleam.|A spark.|The list.')).toBeTruthy();
  });
});

describe('useSpellNameMatches', () => {
  it('finds the English names by the translation, ignoring accents and case', async () => {
    await renderIn('es', <Matches query="CHISPÁ" />);
    expect(screen.getByText('Great Spark')).toBeTruthy();
  });

  it('finds nothing in English', async () => {
    await renderIn('en', <Matches query="chispa" />);
    expect(screen.getByText('none')).toBeTruthy();
  });
});

describe('spellNameRsql', () => {
  it('searches the typed text alone when nothing matched', () => {
    expect(spellNameRsql('muro de', [])).toBe('name=re="muro de"');
  });

  it('adds the matched names in a group, quoted', () => {
    expect(spellNameRsql('chispa', ['Great Spark', "Heaven's Key"])).toBe(
      '(name=re="chispa",name=in=("Great Spark","Heaven\'s Key"))'
    );
  });

  it('caps the matched names', () => {
    const names = Array.from({ length: SPELL_NAME_MATCHES_MAX + 5 }, (_, index) => `Name ${index}`);
    expect(spellNameRsql('x', names).match(/"Name /g)).toHaveLength(SPELL_NAME_MATCHES_MAX);
  });
});
