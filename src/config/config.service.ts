// Read through window.__RMU_CONFIG__ at runtime: each MFE's webpack DefinePlugin rewrites these
// process.env references (see public/env-config.template.js in the MFE repos). Every key read here must
// be listed in each MFE's template, or the bundle keeps a bare `process.env` reference.
export const assetsBaseUrl: string = process.env.RMU_MFE_ASSETS_URI ?? '';
export const apiCoreUrl: string = process.env.RMU_API_CORE_URI ?? '';
export const apiStrategicGameUrl: string = process.env.RMU_API_STRATEGIC_URI ?? '';
export const apiTacticalUrl: string = process.env.RMU_API_TACTICAL_URI ?? '';
export const apiItemsUrl: string = process.env.RMU_API_ITEMS_URI ?? '';
export const apiAttackTablesUrl: string = process.env.RMU_API_ATTACK_TABLES_URI ?? '';
export const apiNpcUrl: string = process.env.RMU_API_NPCS_URI ?? '';
export const apiNpcNamesUrl: string = process.env.RMU_API_NPC_NAMES_URI ?? '';
export const apiSpellsUrl: string = process.env.RMU_API_SPELLS_URI ?? '';
export const mediaApiBaseUrl: string = process.env.RMU_API_MEDIA_URI ?? '';

/** @deprecated Use assetsBaseUrl, or resolveAssetUrl for stored image paths. */
export const imageBaseUrl: string = process.env.RMU_MFE_ASSETS_URI ?? '';
