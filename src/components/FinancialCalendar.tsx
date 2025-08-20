import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactions } from '@/contexts/TransactionContext';
import { useState } from 'react';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const FinancialCalendar: React.FC = () => {
  const { getTransactionsByDate, getTransactionsByMonth } = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());

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
      
      days.push(
        <motion.div
          key={day}
          className={`h-24 p-2 border border-border rounded-lg cursor-pointer transition-all hover:shadow-card ${
            isToday ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-start h-full">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
              {day}
            </span>
            
            {total > 0 && (
              <div className="flex flex-col items-end space-y-1">
                {income > 0 && (
                  <Badge className="text-xs bg-success/20 text-success border-success/30 px-1.5 py-0.5">
                    +{income.toFixed(0)}
                  </Badge>
                )}
                {expenses > 0 && (
                  <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30 px-1.5 py-0.5">
                    -{expenses.toFixed(0)}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    return days;
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Calendário Financeiro</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
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
              onClick={() => navigateMonth('next')}
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
  );
};