'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Basic Auth Check
        const token = localStorage.getItem('mei_token');
        const userData = localStorage.getItem('mei_user');

        if (!token || !userData) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(userData));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('mei_token');
        localStorage.removeItem('mei_user');
        router.push('/');
    };

    const navItems = [
        { name: 'Visão Geral', href: '/dashboard', icon: '📊' },
        { name: 'Meus DAS', href: '/dashboard/das', icon: '💰' },
        { name: 'Notas Fiscais', href: '/dashboard/invoices', icon: '📄' },
        { name: 'Configurações', href: '/dashboard/settings', icon: '⚙️' },
    ];

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', flexDirection: 'column' }}>

            {/* Mobile Top Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                height: '60px'
            }} className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>MEI Guardian</h1>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}
                >
                    {isMobileMenuOpen ? '✖️' : '☰'}
                </button>
            </div>

            <style jsx global>{`
        /* Desktop Sidebar Default */
        .sidebar {
          width: 250px;
          position: fixed;
          height: 100vh;
          z-index: 40;
          transform: translateX(0);
          transition: transform 0.3s ease;
        }
        
        .main-content {
           margin-left: 250px;
           padding: 2rem;
           padding-top: 2rem;
        }

        .mobile-header {
            display: none !important;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 100%;
            padding-top: 80px !important; /* Space for top header */
          }
          .sidebar.open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
            padding: 1rem;
            padding-top: 80px; /* Space for top header */
          }

          .mobile-header {
              display: flex !important;
          }
        }
      `}</style>

            {/* Sidebar (Responsive) */}
            <aside
                className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}
                style={{
                    background: 'white',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                }}
            >
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-logo">
                    <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                        MEI Guardian
                    </h1>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)} // Close on click mobile
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                color: pathname === item.href ? '#2563eb' : '#64748b',
                                background: pathname === item.href ? '#eff6ff' : 'transparent',
                                fontWeight: pathname === item.href ? '600' : '500',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Plano {user.plan}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        🚪 Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
}
