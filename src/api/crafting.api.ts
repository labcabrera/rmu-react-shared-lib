import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl, apiStrategicGameUrl } from '../config/config.service';
import callApi from './api';
import { CraftingPlan, Material, QuoteCraftDto } from './crafting.dto';

// Crafting with quality (workspace spec 043): the superior materials of rmu-api-core and the plan of a craft of
// rmu-api-strategic.

export async function fetchMaterials(auth: AuthContextProps): Promise<Material[]> {
  return await callApi(auth, `${apiCoreUrl}/materials`, { method: 'GET' });
}

/** Cost, maneuver modifiers, hours and bonuses of a craft, without rolling or paying. */
export async function quoteCraft(dto: QuoteCraftDto, auth: AuthContextProps): Promise<CraftingPlan> {
  return await callApi(auth, `${apiStrategicGameUrl}/items/crafts/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}
