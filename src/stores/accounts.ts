import { defineStore } from 'pinia';

  export interface Account {
    id: string;
    labels: { text: string }[];
    type: 'LDAP' | 'Local';
    login: string | undefined;
    password: string | null | undefined;
    labelsInput?: string | undefined;
  }

  export const useAccountsStore = defineStore('accounts', {
    state: () => ({
      accounts: [] as Account[],
    }),
    actions: {
      addAccount(account: Account) {
        this.accounts.push(account);
      },
      removeAccount(id: string) {
        this.accounts = this.accounts.filter(account => account.id !== id);
      },
      updateAccount(updatedAccount: Account) {
        const index = this.accounts.findIndex(account => account.id === updatedAccount.id);
        if (index !== -1) {
          this.accounts[index] = { ...updatedAccount };
        }
      },
    },
    persist: true,
  });