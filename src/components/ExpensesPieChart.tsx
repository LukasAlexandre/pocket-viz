import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';

const CATEGORY_COLORS = {
  'gasto-fixo': 'hsl(var(--chart-1))',
  'gasto-desnecessario': 'hsl(var(--chart-2))',
  'alimento': 'hsl(var(--chart-3))',
  'cartao': 'hsl(var(--chart-4))'
};

const CATEGORY_LABELS = {
  'gasto-fixo': 'Gasto Fixo',
  'gasto-desnecessario': 'Gasto Desnecessário',
  'alimento': 'Alimentação',
  'cartao': 'Cartão'
};

export const ExpensesPieChart: React.FC = () => {
  const { transactions } = useTransactions();

  // Filtrar apenas saídas e agrupar por categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'saida')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  // Converter para formato do gráfico
  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
    value: amount,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'hsl(var(--muted))'
  }));

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.payload.category}</p>
          <p className="text-sm text-muted-foreground">
            R$ {data.value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              📊 Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Nenhum gasto registrado ainda</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            📊 Gastos por Categoria
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: R$ {totalExpenses.toFixed(2)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value, percent }) => 
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};