import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = 'https://personal-finance-tracker-wrlj.onrender.com';

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
  description: string;
  is_recurring: boolean;
  recurrence_type: string | null;
};

type DashboardData = {
  status: string;
  message?: string;
  recent_transactions: Transaction[];
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadTransactions() {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log('Buscando transações do dashboard demo mobile...');

      const response = await fetch(`${API_BASE_URL}/api/mobile/demo-dashboard`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const data: DashboardData = await response.json();

      console.log('Resposta das transações:', response.status, data);

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Não foi possível carregar as transações.');
      }

      setTransactions(data.recent_transactions ?? []);
    } catch (error) {
      console.log('Erro ao carregar transações:', error);
      setErrorMessage('Não foi possível carregar as transações. Verifique se a API está online.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatDate(dateValue: string) {
    const [year, month, day] = dateValue.split('-');

    if (!year || !month || !day) {
      return dateValue;
    }

    return `${day}/${month}/${year}`;
  }

  function getTypeLabel(type: Transaction['type']) {
    return type === 'receita' ? 'Receita' : 'Despesa';
  }

  function getRecurrenceLabel(transaction: Transaction) {
    if (transaction.is_recurring && transaction.recurrence_type === 'monthly') {
      return 'Mensal';
    }

    return 'Única';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>Transações</Text>
        <Text style={styles.subtitle}>Movimentações recentes</Text>
      </View>

      <View style={styles.summaryCard}>
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

      <Pressable
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        onPress={loadTransactions}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Atualizando...' : 'Atualizar transações'}
        </Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lista</Text>

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

                <Text
                  style={
                    transaction.type === 'receita'
                      ? styles.transactionIncome
                      : styles.transactionExpense
                  }
                >
                  {transaction.type === 'receita' ? '+ ' : '- '}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>

              <View style={styles.badgeRow}>
                <View
                  style={
                    transaction.type === 'receita'
                      ? styles.incomeBadge
                      : styles.expenseBadge
                  }
                >
                  <Text
                    style={
                      transaction.type === 'receita'
                        ? styles.incomeBadgeText
                        : styles.expenseBadgeText
                    }
                  >
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
                <Text style={styles.description} numberOfLines={2}>
                  {transaction.description}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 18,
    paddingTop: 28,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 18,
  },
  appName: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 4,
  },
  summaryCard: {
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
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 6,
  },
  summaryValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  statusBadge: {
    backgroundColor: '#064e3b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusBadgeText: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  transactionCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  transactionCategory: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 3,
  },
  transactionIncome: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  transactionExpense: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
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
  incomeBadgeText: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '800',
  },
  expenseBadgeText: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '800',
  },
  neutralBadge: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  neutralBadgeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
});