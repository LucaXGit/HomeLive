import {
  Household,
} from '../../domain/entities';

import {
  CreateHouseholdData,
  HouseholdRepository,
} from '../../domain/repositories/HouseholdRepository';

import {
  getDatabase,
} from '../local/database';

import {
  enqueueSyncOperation,
} from '../local/syncQueue';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

interface HouseholdRow {
  id: string;
  name: string;
  owner_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  sync_status: string;
}

interface HouseholdMemberRow {
  user_id: string;
}

export class LocalHouseholdRepository
  implements HouseholdRepository
{
  private async rowToHousehold(
    row: HouseholdRow
  ): Promise<Household> {
    const db = await getDatabase();

    const members =
      await db.getAllAsync<HouseholdMemberRow>(
        `
          SELECT user_id
          FROM household_members
          WHERE household_id = ?
        `,
        row.id
      );

    const memberIds =
      members.map(
        (member) => member.user_id
      );

    if (
      row.owner_id &&
      !memberIds.includes(row.owner_id)
    ) {
      memberIds.unshift(
        row.owner_id
      );
    }

    return {
      id: row.id,
      name: row.name,
      ownerId:
        row.owner_id ?? '',
      memberIds,
      createdAt:
        row.created_at ??
        new Date().toISOString(),
      updatedAt:
        row.updated_at ??
        new Date().toISOString(),
    };
  }

  async create(
    data: CreateHouseholdData
  ): Promise<Household> {
    const db = await getDatabase();

    const existing =
      await this.findByUserId(
        data.ownerId
      );

    if (existing) {
      throw new Error(
        'El usuario ya pertenece a un hogar.'
      );
    }

    const now =
      new Date().toISOString();

    const household: Household = {
      id: generateId(),
      name: data.name.trim(),
      ownerId: data.ownerId,
      memberIds: [
        data.ownerId,
      ],
      createdAt: now,
      updatedAt: now,
    };

    await db.withTransactionAsync(
      async () => {
        await db.runAsync(
          `
            INSERT INTO households (
              id,
              name,
              owner_id,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (
              ?, ?, ?, ?, ?, ?
            )
          `,
          household.id,
          household.name,
          household.ownerId,
          household.createdAt,
          household.updatedAt,
          'pending'
        );

        await db.runAsync(
          `
            INSERT INTO household_members (
              household_id,
              user_id,
              created_at
            )
            VALUES (?, ?, ?)
          `,
          household.id,
          household.ownerId,
          now
        );

        await enqueueSyncOperation(
          'household',
          household.id,
          'create',
          household
        );
      }
    );

    return household;
  }

  async findByUserId(
    userId: string
  ): Promise<Household | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<HouseholdRow>(
        `
          SELECT h.*
          FROM households h
          LEFT JOIN household_members hm
            ON hm.household_id = h.id
          WHERE
            hm.user_id = ?
            OR h.owner_id = ?
          LIMIT 1
        `,
        userId,
        userId
      );

    if (!row) {
      return null;
    }

    return this.rowToHousehold(
      row
    );
  }

  async findById(
    id: string
  ): Promise<Household | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<HouseholdRow>(
        `
          SELECT *
          FROM households
          WHERE id = ?
        `,
        id
      );

    if (!row) {
      return null;
    }

    return this.rowToHousehold(
      row
    );
  }
}