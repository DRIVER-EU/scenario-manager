import { UserRole } from './user-role';

/** A real person involved in creating the scenario, e.g. a role player, writer, contact person. */
export interface IPerson {
  id: string;
  name: string;
  roles: UserRole[];
  email?: string;
  mobile?: string;
  phone?: string;
  notes?: string;
}
