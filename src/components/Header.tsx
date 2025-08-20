import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-gradient-card backdrop-blur-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo e título */}
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">PocketViz</h1>
            <p className="text-xs text-muted-foreground">Controle Financeiro</p>
          </div>
        </motion.div>

        {/* Ações do header */}
        <div className="flex items-center space-x-2">
          {/* Toggle tema */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Claro</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Escuro</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu hambúrguer */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};