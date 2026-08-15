import { Household } from '../entities';

export interface CreateHouseholdData {
  name: string;
  ownerId: string;
}

export interface HouseholdRepository {
  create(data: CreateHouseholdData): Promise<Household>;
  findByUserId(userId: string): Promise<Household | null>;
  findById(id: string): Promise<Household | null>;
}