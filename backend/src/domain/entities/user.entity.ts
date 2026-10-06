import { Email } from "../value-objects/email.vo";
import { Username } from "../value-objects/username.vo";

export interface UserProps {
  id: string;
  name: Username;
  age: number;
  email: Email;
  pinHash: string;
  avatarUrl: string | null;
  isOnline: boolean;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad principal de Usuario en el dominio WordHive.
 * SSoT: Encapsula el ciclo de vida del jugador y su estado de invitacion.
 */
export class User {
  private readonly _id: string;
  private _name: Username;
  private readonly _age: number;
  private _email: Email;
  private _pinHash: string;
  private _avatarUrl: string | null;
  private _isOnline: boolean;
  private _isGuest: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._age = props.age;
    this._email = props.email;
    this._pinHash = props.pinHash;
    this._avatarUrl = props.avatarUrl;
    this._isOnline = props.isOnline;
    this._isGuest = props.isGuest;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public get id(): string { return this._id; }
  public get name(): Username { return this._name; }
  public get age(): number { return this._age; }
  public get email(): Email { return this._email; }
  public get pinHash(): string { return this._pinHash; }
  public get avatarUrl(): string | null { return this._avatarUrl; }
  public get isOnline(): boolean { return this._isOnline; }
  public get isGuest(): boolean { return this._isGuest; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  public updateProfile(name: Username, avatarUrl: string | null): void {
    this._name = name;
    this._avatarUrl = avatarUrl;
    this._updatedAt = new Date();
  }

  public updatePinHash(newPinHash: string): void {
    this._pinHash = newPinHash;
    this._updatedAt = new Date();
  }

  public upgradeFromGuest(name: Username, email: Email, pinHash: string): void {
    this._name = name;
    this._email = email;
    this._pinHash = pinHash;
    this._isGuest = false;
    this._updatedAt = new Date();
  }

  public setOnlineStatus(online: boolean): void {
    this._isOnline = online;
    this._updatedAt = new Date();
  }
}
