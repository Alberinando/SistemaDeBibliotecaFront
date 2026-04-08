import { FaBook, FaExchangeAlt, FaHistory, FaUserFriends, FaUserTie } from 'react-icons/fa';
import MenuItem from '@/interface/MenuItemProps';

const menuItems: MenuItem[] = [
    { name: 'Livros', href: '/livros', icon: <FaBook size={20} /> },
    { name: 'Membros', href: '/membros', icon: <FaUserFriends size={20} /> },
    { name: 'Empréstimos', href: '/emprestimos', icon: <FaExchangeAlt size={20} /> },
    { name: 'Funcionários', href: '/funcionarios', icon: <FaUserTie size={20} /> },
    { name: 'Histórico', href: '/historico', icon: <FaHistory size={20} /> },
];

export default menuItems;
