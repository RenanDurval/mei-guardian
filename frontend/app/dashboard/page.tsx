'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [hasCnpj, setHasCnpj] = useState(false);
    const [cnpjData, setCnpjData] = useState<any>(null);
    const [inputCnpj, setInputCnpj] = useState('');

    // Stats
    const [status, setStatus] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
    const [stats, setStats] = useState({ pendingDas: 0, overdueDas: 0 });

    useEffect(() => {
        checkCnpj();
    }, []);

    const checkCnpj = async () => {
        try {
            const token = localStorage.getItem('mei_token');
            if (!token) return router.push('/');

            const res = await fetch('http://localhost:3001/api/cnpj', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data && data.length > 0) {
                setHasCnpj(true);
                setCnpjData(data[0]);
                // Simulate analysis based on the fetched data
                analyzeStatus(data[0]);
            } else {
                setHasCnpj(false);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const analyzeStatus = (cnpj: any) => {
        // Determine status based on DAS list attached to CNPJ (server-side logic mock)
        // For now we use the status field from the DB
        if (cnpj.status === 'ACTIVE') setStatus('GREEN');
        else if (cnpj.status === 'SUSPENDED') setStatus('RED');
        else setStatus('YELLOW');

        // Stats Logic
        const pending = cnpj.dasList?.filter((d: any) => d.status === 'PENDING').length || 0;
        const overdue = cnpj.dasList?.filter((d: any) => d.status === 'OVERDUE').length || 0;

        setStats({ pendingDas: pending, overdueDas: overdue });

        if (overdue > 0) setStatus('RED');
        else if (pending > 0) setStatus('YELLOW');
        else setStatus('GREEN');

        setLoading(false);
    };

    const handleRegisterCnpj = async (e: React.FormEvent) => {
        e.preventDefault();
        setAnalyzing(true);

        try {
            const token = localStorage.getItem('mei_token');

            // 1. Register CNPJ
            const res = await fetch('http://localhost:3001/api/cnpj', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cnpj: inputCnpj })
            });

            if (!res.ok) throw new Error('Erro ao cadastrar');
            const newCnpj = await res.json();

            // 2. Simulate "Connecting to Receita Federal" delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Generate DAS for this new CNPJ (Mock logic)
            await fetch('http://localhost:3001/api/das/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cnpjId: newCnpj.id })
            });

            // 4. Refresh
            checkCnpj();

        } catch (err) {
            console.error(err);
            alert('Erro ao cadastrar CNPJ. Tente novamente.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <p className="animate-fade-in">Carregando seus dados...</p>
            </div>
        );
    }

    // --- ONBOARDING STATE (No CNPJ) ---
    if (!hasCnpj) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <h1 className="page-title">Vamos começar! 🚀</h1>
                <div className="card">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cadastre seu CNPJ</h2>
                        <p style={{ color: '#64748b' }}>
                            Para monitorarmos sua situação fiscal, precisamos identificar sua empresa.
                            O sistema fará uma varredura automática na Receita Federal.
                        </p>
                    </div>

                    <form onSubmit={handleRegisterCnpj}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <label className="label">Número do CNPJ</label>
                            <input
                                className="input"
                                placeholder="00.000.000/0000-00"
                                value={inputCnpj}
                                onChange={e => setInputCnpj(e.target.value)}
                                required
                                minLength={14}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={analyzing}
                        >
                            {analyzing ? 'Consultando Receita Federal...' : 'Analisar meu CNPJ Agora'}
                        </button>
                    </form>

                    {analyzing && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Conectando aos sistemas do governo...</p>
                            <div style={{
                                height: '4px',
                                background: '#e2e8f0',
                                borderRadius: '2px',
                                marginTop: '0.5rem',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    background: '#2563eb',
                                    width: '50%',
                                    animation: 'indeterminate 1.5s infinite linear'
                                }} />
                            </div>
                            <style jsx>{`
                @keyframes indeterminate {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(200%); }
                }
              `}</style>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- ACTIVE STATE (Has CNPJ) ---
    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Visão Geral</h1>
                <div style={{ background: '#e2e8f0', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                    Empresa: <strong>{cnpjData?.cnpj}</strong>
                </div>
            </div>

            {/* Traffic Light Card */}
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: status === 'GREEN' ? '#10b981' : status === 'YELLOW' ? '#f59e0b' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 20px ${status === 'GREEN' ? '#10b981' : status === 'YELLOW' ? '#f59e0b' : '#ef4444'}40`,
                    flexShrink: 0
                }}>
                    <span style={{ fontSize: '3rem' }}>
                        {status === 'GREEN' ? '😊' : status === 'YELLOW' ? '😐' : '😱'}
                    </span>
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                        {status === 'GREEN' ? 'Situação Regular' : status === 'YELLOW' ? 'Atenção Necessária' : 'Risco Fiscal Detectado'}
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                        {status === 'GREEN'
                            ? 'Nenhuma pendência encontrada. Seu MEI está 100% em dia.'
                            : status === 'YELLOW'
                                ? `Você tem ${stats.pendingDas} boleto(s) próximo(s) do vencimento.`
                                : `URGENTE: ${stats.overdueDas} boleto(s) em atraso. Regularize para evitar multas.`
                        }
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                <div className="card">
                    <h3 className="label">Obrigações DAS</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: stats.overdueDas > 0 ? '#ef4444' : 'inherit' }}>
                        {stats.pendingDas + stats.overdueDas} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#64748b' }}>guias abertas</span>
                    </div>
                    <Link href="/dashboard/das" className="btn btn-secondary" style={{ width: '100%' }}>
                        Gerenciar Guias
                    </Link>
                </div>

                <div className="card">
                    <h3 className="label">Faturamento</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Emitir
                    </div>
                    <Link href="/dashboard/invoices" className="btn btn-primary" style={{ width: '100%' }}>
                        Nova Nota Fiscal
                    </Link>
                </div>

                <div className="card">
                    <h3 className="label">Receita Acumulada (Ano)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#10b981' }}>
                        R$ 0,00
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem' }}>
                        <div style={{ width: '0%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>0% do limite de R$ 81k</p>
                </div>

            </div>
        </div>
    );
}
