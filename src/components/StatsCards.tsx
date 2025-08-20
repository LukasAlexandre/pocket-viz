import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';

export const StatsCards: React.FC = () => {
  const { getTotalIncome, getTotalExpenses, getBalance, transactions } = useTransactions();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const transactionCount = transactions.length;

  const stats = [
    {
      title: 'Saldo Total',
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? 'text-success' : 'text-destructive',
      bgColor: balance >= 0 ? 'bg-success/10' : 'bg-destructive/10',
      prefix: 'R$'
    },
    {
      title: 'Entradas',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      prefix: 'R$'
    },
    {
      title: 'Saídas',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      prefix: 'R$'
    },
    {
      title: 'Transações',
      value: transactionCount,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      prefix: ''
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-gradient-card shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                    {stat.prefix}{typeof stat.value === 'number' && stat.prefix === 'R$' 
                      ? stat.value.toFixed(2) 
                      : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};