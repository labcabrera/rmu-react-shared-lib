// Read through window.__RMU_CONFIG__ at runtime: each MFE's webpack DefinePlugin rewrites these
// process.env references (see public/env-config.template.js in the MFE repos).
export const assetsBaseUrl = process.env.RMU_MFE_ASSETS_URI;
export const apiCoreUrl = process.env.RMU_API_CORE_URI;
export const apiStrategicGameUrl = process.env.RMU_API_STRATEGIC_URI;
export const apiTacticalUrl = process.env.RMU_API_TACTICAL_URI;
export const apiItemsUrl = process.env.RMU_API_ITEMS_URI;
export const apiAttackTablesUrl = process.env.RMU_API_ATTACK_TABLES_URI;
export const apiNpcUrl = process.env.RMU_API_NPCS_URI!;
export const apiSpellsUrl = process.env.RMU_API_SPELLS_URI!;
export const mediaApiBaseUrl = process.env.RMU_API_MEDIA_URI!;

//deprecated
export const imageBaseUrl = process.env.RMU_MFE_ASSETS_URI;
