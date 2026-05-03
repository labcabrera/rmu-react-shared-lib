export interface Npc {
  id: string;
  realmId: string;
  category: string;
  outlookType: string;
  name: string;
  level: number;
  hp: number;
  db: number;
  at: number;
  initiative: number;
  endurance: number;
  skills: NpcSkill[];
  items: NpcItem[];
  attacks: NpcAttack[];
  description: string;
  imageUrl?: string;
  owner: string;
}

export type CreateNpcDto = Omit<Npc, 'id' | 'owner'>;

export type UpdateNpcDto = Partial<Omit<CreateNpcDto, 'id' | 'realmId' | 'owner'>>;

export interface NpcSkill {
  skillId: string;
  ranks: number | undefined;
  bonus: number;
}

export interface NpcItem {
  name: string;
  itemTypeId: string;
  amount: number;
}

export interface NpcAttack {
  attackName: string;
  attackTable: string;
  attackType: string;
  fumbleTable: string;
  attackSize: number;
  bo: number;
  fumble: number;
}

export interface AddNpcSkill {
  skillId: string;
  ranks: number | undefined;
  bonus: number;
}

export interface AddNpcAttack {
  attackName: string;
  attackTable: string;
  attackType: string;
  fumbleTable: string;
  attackSize: number;
  bo: number;
  fumble: number;
}
