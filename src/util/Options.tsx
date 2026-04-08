import { BookOpen, Users, ArrowLeftRight, UserCog, History } from 'lucide-react';
import MenuItem from '@/interface/MenuItemProps';

const menuItems: MenuItem[] = [
    { name: 'Livros', href: '/livros', icon: <BookOpen size={20} strokeWidth={1.75} /> },
    { name: 'Membros', href: '/membros', icon: <Users size={20} strokeWidth={1.75} /> },
    { name: 'Empréstimos', href: '/emprestimos', icon: <ArrowLeftRight size={20} strokeWidth={1.75} /> },
    { name: 'Funcionários', href: '/funcionarios', icon: <UserCog size={20} strokeWidth={1.75} /> },
    { name: 'Histórico', href: '/historico', icon: <History size={20} strokeWidth={1.75} /> },
];

export default menuItems;
