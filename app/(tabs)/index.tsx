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
  alerts: string[];
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

      const response = await fetch(`${API_BASE_URL}/api/mobile/demo-dashboard`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const data: DashboardData = await response.json();

      console.log('Resposta do dashboard demo mobile:', response.status, data);

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Não foi possível carregar os dados da API.');
      }

      setDashboardData(data);
    } catch (error) {
      console.log('Erro ao carregar dados:', error);

      setErrorMessage('Não foi possível carregar os dados da API. Verifique se o backend está online.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const summary = dashboardData?.summary;
  const alerts = dashboardData?.alerts ?? [];
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
        <Text style={styles.subtitle}>Resumo financeiro do mês</Text>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.cardLabel}>Saldo atual</Text>
          <Text style={styles.balance}>{formatCurrency(summary?.balance)}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>API online</Text>
        </View>
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
        <Text style={styles.sectionTitle}>Indicadores</Text>

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

      {alerts.length > 0 ? (
        <View style={styles.alertSection}>
          <Text style={styles.alertTitle}>Alerta financeiro</Text>

          {alerts.map((alert) => (
            <Text key={alert} style={styles.alertText}>
              {alert}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recentes</Text>
          <Text style={styles.sectionCounter}>{recentTransactions.length} itens</Text>
        </View>

        {recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação carregada.</Text>
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
          {loading ? 'Atualizando...' : 'Atualizar dashboard'}
        </Text>
      </Pressable>
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
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  balance: {
    color: '#f8fafc',
    fontSize: 32,
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
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
    fontSize: 19,
    fontWeight: '900',
  },
  expense: {
    color: '#ef4444',
    fontSize: 19,
    fontWeight: '900',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  sectionCounter: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 10,
    gap: 12,
  },
  infoLabel: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  alertSection: {
    backgroundColor: '#422006',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertTitle: {
    color: '#fef3c7',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  alertText: {
    color: '#fde68a',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 11,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },
  transactionCategory: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 3,
  },
  transactionIncome: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  transactionExpense: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});