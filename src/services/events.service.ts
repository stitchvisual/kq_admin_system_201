import { eventsRepository } from "@/repositories/events.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { NewEvent } from "@/db/schema/events";

export const eventsService = {
  async list(options?: {
    search?: string;
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
    upcomingOnly?: boolean;
  }) {
    return eventsRepository.findAll(options);
  },

  async count(options?: { search?: string; publishedOnly?: boolean }) {
    return eventsRepository.count(options);
  },

  async getById(id: string) {
    const event = await eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundError("Event", id);
    }
    return event;
  },

  async create(data: NewEvent) {
    // Validation
    if (!data.title?.trim()) {
      throw new ValidationError("Title is required");
    }
    if (!data.description?.trim()) {
      throw new ValidationError("Description is required");
    }
    if (!data.event_date) {
      throw new ValidationError("Event date is required");
    }
    if (!data.time?.trim()) {
      throw new ValidationError("Time is required");
    }
    if (!data.location?.trim()) {
      throw new ValidationError("Location is required");
    }

    return eventsRepository.create({
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      tag: data.tag || 'Community',
      time: data.time.trim(),
      location: data.location.trim(),
      image_url: data.image_url?.trim() || null,
    });
  },

  async update(id: string, data: Partial<NewEvent>) {
    // Verify event exists
    const existing = await eventsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Event", id);
    }

    // Validate title if provided
    if (data.title !== undefined && !data.title?.trim()) {
      throw new ValidationError("Title cannot be empty");
    }

    return eventsRepository.update(id, {
      ...data,
      title: data.title?.trim(),
      description: data.description?.trim(),
      time: data.time?.trim(),
      location: data.location?.trim(),
      image_url: data.image_url?.trim(),
    });
  },

  async delete(id: string) {
    // Verify event exists
    const existing = await eventsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Event", id);
    }

    await eventsRepository.softDelete(id);
    return { success: true };
  },

  async getPublishedUpcoming(limit: number = 10) {
    return eventsRepository.getPublishedUpcoming(limit);
  },

  async getPublishedForHome(limit: number = 6) {
    return eventsRepository.getPublishedForHome(limit);
  },
};