export interface Account {
  id: string;
  labels: { text: string }[];
  type: 'LDAP' | 'Local';
  login: string | undefined;
  password: string | null | undefined;
  labelsInput?: string | undefined;
}