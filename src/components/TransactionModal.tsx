import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactions, TransactionType, TransactionCategory, BankAccount } from '@/contexts/TransactionContext';
import { toast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  type: z.enum(['entrada', 'saida']),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: z.enum(['gasto-fixo', 'gasto-desnecessario', 'alimento', 'cartao']),
  description: z.string().min(1, 'Descrição é obrigatória'),
  account: z.enum(['c6-bank', 'nubank', 'inter'])
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<TransactionCategory, string> = {
  'gasto-fixo': 'Gasto Fixo',
  'gasto-desnecessario': 'Gasto Desnecessário',
  'alimento': 'Alimentação',
  'cartao': 'Cartão'
};

const accountLabels: Record<BankAccount, string> = {
  'c6-bank': 'C6 Bank',
  'nubank': 'Nubank',
  'inter': 'Inter'
};

export const TransactionModal: React.FC<TransactionModalProps> = ({ open, onOpenChange }) => {
  const { addTransaction } = useTransactions();
  const [transactionType, setTransactionType] = useState<TransactionType>('saida');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'saida',
      category: 'gasto-desnecessario',
      account: 'nubank'
    }
  });

  const onSubmit = (data: TransactionFormData) => {
    const amount = parseFloat(data.amount.replace(',', '.'));
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor deve ser um número válido maior que zero',
        variant: 'destructive'
      });
      return;
    }

    addTransaction({
      type: data.type,
      amount,
      category: data.category,
      description: data.description,
      account: data.account,
      date: new Date()
    });

    toast({
      title: 'Sucesso!',
      description: `${data.type === 'entrada' ? 'Entrada' : 'Saída'} de R$ ${amount.toFixed(2)} adicionada`,
      variant: 'default'
    });

    reset();
    onOpenChange(false);
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setValue('type', type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            Nova Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-6">
          {/* Tipo de transação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Transação</Label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => handleTypeChange('entrada')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  transactionType === 'entrada'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border hover:border-success/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Entrada</span>
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => handleTypeChange('saida')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  transactionType === 'saida'
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border hover:border-destructive/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="font-medium">Saída</span>
              </motion.button>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              placeholder="0,00"
              {...register('amount')}
              className="text-lg"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Lanchonete, Supermercado..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select defaultValue="gasto-desnecessario" onValueChange={(value) => setValue('category', value as TransactionCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conta */}
          <div className="space-y-2">
            <Label>Conta Origem</Label>
            <Select defaultValue="nubank" onValueChange={(value) => setValue('account', value as BankAccount)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(accountLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};