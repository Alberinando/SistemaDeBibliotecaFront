import { ReactNode } from 'react';

export default interface MenuItem {
    name: string;
    href: string;
    icon: ReactNode;
}
