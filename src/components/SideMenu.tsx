import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home, 
  PlusCircle, 
  TrendingUp, 
  Settings, 
  CreditCard, 
  PieChart,
  HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: PlusCircle, label: 'Nova Transação', action: 'add-transaction' },
  { icon: TrendingUp, label: 'Relatórios' },
  { icon: PieChart, label: 'Categorias' },
  { icon: CreditCard, label: 'Contas' },
];

const bottomItems = [
  { icon: Settings, label: 'Configurações' },
  { icon: HelpCircle, label: 'Ajuda' },
];

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onAddTransaction }) => {
  const handleItemClick = (action?: string) => {
    if (action === 'add-transaction') {
      onAddTransaction();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-card border-l shadow-elegant z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col h-full">
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleItemClick(item.action)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all hover:bg-accent ${
                      item.active ? 'bg-primary/10 text-primary border border-primary/20' : ''
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.action === 'add-transaction' && (
                      <Badge className="ml-auto bg-gradient-primary text-primary-foreground">
                        Novo
                      </Badge>
                    )}
                  </motion.button>
                ))}

                <div className="my-4">
                  <Separator />
                </div>

                {/* Seção Investimentos */}
                <div className="px-4 py-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Investimentos
                  </h3>
                  <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
                    <p className="text-sm text-muted-foreground text-center">
                      Em desenvolvimento
                    </p>
                    <Badge variant="secondary" className="w-full justify-center mt-2">
                      Em breve
                    </Badge>
                  </div>
                </div>
              </nav>

              {/* Bottom Items */}
              <div className="p-4 border-t space-y-2">
                {bottomItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (menuItems.length + index) * 0.1 }}
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};