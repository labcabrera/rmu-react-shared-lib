import { ItemArmor, ItemInfo, ItemShield, ItemWeapon } from './item.dto';

export type StrategicItem = {
  id: string;
  gameId: string;
  factionId: string | null;
  characterId: string | null;
  itemTypeId: string;
  name: string;
  category: string;
  carried: boolean;
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;
  shield: ItemShield | null;
  amount: number;
  info: ItemInfo;
  owner: string;
};
