import { useEffect, useMemo, useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_BASE_URL = 'https://personal-finance-tracker-wrlj.onrender.com';

type TransactionType = 'receita' | 'despesa';
type RecurrenceType = 'once' | 'monthly';

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
  is_recurring: boolean;
  recurrence_type: string | null;
};

type TransactionForm = {
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
  recurrence: RecurrenceType;
};

const initialForm: TransactionForm = {
  title: '',
  amount: '',
  type: 'despesa',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  recurrence: 'once',
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<TransactionForm>(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === 'receita')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === 'despesa')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  useEffect(() => {
    loadTransactions();
  }, []);

  function updateForm<K extends keyof TransactionForm>(field: K, value: TransactionForm[K]) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(dateValue: string) {
    const [year, month, day] = dateValue.split('-');
    if (!year || !month || !day) return dateValue;
    return `${day}/${month}/${year}`;
  }

  function getTypeLabel(type: TransactionType) {
    return type === 'receita' ? 'Receita' : 'Despesa';
  }

  function getRecurrenceLabel(transaction: Transaction) {
    return transaction.is_recurring && transaction.recurrence_type === 'monthly' ? 'Mensal' : 'Única';
  }

  async function loadTransactions(keepMessages = false) {
    try {
      setLoading(true);
      if (!keepMessages) {
        setErrorMessage('');
        setSuccessMessage('');
      }

      console.log('Buscando transações mobile...');

      const response = await fetch(`${API_BASE_URL}/api/mobile/transactions`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const data = await response.json();

      console.log('Resposta das transações:', response.status, data);

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Não foi possível carregar as transações.');
      }

      setTransactions(data.transactions ?? []);
    } catch (error) {
      console.log('Erro ao carregar transações:', error);
      setErrorMessage('Não foi possível carregar as transações. Verifique se a API está online.');
    } finally {
      setLoading(false);
    }
  }

  async function createTransaction() {
    console.log('BOTAO SALVAR ACIONADO');

    if (saving) return;

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const title = form.title.trim();
      const category = form.category.trim();
      const description = form.description.trim();
      const normalizedAmount = form.amount.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
      const amount = Number(normalizedAmount);

      if (!title) {
        setErrorMessage('Preencha o título da transação.');
        return;
      }

      if (!form.amount.trim()) {
        setErrorMessage('Preencha o valor da transação.');
        return;
      }

      if (Number.isNaN(amount) || amount <= 0) {
        setErrorMessage('Digite um valor maior que zero. Exemplo: 18,50');
        return;
      }

      if (!category) {
        setErrorMessage('Preencha a categoria da transação.');
        return;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) {
        setErrorMessage('Digite a data no formato AAAA-MM-DD. Exemplo: 2026-05-15');
        return;
      }

      const payload = {
        title,
        amount,
        type: form.type,
        category,
        date: form.date.trim(),
        description,
        recurrence: form.recurrence,
      };

      console.log('Criando transação mobile:', payload);

      const response = await fetch(`${API_BASE_URL}/api/mobile/transactions`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data: any = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.log('Resposta não JSON:', responseText);
        throw new Error('A API retornou uma resposta inesperada.');
      }

      console.log('Resposta da criação:', response.status, data);

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Não foi possível criar a transação.');
      }

      setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
      await loadTransactions(true);
      setSuccessMessage('Transação criada com sucesso.');
    } catch (error) {
      console.log('Erro ao criar transação:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a transação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>Transações</Text>
        <Text style={styles.subtitle}>Adicione e acompanhe suas movimentações.</Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={styles.incomeValue}>{formatCurrency(totalIncome)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={styles.expenseValue}>{formatCurrency(totalExpense)}</Text>
        </View>
      </View>

      <View style={styles.summaryCardFull}>
        <View>
          <Text style={styles.summaryLabel}>Total carregado</Text>
          <Text style={styles.summaryValue}>{transactions.length} transações</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>API online</Text>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          setShowForm((currentValue) => !currentValue);
          setErrorMessage('');
          setSuccessMessage('');
        }}
      >
        <Text style={styles.primaryButtonText}>
          {showForm ? 'Fechar formulário' : '+ Nova transação'}
        </Text>
      </Pressable>

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Nova transação</Text>

          <Text style={styles.inputLabel}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Padaria"
            placeholderTextColor="#64748b"
            value={form.title}
            onChangeText={(value) => updateForm('title', value)}
          />

          <Text style={styles.inputLabel}>Valor</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 18,50"
            placeholderTextColor="#64748b"
            value={form.amount}
            onChangeText={(value) => updateForm('amount', value)}
            keyboardType="decimal-pad"
          />

          <Text style={styles.inputLabel}>Tipo</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={form.type === 'despesa' ? styles.optionActiveExpense : styles.optionButton}
              onPress={() => updateForm('type', 'despesa')}
            >
              <Text style={form.type === 'despesa' ? styles.optionActiveText : styles.optionText}>Despesa</Text>
            </Pressable>
            <Pressable
              style={form.type === 'receita' ? styles.optionActiveIncome : styles.optionButton}
              onPress={() => updateForm('type', 'receita')}
            >
              <Text style={form.type === 'receita' ? styles.optionActiveText : styles.optionText}>Receita</Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Categoria</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Alimentação"
            placeholderTextColor="#64748b"
            value={form.category}
            onChangeText={(value) => updateForm('category', value)}
          />

          <Text style={styles.inputLabel}>Data</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#64748b"
            value={form.date}
            onChangeText={(value) => updateForm('date', value)}
          />

          <Text style={styles.inputLabel}>Recorrência</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={form.recurrence === 'once' ? styles.optionActiveNeutral : styles.optionButton}
              onPress={() => updateForm('recurrence', 'once')}
            >
              <Text style={form.recurrence === 'once' ? styles.optionActiveText : styles.optionText}>Única</Text>
            </Pressable>
            <Pressable
              style={form.recurrence === 'monthly' ? styles.optionActiveNeutral : styles.optionButton}
              onPress={() => updateForm('recurrence', 'monthly')}
            >
              <Text style={form.recurrence === 'monthly' ? styles.optionActiveText : styles.optionText}>Mensal</Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observação opcional"
            placeholderTextColor="#64748b"
            value={form.description}
            onChangeText={(value) => updateForm('description', value)}
            multiline
            numberOfLines={3}
          />

          <View style={styles.nativeButtonWrapper}>
            <Button
              title={saving ? 'Salvando...' : 'Salvar transação'}
              onPress={createTransaction}
              disabled={saving}
              color="#22c55e"
            />
          </View>
        </View>
      ) : null}

      <Pressable
        style={[styles.secondaryButton, loading ? styles.buttonDisabled : null]}
        onPress={() => loadTransactions()}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>{loading ? 'Atualizando...' : 'Atualizar transações'}</Text>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lista</Text>
          <Text style={styles.sectionCounter}>{transactions.length} itens</Text>
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionTop}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <Text style={transaction.type === 'receita' ? styles.transactionIncome : styles.transactionExpense}>
                  {transaction.type === 'receita' ? '+ ' : '- '}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>

              <View style={styles.badgeRow}>
                <View style={transaction.type === 'receita' ? styles.incomeBadge : styles.expenseBadge}>
                  <Text style={transaction.type === 'receita' ? styles.incomeBadgeText : styles.expenseBadgeText}>
                    {getTypeLabel(transaction.type)}
                  </Text>
                </View>
                <View style={styles.neutralBadge}>
                  <Text style={styles.neutralBadgeText}>{formatDate(transaction.date)}</Text>
                </View>
                <View style={styles.neutralBadge}>
                  <Text style={styles.neutralBadgeText}>{getRecurrenceLabel(transaction)}</Text>
                </View>
              </View>

              {transaction.description ? (
                <Text style={styles.description} numberOfLines={2}>{transaction.description}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 18, paddingTop: 28, paddingBottom: 42 },
  header: { marginBottom: 18 },
  appName: { color: '#f8fafc', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#94a3b8', fontSize: 15, marginTop: 4 },
  summaryGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryCardFull: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  summaryValue: { color: '#f8fafc', fontSize: 22, fontWeight: '900' },
  incomeValue: { color: '#22c55e', fontSize: 17, fontWeight: '900' },
  expenseValue: { color: '#ef4444', fontSize: 17, fontWeight: '900' },
  statusBadge: {
    backgroundColor: '#064e3b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusBadgeText: { color: '#bbf7d0', fontSize: 12, fontWeight: '800' },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: { color: '#fecaca', fontSize: 14, lineHeight: 20 },
  successBox: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successText: { color: '#bbf7d0', fontSize: 14, lineHeight: 20 },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  secondaryButton: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: { color: '#dbeafe', fontSize: 14, fontWeight: '900' },
  nativeButtonWrapper: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    color: '#f8fafc',
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  textArea: { minHeight: 82, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: 10 },
  optionButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionActiveExpense: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionActiveIncome: {
    flex: 1,
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionActiveNeutral: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderWidth: 1,
    borderColor: '#60a5fa',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionText: { color: '#94a3b8', fontSize: 13, fontWeight: '800' },
  optionActiveText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '900' },
  sectionCounter: { color: '#94a3b8', fontSize: 13, fontWeight: '800' },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  transactionCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  transactionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  transactionInfo: { flex: 1 },
  transactionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  transactionCategory: { color: '#94a3b8', fontSize: 13, marginTop: 3 },
  transactionIncome: { color: '#22c55e', fontSize: 15, fontWeight: '900', textAlign: 'right' },
  transactionExpense: { color: '#ef4444', fontSize: 15, fontWeight: '900', textAlign: 'right' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  incomeBadge: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  expenseBadge: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  incomeBadgeText: { color: '#bbf7d0', fontSize: 12, fontWeight: '800' },
  expenseBadgeText: { color: '#fecaca', fontSize: 12, fontWeight: '800' },
  neutralBadge: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  neutralBadgeText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  description: { color: '#cbd5e1', fontSize: 13, lineHeight: 19, marginTop: 2 },
});
