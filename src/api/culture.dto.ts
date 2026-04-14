import { assetsBaseUrl } from '../config/config.service';
import { StatKey } from './character.dto';
import { AccessType, NamedEntity } from './common.dto';

export type Culture = {
  id: string;
  name: string;
  description: string | undefined;
  imageUrl: string | undefined;
  accessType: AccessType;
};

export type CreateCultureDto = Omit<Culture, 'id'>;

export type UpdateCultureDto = Partial<Omit<CreateCultureDto, 'id'>>;
