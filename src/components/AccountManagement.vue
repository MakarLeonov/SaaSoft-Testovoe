<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import { storeToRefs } from 'pinia';
import type { Account } from '@/types';

const accountsStore = useAccountsStore();
const { accounts } = storeToRefs(accountsStore);

const rules = {
  required: (value: string | undefined) => (value ? !!value.trim() : false) || 'Обязательное поле',
  maxLength: (max: number) => (value: string | undefined) => 
    (!value || (value.length <= max)) || `Максимум ${max} символов`,
};

const errors = ref<Record<string, string[]>>({});

const validateField = (field: keyof Account, value: string | null | undefined, index: number) => {
  const fieldErrors: string[] = [];
  
  if (field === 'login' && (!value || !value.trim())) {
    fieldErrors.push('Обязательное поле');
  }
  if (field === 'login' && value && value.length > 100) {
    fieldErrors.push('Максимум 100 символов');
  }
  if (field === 'password' && value && value.length > 100) {
    fieldErrors.push('Максимум 100 символов');
  }
  
  errors.value[`${field}_${index}`] = fieldErrors;
  return fieldErrors.length === 0;
};

const validateAccount = (account: Partial<Account>, index: number) => {
  const isValidLogin = validateField('login', account.login, index);
  const isValidPassword = account.type === 'Local' 
    ? validateField('password', account.password, index)
    : true;
  
  return isValidLogin && isValidPassword;
};

const addAccount = () => {
  const account: Account = {
    id: Date.now().toString(),
    labels: [],
    type: 'LDAP',
    login: undefined,
    password: null,
  };
  accountsStore.addAccount(account);
};

const removeAccount = (id: string) => {
  accountsStore.removeAccount(id);
};

const updateAccount = (index: number) => {
  const account = accounts.value[index];
  const login = account.login || '';
  const password = account.type === 'Local' ? (account.password || '') : null;
  if (validateAccount({ ...account, login, password } as Account, index)) {
    accountsStore.updateAccount({ ...account, login, password } as Account);
  }
};

const parseLabels = (value: string | undefined): { text: string }[] => {
  if (!value) return [];
  return value.split(';').filter(label => label.trim()).map(label => ({ text: label.trim() }));
};

watch(accounts, () => {
  errors.value = {};
}, { deep: true });
</script>

<template>
  <v-container>
    <v-row class="mb-2" align="center">
      <v-col>
        <h1 class="text-h4">Учетные записи</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="outlined" @click="addAccount" class="ml-4">
          <v-icon left>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col>
        <span class="text-body-2 grey--text bg-light-blue pa-2 width-fit">
          Для указания нескольких меток для одной учетной записи используйте разделитель ;
        </span>
      </v-col>
    </v-row>

    <v-row v-if="accounts.length" align="center">
      <v-col cols="3"><strong>Метка</strong></v-col>
      <v-col cols="2"><strong>Тип записи</strong></v-col>
      <v-col cols="3"><strong>Логин</strong></v-col>
      <v-col cols="2"><strong>Пароль</strong></v-col>
    </v-row>

    <v-row v-for="(account, index) in accounts" :key="account.id">
      <v-col cols="12">
          <v-row align="center">
            <v-col cols="3">
              <v-text-field
                v-model="account.labelsInput"
                :rules="[rules.required, rules.maxLength(50)]"
                :error-messages="errors[`labels_${index}`]"
                @blur="account.labels = parseLabels(account.labelsInput); updateAccount(index)"
                variant="outlined"
                density="compact"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-select
                v-model="account.type"
                :items="['LDAP', 'Local']"
                @change="account.password = account.type === 'LDAP' ? null : account.password; updateAccount(index)"
                :error-messages="errors[`type_${index}`]"
                variant="outlined"
                density="compact"
                hide-details
              ></v-select>
            </v-col>
            <v-col :cols="account.type === 'LDAP' ? 5 : 3">
              <v-text-field
                v-model="account.login"
                :rules="[rules.required, rules.maxLength(100)]"
                :error-messages="errors[`login_${index}`]"
                @blur="updateAccount(index)"
                variant="outlined"
                density="compact"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="2" v-if="account.type === 'Local'">
              <v-text-field
                v-model="account.password"
                type="password"
                :rules="[rules.required, rules.maxLength(100)]"
                :error-messages="errors[`password_${index}`]"
                @blur="updateAccount(index)"
                variant="outlined"
                density="compact"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="text-right">
              <v-btn icon variant="text" @click="removeAccount(account.id)" class="box-shadow: none">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>