import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { TransactionModal } from '@/components/TransactionModal';
import { StatsCards } from '@/components/StatsCards';
import { FinancialCalendar } from '@/components/FinancialCalendar';
import { RecentTransactions } from '@/components/RecentTransactions';
import { ExpensesPieChart } from '@/components/ExpensesPieChart';

export const Dashboard: React.FC = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const openTransactionModal = () => {
    setIsTransactionModalOpen(true);
    setIsSideMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSideMenuOpen(true)} />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Título e ação rápida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard Financeiro
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seus gastos e entradas
            </p>
          </div>
          
          <Button
            onClick={openTransactionModal}
            className="bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Transação
          </Button>
        </motion.div>

        {/* Cards de estatísticas */}
        <StatsCards />

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendário financeiro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <FinancialCalendar />
          </motion.div>

          {/* Transações recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <RecentTransactions />
          </motion.div>
        </div>

        {/* Gráfico de gastos por categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <ExpensesPieChart />
        </motion.div>

        {/* Seção de investimentos (placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="p-8 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 text-center"
        >
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Módulo de Investimentos
          </h3>
          <p className="text-sm text-muted-foreground">
            Em desenvolvimento - Em breve você poderá acompanhar seus investimentos aqui
          </p>
        </motion.div>
      </main>

      {/* Menu lateral */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onAddTransaction={openTransactionModal}
      />

      {/* Modal de transação */}
      <TransactionModal
        open={isTransactionModalOpen}
        onOpenChange={setIsTransactionModalOpen}
      />
    </div>
  );
};