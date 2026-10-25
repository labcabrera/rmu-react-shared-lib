import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../data/api-error';
import { characterPreview, errorsPreview, factionFilePreview, importResult } from '../test/fixtures/import';
import { renderWithProviders } from '../test/render';
import ImportDialog from './ImportDialog';

const jsonFile = (content: string, name = 'character.rmu.json') => new File([content], name, { type: 'application/json' });

const setup = (onPreview = vi.fn().mockResolvedValue(characterPreview), onImport = vi.fn().mockResolvedValue(importResult)) => {
  const onImported = vi.fn();
  renderWithProviders(
    <ImportDialog
      open
      title="import-character"
      onPreview={onPreview}
      onImport={onImport}
      onImported={onImported}
      onClose={vi.fn()}
    />
  );
  return { onPreview, onImport, onImported };
};

const choose = async (file: File) => {
  await userEvent.upload(screen.getByTestId('import-file-input'), file);
};

describe('ImportDialog', () => {
  it('previews the chosen file and imports it on confirm', async () => {
    const { onPreview, onImport, onImported } = setup();
    expect(screen.getByRole('button', { name: 'import' })).toBeDisabled();

    await choose(jsonFile('{"format":"rmu-strategic-export"}'));
    expect(await screen.findByText('Kaelith')).toBeInTheDocument();
    expect(onPreview).toHaveBeenCalledWith({
      file: { format: 'rmu-strategic-export' },
      fileName: 'character.rmu.json',
      characterRef: undefined,
    });

    await userEvent.click(screen.getByRole('button', { name: 'import' }));
    await waitFor(() => expect(onImported).toHaveBeenCalledWith(importResult));
    expect(onImport).toHaveBeenCalledWith(expect.objectContaining({ characterRef: 'c1' }));
  });

  it('warns about a file that is not JSON without calling the API', async () => {
    const { onPreview } = setup();
    await choose(jsonFile('not json'));
    expect(await screen.findByText('import-not-json')).toBeInTheDocument();
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('accepts a dropped file', async () => {
    const { onPreview } = setup();
    fireEvent.drop(screen.getByTestId('import-drop-zone'), { dataTransfer: { files: [jsonFile('{}')] } });
    await waitFor(() => expect(onPreview).toHaveBeenCalled());
  });

  it('keeps the import disabled while the preview has errors, grouped by code', async () => {
    setup(vi.fn().mockResolvedValue(errorsPreview));
    await choose(jsonFile('{}'));
    expect(await screen.findByText('export-missing-reference (1)')).toBeInTheDocument();
    expect(screen.getByText('race-x')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'import' })).toBeDisabled();
  });

  it('shows the translated error and the issues of an invalid file', async () => {
    const body = JSON.stringify({
      code: 'export-invalid-file',
      message: 'The file is not valid',
      details: { issues: [{ path: 'data.character.name', message: 'is required' }] },
    });
    setup(vi.fn().mockRejectedValue(new ApiError(400, 'Bad Request', body, '/x')));
    await choose(jsonFile('{}'));
    expect(await screen.findByText('err-export-invalid-file')).toBeInTheDocument();
    expect(screen.getByText('data.character.name: is required')).toBeInTheDocument();
  });

  it('asks again for the preview with the character chosen from a faction file', async () => {
    const onPreview = vi
      .fn()
      .mockResolvedValueOnce(factionFilePreview)
      .mockResolvedValueOnce({ ...factionFilePreview, characterRef: 'c2', errors: [] });
    setup(onPreview);
    await choose(jsonFile('{}', 'faction.rmu.json'));
    expect(await screen.findByText('export-character-ref-required (1)')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('import-choose-character'));
    await userEvent.click(await screen.findByRole('option', { name: /Doran/ }));
    await waitFor(() => expect(onPreview).toHaveBeenLastCalledWith(expect.objectContaining({ characterRef: 'c2' })));
    await waitFor(() => expect(screen.getByRole('button', { name: 'import' })).toBeEnabled());
  });
});
