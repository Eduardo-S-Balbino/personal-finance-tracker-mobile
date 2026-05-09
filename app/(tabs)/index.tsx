import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = 'https://personal-finance-tracker-wrlj.onrender.com';

type Summary = {
  balance: number;
  total_income: number;
  total_expense: number;
  goal_percentage: number;
  savings_rate: number;
  top_category: string | null;
};

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
  summary: Summary;
  recent_transactions: Transaction[];
};

export default function HomeScreen() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadDashboardData() {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log('Buscando dashboard demo mobile...');

      const dashboardResponse = await fetch(`${API_BASE_URL}/api/mobile/demo-dashboard`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const dashboardData = await dashboardResponse.json();

      console.log('Resposta do dashboard demo mobile:', dashboardResponse.status, dashboardData);

      if (!dashboardResponse.ok || dashboardData.status === 'error') {
        throw new Error(dashboardData.message || 'Não foi possível carregar os dados da API.');
      }

      setDashboardData(dashboardData);
    } catch (error) {
      console.log('Erro ao carregar dados:', error);

      setErrorMessage(
        'Não foi possível carregar os dados da API. Verifique o Console do navegador para ver o erro técnico.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const summary = dashboardData?.summary;
  const recentTransactions = dashboardData?.recent_transactions ?? [];

  function formatCurrency(value: number | undefined) {
    if (value === undefined || Number.isNaN(value)) {
      return 'R$ 0,00';
    }

    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatPercentage(value: number | undefined) {
    if (value === undefined || Number.isNaN(value)) {
      return '0%';
    }

    return `${value.toLocaleString('pt-BR')}%`;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>Finance Tracker</Text>
        <Text style={styles.subtitle}>Controle financeiro pessoal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Saldo atual</Text>
        <Text style={styles.balance}>{formatCurrency(summary?.balance)}</Text>
        <Text style={styles.cardDescription}>
          Dados carregados da API Flask em produção no Render.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={styles.income}>{formatCurrency(summary?.total_income)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={styles.expense}>{formatCurrency(summary?.total_expense)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo do mês</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Meta de economia</Text>
          <Text style={styles.infoValue}>{formatPercentage(summary?.goal_percentage)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Taxa de economia</Text>
          <Text style={styles.infoValue}>{formatPercentage(summary?.savings_rate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Maior categoria</Text>
          <Text style={styles.infoValue}>{summary?.top_category || 'Sem dados'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transações recentes</Text>

        {recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação carregada ainda.</Text>
        ) : (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transaction}>
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
          ))
        )}
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        onPress={loadDashboardData}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Carregando...' : 'Atualizar dados da API'}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Primeira versão mobile consumindo dados do backend Flask em produção.
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
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  balance: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },
  income: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700',
  },
  expense: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  infoLabel: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 12,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  transactionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  transactionCategory: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 3,
  },
  transactionExpense: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
  transactionIncome: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
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
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 18,
    lineHeight: 20,
  },
});