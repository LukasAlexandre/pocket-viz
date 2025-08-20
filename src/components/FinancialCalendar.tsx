import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactions, TransactionCategory, BankAccount } from '@/contexts/TransactionContext';
import { useState } from 'react';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

export const FinancialCalendar: React.FC = () => {
  const { getTransactionsByDate, getTransactionsByMonth, deleteTransaction } = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthTransactions = getTransactionsByMonth(year, month);
  const monthIncome = monthTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = monthTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayTransactionSummary = (day: number) => {
    const date = new Date(year, month, day);
    const dayTransactions = getTransactionsByDate(date);
    
    const income = dayTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, total: dayTransactions.length };
  };

  const renderCalendarDays = () => {
    const days = [];
    // Espaços em branco para o início do mês
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const { income, expenses, total } = getDayTransactionSummary(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDay === day;
      days.push(
        <motion.div
          key={day}
          className={`h-24 p-2 border border-border rounded-lg cursor-pointer transition-all hover:shadow-card ${
            isSelected ? 'ring-2 ring-primary bg-primary/10' : isToday ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedDay(day)}
        >
          <div className="flex justify-between items-start h-full">
            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
            {total > 0 && (
              <div className="flex flex-col items-end space-y-1">
                {income > 0 && (
                  <BadgeUI className="text-xs bg-success/20 text-success border-success/30 px-1.5 py-0.5">
                    +{income.toFixed(0)}
                  </BadgeUI>
                )}
                {expenses > 0 && (
                  <BadgeUI className="text-xs bg-destructive/20 text-destructive border-destructive/30 px-1.5 py-0.5">
                    -{expenses.toFixed(0)}
                  </BadgeUI>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return days;
  };

  // Transações do dia selecionado
  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;
  const dayTransactions = selectedDate ? getTransactionsByDate(selectedDate) : [];

  return (
    <>
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Calendário Financeiro</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedDay(null); navigateMonth('prev'); }}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {monthNames[month]} {year}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedDay(null); navigateMonth('next'); }}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Resumo do mês */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-success font-medium">
                R$ {monthIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">
                R$ {monthExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm ml-auto">
              <span className="text-muted-foreground">Saldo:</span>
              <span className={`font-semibold ${
                monthIncome - monthExpenses >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                R$ {(monthIncome - monthExpenses).toFixed(2)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>
      {/* Movimentações do dia selecionado */}
      {selectedDay && (
        <Card className="bg-gradient-card shadow-card border-0 mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Movimentações do dia {selectedDay.toString().padStart(2, '0')}/{(month+1).toString().padStart(2, '0')}/{year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dayTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma movimentação neste dia</p>
              </div>
            ) : (
              dayTransactions.map((transaction, index) => (
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
                        <BadgeUI 
                          variant="secondary" 
                          className={`text-xs ${categoryColors[transaction.category]}`}
                        >
                          {categoryLabels[transaction.category]}
                        </BadgeUI>
                        <BadgeUI variant="outline" className="text-xs">
                          {accountLabels[transaction.account]}
                        </BadgeUI>
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
              ))
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};