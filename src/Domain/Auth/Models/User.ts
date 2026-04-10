import { v4 as uuid } from "uuid";

export interface UserProps {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(public readonly props: UserProps) {}

  get id() {
    return this.props.id;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get role() {
    return this.props.role;
  }
  get isActive() {
    return this.props.isActive;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(input: {
    tenantId: string;
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }): User {
    return new User({
      id: uuid(),
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? "member",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
