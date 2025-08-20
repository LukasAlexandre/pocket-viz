import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTransactions, TransactionCategory, BankAccount } from '@/contexts/TransactionContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const categoryLabels: Record<TransactionCategory, string> = {
  'gasto-fixo': 'Fixo',
  'gasto-desnecessario': 'Desnecessário',
  'alimento': 'Alimentação',
  'cartao': 'Cartão'
};

const accountLabels: Record<BankAccount, string> = {
  'c6-bank': 'C6',
  'nubank': 'Nu',
  'inter': 'Inter'
};

const categoryColors: Record<TransactionCategory, string> = {
  'gasto-fixo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'gasto-desnecessario': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'alimento': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'cartao': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

export const RecentTransactions: React.FC = () => {
  const { transactions, deleteTransaction } = useTransactions();
  
  // Pegar as 5 transações mais recentes
  const recentTransactions = transactions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma transação ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                transaction.type === 'entrada' 
                  ? 'bg-success/20 text-success' 
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {transaction.type === 'entrada' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${categoryColors[transaction.category]}`}
                  >
                    {categoryLabels[transaction.category]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {accountLabels[transaction.account]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(transaction.date, 'dd/MM', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`font-semibold ${
                transaction.type === 'entrada' ? 'text-success' : 'text-destructive'
              }`}>
                {transaction.type === 'entrada' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTransaction(transaction.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};