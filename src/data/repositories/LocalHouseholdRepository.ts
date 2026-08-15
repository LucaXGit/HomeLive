import { Household } from '../../domain/entities';

import {
  CreateHouseholdData,
  HouseholdRepository,
} from '../../domain/repositories/HouseholdRepository';

import {
  getStoredHouseholds,
  saveStoredHouseholds,
} from '../local/householdStorage';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class LocalHouseholdRepository
  implements HouseholdRepository
{
  async create(
    data: CreateHouseholdData
  ): Promise<Household> {
    const households = await getStoredHouseholds();

    const existingHousehold = households.find(
      (household) =>
        household.ownerId === data.ownerId ||
        household.memberIds.includes(data.ownerId)
    );

    if (existingHousehold) {
      throw new Error(
        'El usuario ya pertenece a un hogar.'
      );
    }

    const now = new Date().toISOString();

    const household: Household = {
      id: generateId(),
      name: data.name.trim(),
      ownerId: data.ownerId,
      memberIds: [data.ownerId],
      createdAt: now,
      updatedAt: now,
    };

    await saveStoredHouseholds([
      ...households,
      household,
    ]);

    return household;
  }

  async findByUserId(
    userId: string
  ): Promise<Household | null> {
    const households = await getStoredHouseholds();

    return (
      households.find((household) =>
        household.memberIds.includes(userId)
      ) ?? null
    );
  }

  async findById(
    id: string
  ): Promise<Household | null> {
    const households = await getStoredHouseholds();

    return (
      households.find(
        (household) => household.id === id
      ) ?? null
    );
  }
}