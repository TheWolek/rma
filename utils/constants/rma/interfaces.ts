export interface updateTicket_reqBodyI {
  email: string;
  name: string;
  phone: string;
  type: string;
  deviceSn: string;
  deviceAccessories: Array<number>;
  issue: string;
  lines: string;
  postCode: string;
  city: string;
  damage_type: string;
  damage_description: string | null;
}
