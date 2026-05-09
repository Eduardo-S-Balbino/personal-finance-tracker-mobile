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

      setErrorMessage(
        'Não foi possível carregar as transações. Verifique se a API está online.'
      );
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
      return 'Recorrente mensal';
    }

    return 'Única';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>Transações</Text>
        <Text style={styles.subtitle}>Movimentações recentes carregadas da API</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Resumo da listagem</Text>
        <Text style={styles.infoDescription}>
          Esta tela usa o mesmo backend Flask em produção no Render e exibe as transações recentes
          do usuário demo.
        </Text>
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
          {loading ? 'Carregando...' : 'Atualizar transações'}
        </Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lista de transações</Text>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionTitleBox}>
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

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>{getTypeLabel(transaction.type)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Data</Text>
                  <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Recorrência</Text>
                  <Text style={styles.detailValue}>{getRecurrenceLabel(transaction)}</Text>
                </View>
              </View>

              {transaction.description ? (
                <Text style={styles.description}>{transaction.description}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      <Text style={styles.footer}>
        Próxima etapa: separar transações em uma rota própria da API e adicionar filtros no app.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    marginTop: 28,
    marginBottom: 24,
  },
  appName: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  transactionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  transactionTitleBox: {
    flex: 1,
  },
  transactionTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  transactionCategory: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  transactionIncome: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  transactionExpense: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    gap: 12,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  detailValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  footer: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 18,
    lineHeight: 20,
  },
});