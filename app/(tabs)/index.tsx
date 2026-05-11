import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = 'https://personal-finance-tracker-wrlj.onrender.com';

type Summary = {
  balance: number;
  total_income: number;
  total_expense: number;
  goal_percentage: number;
  goal_progress: number;
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

type ExpenseByCategoryChart = {
  labels: string[];
  values: number[];
};

type MonthlyEvolutionChart = {
  labels: string[];
  income_values: number[];
  expense_values: number[];
};

type DashboardCharts = {
  expense_by_category?: ExpenseByCategoryChart;
  monthly_evolution?: MonthlyEvolutionChart;
};

type DashboardFilters = {
  available_categories?: string[];
  selected_category?: string;
  selected_month?: number;
  selected_type?: string;
  selected_year?: number;
};

type DashboardData = {
  status: string;
  message?: string;
  summary: Summary;
  recent_transactions: Transaction[];
  alerts?: string[];
  charts?: DashboardCharts;
  filters?: DashboardFilters;
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

      const data = await response.json();

      console.log('Resposta do dashboard demo mobile:', response.status, data);

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Não foi possível carregar os dados da API.');
      }

      setDashboardData(data);
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
      setErrorMessage(
        'Não foi possível carregar os dados da API. Verifique se o backend está online no Render.'
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
  const alerts = dashboardData?.alerts ?? [];
  const selectedMonth = dashboardData?.filters?.selected_month;
  const selectedYear = dashboardData?.filters?.selected_year;
  const expenseChart = dashboardData?.charts?.expense_by_category;

  const expenseByCategory = useMemo(() => {
    const labels = expenseChart?.labels ?? [];
    const values = expenseChart?.values ?? [];

    return labels
      .map((label, index) => ({
        label,
        value: Number(values[index] ?? 0),
      }))
      .filter((item) => item.value > 0)
      .sort((first, second) => second.value - first.value);
  }, [expenseChart]);

  const maxCategoryExpense = useMemo(() => {
    if (expenseByCategory.length === 0) {
      return 0;
    }

    return Math.max(...expenseByCategory.map((item) => item.value));
  }, [expenseByCategory]);

  function formatCurrency(value: number | undefined | null) {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return 'R$ 0,00';
    }

    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatPercentage(value: number | undefined | null) {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return '0%';
    }

    return `${value.toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })}%`;
  }

  function formatDate(dateValue: string) {
    const [year, month, day] = dateValue.split('-');

    if (!year || !month || !day) {
      return dateValue;
    }

    return `${day}/${month}/${year}`;
  }

  function getMonthName(month?: number) {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    if (!month || month < 1 || month > 12) {
      return 'Mês atual';
    }

    return months[month - 1];
  }

  function getGoalProgress() {
    const progress = summary?.goal_progress ?? 0;

    if (progress < 0) {
      return 0;
    }

    if (progress > 100) {
      return 100;
    }

    return progress;
  }

  function getSavingsStatus() {
    const savingsRate = summary?.savings_rate ?? 0;
    const goal = summary?.goal_percentage ?? 0;

    if (savingsRate >= goal) {
      return 'Meta atingida';
    }

    if (savingsRate > 0) {
      return 'Em progresso';
    }

    return 'Sem economia';
  }

  function getTransactionAmountStyle(type: 'receita' | 'despesa') {
    return type === 'receita' ? styles.transactionIncome : styles.transactionExpense;
  }

  function getTransactionSign(type: 'receita' | 'despesa') {
    return type === 'receita' ? '+ ' : '- ';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Finance Tracker</Text>
          <Text style={styles.subtitle}>Dashboard financeiro mobile</Text>
        </View>

        <View style={styles.apiBadge}>
          <View style={styles.apiDot} />
          <Text style={styles.apiBadgeText}>API</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.cardLabel}>Saldo atual</Text>
            <Text style={styles.balance}>{formatCurrency(summary?.balance)}</Text>
          </View>

          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>
              {getMonthName(selectedMonth)} {selectedYear ?? ''}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Dados sincronizados com o backend Flask em produção no Render.
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Indicadores</Text>
          <Text style={styles.sectionMeta}>{getSavingsStatus()}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.infoLabel}>Meta de economia</Text>
          <Text style={styles.infoValue}>{formatPercentage(summary?.goal_percentage)}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.infoLabel}>Taxa de economia</Text>
          <Text style={styles.infoValue}>{formatPercentage(summary?.savings_rate)}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.infoLabel}>Maior categoria</Text>
          <Text style={styles.infoValue}>{summary?.top_category || 'Sem dados'}</Text>
        </View>

        <View style={styles.progressArea}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso da meta</Text>
            <Text style={styles.progressValue}>{formatPercentage(getGoalProgress())}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${getGoalProgress()}%` }]} />
          </View>
        </View>
      </View>

      {alerts.length > 0 ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>Alerta financeiro</Text>
          {alerts.slice(0, 2).map((alert) => (
            <Text key={alert} style={styles.alertText}>
              {alert}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.categorySectionHeader}>
          <Text style={styles.sectionTitleCompact}>Despesas por categoria</Text>
          <Text style={styles.categoryMeta}>{expenseByCategory.length} categorias</Text>
        </View>

        {expenseByCategory.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma despesa carregada para o período.</Text>
        ) : (
          expenseByCategory.map((item) => {
            const percentage =
              maxCategoryExpense > 0 ? Math.max((item.value / maxCategoryExpense) * 100, 8) : 0;

            return (
              <View key={item.label} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{item.label}</Text>
                  <Text style={styles.categoryValue}>{formatCurrency(item.value)}</Text>
                </View>

                <View style={styles.categoryTrack}>
                  <View style={[styles.categoryFill, { width: `${percentage}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recentes</Text>
          <Text style={styles.sectionMeta}>{recentTransactions.length} itens</Text>
        </View>

        {recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação carregada ainda.</Text>
        ) : (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transaction}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionCategory}>
                  {transaction.category} • {formatDate(transaction.date)}
                </Text>
              </View>

              <Text style={getTransactionAmountStyle(transaction.type)}>
                {getTransactionSign(transaction.type)}
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

      <Text style={styles.footer}>
        App mobile integrado ao backend Flask em produção.
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
    padding: 18,
    paddingTop: 28,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  appName: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 5,
  },
  apiBadge: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  apiDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  apiBadgeText: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '900',
  },
  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  balance: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '900',
  },
  periodBadge: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  periodText: {
    color: '#cbd5e1',
    fontSize: 12,
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
    fontSize: 20,
    fontWeight: '900',
  },
  expense: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '900',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 21,
    fontWeight: '900',
    flex: 1,
    minWidth: 0,
  },
  sectionTitleCompact: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 30,
  },
  sectionMeta: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 5,
    textAlign: 'right',
  },
  categorySectionHeader: {
    marginBottom: 14,
  },
  categoryMeta: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 10,
    gap: 12,
  },
  infoLabel: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  progressArea: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
  },
  progressValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  alertBox: {
    backgroundColor: '#451a03',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertTitle: {
    color: '#fef3c7',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  alertText: {
    color: '#fde68a',
    fontSize: 14,
    lineHeight: 20,
  },
  categoryItem: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  categoryName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    minWidth: 0,
  },
  categoryValue: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    flexShrink: 0,
  },
  categoryTrack: {
    height: 12,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 999,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
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
    minWidth: 0,
  },
  transactionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  transactionCategory: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  transactionIncome: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    flexShrink: 0,
  },
  transactionExpense: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    flexShrink: 0,
  },
  errorBox: {
    backgroundColor: '#991b1b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 13,
  },
});
