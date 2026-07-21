import { Entity, EntityType } from './Entity';

export interface MeetingAttributes {
  startTime?: Date;
  endTime?: Date;
  attendees?: string[];
  location?: string;
  notes?: string;
  decisions?: string[];
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export class Meeting extends Entity {
  declare attributes: MeetingAttributes;

  constructor(name: string, attributes: MeetingAttributes = {}) {
    super(name, EntityType.Meeting, undefined, attributes);
  }

  getStartTime(): Date | undefined {
    return this.attributes.startTime;
  }

  getEndTime(): Date | undefined {
    return this.attributes.endTime;
  }

  getAttendees(): string[] {
    return this.attributes.attendees || [];
  }

  addAttendee(attendeeId: string): void {
    const attendees = this.getAttendees();
    if (!attendees.includes(attendeeId)) {
      this.update({ attendees: [...attendees, attendeeId] });
    }
  }

  getNotes(): string | undefined {
    return this.attributes.notes;
  }

  setNotes(notes: string): void {
    this.update({ notes });
  }

  getDecisions(): string[] {
    return this.attributes.decisions || [];
  }

  addDecision(decision: string): void {
    const decisions = this.getDecisions();
    this.update({ decisions: [...decisions, decision] });
  }
}
