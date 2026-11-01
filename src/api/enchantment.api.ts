import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl, apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import {
  AlchemyTables,
  CompleteEnchantmentResult,
  CreateEnchantmentDto,
  EnchantmentPlan,
  EnchantmentProject,
  EnchantmentRequest,
  UpdateEnchantmentDto,
} from './enchantment.dto';

// Enchantment projects of rmu-api-strategic and the alchemy tables of rmu-api-core (workspace spec 064).

const send = <T>(auth: AuthContextProps, path: string, method: string, body?: object): Promise<T> =>
  callApi(auth, `${apiStrategicGameUrl}/enchantments${path}`, {
    method,
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });

/** Failure tables and power level multipliers. */
export const fetchAlchemyTables = (auth: AuthContextProps): Promise<AlchemyTables> =>
  callApi(auth, `${apiCoreUrl}/alchemy-tables`, { method: 'GET' });

/** Days, PP, costs and SCR modifiers of an enchantment, without rolling or paying. */
export const quoteEnchantment = (dto: EnchantmentRequest, auth: AuthContextProps): Promise<EnchantmentPlan> =>
  send(auth, '/quote', 'POST', dto);

/** Starts a project: rolls the SCRs and charges the materials to the payer. */
export const createEnchantment = (dto: CreateEnchantmentDto, auth: AuthContextProps): Promise<EnchantmentProject> =>
  send(auth, '', 'POST', dto);

/** Projects matching an RSQL filter (`gameId==`, `alchemistId==`, `itemId==`, `status==`). */
export const fetchEnchantments = (
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<EnchantmentProject>> =>
  callApi(auth, `${apiStrategicGameUrl}/enchantments?q=${encodeURIComponent(rsql)}&page=${page}&size=${size}`, {
    method: 'GET',
  });

export const fetchEnchantment = (id: string, auth: AuthContextProps): Promise<EnchantmentProject> =>
  send(auth, `/${encodeURIComponent(id)}`, 'GET');

/** The failure rolls of the failed SCRs, by spell id. */
export const sendEnchantmentFailureRolls = (
  id: string,
  rolls: Record<string, number>,
  auth: AuthContextProps
): Promise<EnchantmentProject> => send(auth, `/${encodeURIComponent(id)}/failure-rolls`, 'POST', { rolls });

export const progressEnchantment = (id: string, days: number, auth: AuthContextProps): Promise<EnchantmentProject> =>
  send(auth, `/${encodeURIComponent(id)}/progress`, 'POST', { days });

export const suspendEnchantment = (id: string, auth: AuthContextProps): Promise<EnchantmentProject> =>
  send(auth, `/${encodeURIComponent(id)}/suspend`, 'POST');

export const resumeEnchantment = (id: string, auth: AuthContextProps): Promise<EnchantmentProject> =>
  send(auth, `/${encodeURIComponent(id)}/resume`, 'POST');

/** Extra days, extra cost (charged to the payer) and notes. */
export const updateEnchantment = (
  id: string,
  dto: UpdateEnchantmentDto,
  auth: AuthContextProps
): Promise<EnchantmentProject> => send(auth, `/${encodeURIComponent(id)}`, 'PATCH', dto);

/** Finishes a project: the item gets its enchantment, modifiers and value. */
export const completeEnchantment = (id: string, auth: AuthContextProps): Promise<CompleteEnchantmentResult> =>
  send(auth, `/${encodeURIComponent(id)}/complete`, 'POST');

/** Cancels a project and refunds the materials of the days not worked. */
export const cancelEnchantment = (id: string, auth: AuthContextProps): Promise<EnchantmentProject> =>
  send(auth, `/${encodeURIComponent(id)}/cancel`, 'POST');

/** Deletes a completed or cancelled project. */
export const deleteEnchantment = (id: string, auth: AuthContextProps): Promise<void> =>
  send(auth, `/${encodeURIComponent(id)}`, 'DELETE');
