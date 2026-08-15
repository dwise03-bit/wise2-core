import { Entity, EntityType } from './Entity';

export interface OrganizationAttributes {
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  founded?: Date;
  website?: string;
  logo?: string;
  headquarters?: string;
  employees?: number;
}

export class Organization extends Entity {
  declare attributes: OrganizationAttributes;

  constructor(
    name: string,
    attributes: OrganizationAttributes = {}
  ) {
    super(name, EntityType.Organization, undefined, attributes);
  }

  /**
   * Get industry
   */
  getIndustry(): string | undefined {
    return this.attributes.industry;
  }

  /**
   * Set industry
   */
  setIndustry(industry: string): void {
    this.update({ industry });
  }

  /**
   * Get organization size
   */
  getSize(): string | undefined {
    return this.attributes.size;
  }

  /**
   * Set organization size
   */
  setSize(size: OrganizationAttributes['size']): void {
    this.update({ size });
  }

  /**
   * Get employee count
   */
  getEmployeeCount(): number | undefined {
    return this.attributes.employees;
  }

  /**
   * Set employee count
   */
  setEmployeeCount(employees: number): void {
    this.update({ employees });
  }

  /**
   * Get website
   */
  getWebsite(): string | undefined {
    return this.attributes.website;
  }

  /**
   * Set website
   */
  setWebsite(website: string): void {
    this.update({ website });
  }

  /**
   * Is enterprise?
   */
  isEnterprise(): boolean {
    return this.getSize() === 'enterprise' || (this.getEmployeeCount() || 0) > 1000;
  }
}
