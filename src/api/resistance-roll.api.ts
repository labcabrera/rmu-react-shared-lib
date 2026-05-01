import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { ResistanceRollQuery, ResistanceRollResult } from './resistance-roll.dto';

export async function resistanceRoll(dto: ResistanceRollQuery, auth: AuthContextProps): Promise<ResistanceRollResult> {
  const url = `${apiCoreUrl}/resistance-rolls`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}
