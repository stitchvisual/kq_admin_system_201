import { clientsRepository } from "@/repositories/clients.repository";
import { NotFoundError, DuplicateError, ValidationError } from "@/lib/errors";
import type { NewClient } from "@/db/schema/clients";

export const clientsService = {
  async list(search?: string, page: number = 1, limit: number = 10) {
    return clientsRepository.findAll(search, page, limit);
  },

  async count(search?: string) {
    return clientsRepository.count(search);
  },

  async getById(id: string) {
    const client = await clientsRepository.findById(id);
    if (!client) {
      throw new NotFoundError("Client", id);
    }
    return client;
  },

  async create(data: NewClient) {
    // Validation: name and email required
    if (!data.name?.trim()) {
      throw new ValidationError("Name is required");
    }
    if (!data.email?.trim()) {
      throw new ValidationError("Email is required");
    }

    // Check for duplicate email
    const existing = await clientsRepository.findByEmail(data.email);
    if (existing) {
      throw new DuplicateError("Client", "email");
    }

    return clientsRepository.create({
      ...data,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      ndis_number: data.ndis_number?.trim() || null,
      address: data.address?.trim() || null,
      suburb: data.suburb?.trim() || null,
      weekday_code: data.weekday_code?.trim() || null,
      saturday_code: data.saturday_code?.trim() || null,
      sunday_code: data.sunday_code?.trim() || null,
    });
  },

  async update(id: string, data: Partial<NewClient>) {
    // Verify client exists
    const existing = await clientsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Client", id);
    }

    // Check email uniqueness if changing
    if (data.email && data.email !== existing.email) {
      const withEmail = await clientsRepository.findByEmail(data.email);
      if (withEmail) {
        throw new DuplicateError("Client", "email");
      }
    }

    // Validate name if provided
    if (data.name !== undefined && !data.name?.trim()) {
      throw new ValidationError("Name cannot be empty");
    }

    return clientsRepository.update(id, {
      ...data,
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      phone: data.phone?.trim(),
      ndis_number: data.ndis_number?.trim(),
      address: data.address?.trim(),
      suburb: data.suburb?.trim(),
      weekday_code: data.weekday_code?.trim(),
      saturday_code: data.saturday_code?.trim(),
      sunday_code: data.sunday_code?.trim(),
    });
  },

  async delete(id: string) {
    // Verify client exists
    const existing = await clientsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Client", id);
    }

    await clientsRepository.softDelete(id);
    return { success: true };
  },
};
