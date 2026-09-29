import { Entity, EntityType } from './Entity';

export interface PersonAttributes {
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  title?: string;
  avatar?: string;
  social?: Record<string, string>;
}

export class Person extends Entity {
  declare attributes: PersonAttributes;

  constructor(
    name: string,
    attributes: PersonAttributes = {}
  ) {
    super(name, EntityType.Person, undefined, attributes);
  }

  /**
   * Get email
   */
  getEmail(): string | undefined {
    return this.attributes.email;
  }

  /**
   * Set email
   */
  setEmail(email: string): void {
    this.update({ email });
  }

  /**
   * Get role
   */
  getRole(): string | undefined {
    return this.attributes.role;
  }

  /**
   * Set role
   */
  setRole(role: string): void {
    this.update({ role });
  }

  /**
   * Get title
   */
  getTitle(): string | undefined {
    return this.attributes.title;
  }

  /**
   * Set title
   */
  setTitle(title: string): void {
    this.update({ title });
  }

  /**
   * Get department
   */
  getDepartment(): string | undefined {
    return this.attributes.department;
  }

  /**
   * Set department
   */
  setDepartment(department: string): void {
    this.update({ department });
  }

  /**
   * Is manager?
   */
  isManager(): boolean {
    const role = this.getRole();
    return role ? ['manager', 'lead', 'director'].includes(role.toLowerCase()) : false;
  }
}
