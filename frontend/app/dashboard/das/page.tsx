'use client';

import { useEffect, useState } from 'react';

export default function DasPage() {
    const [dasList, setDasList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // In a real app, we would get the CNPJ ID from the user context or API
    // For MVP mock, we'll assume the user has one CNPJ and the backend handles lookup via token or we fetch first CNPJ
    const [cnpjId, setCnpjId] = useState<string | null>(null);

    useEffect(() => {
        fetchCnpjs();
    }, []);

    const fetchCnpjs = async () => {
        try {
            const token = localStorage.getItem('mei_token');
            const res = await fetch('http://localhost:3001/api/cnpj', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.length > 0) {
                setCnpjId(data[0].id); // Select first CNPJ
                fetchDas(data[0].id);
            } else {
                // Auto-create a mock CNPJ for the user if none exists (for smooth demo flow)
                createMockCnpj();
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const createMockCnpj = async () => {
        try {
            const token = localStorage.getItem('mei_token');
            const res = await fetch('http://localhost:3001/api/cnpj', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cnpj: '12345678000190' })
            });
            const data = await res.json();
            setCnpjId(data.id);
            fetchDas(data.id);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchDas = async (id: string) => {
        try {
            const token = localStorage.getItem('mei_token');
            const res = await fetch(`http://localhost:3001/api/das?cnpjId=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setDasList(data);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateValues = async () => {
        if (!cnpjId) return;
        setGenerating(true);
        try {
            const token = localStorage.getItem('mei_token');
            await fetch('http://localhost:3001/api/das/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cnpjId })
            });
            await fetchDas(cnpjId);
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const handlePay = async (id: string) => {
        if (!confirm('Simular pagamento deste boleto?')) return;
        try {
            const token = localStorage.getItem('mei_token');
            await fetch(`http://localhost:3001/api/das/${id}/pay`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state
            setDasList(dasList.map(d => d.id === id ? { ...d, status: 'PAID' } : d));
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = { padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' };
        if (status === 'PAID') return <span style={{ ...styles, background: '#dcfce7', color: '#166534' }}>PAGO</span>;
        if (status === 'PENDING') return <span style={{ ...styles, background: '#fef9c3', color: '#854d0e' }}>A VENCER</span>;
        return <span style={{ ...styles, background: '#fee2e2', color: '#991b1b' }}>ATRASADO</span>;
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Meus DAS</h1>
                <button
                    onClick={handleGenerateValues}
                    disabled={generating}
                    className="btn btn-primary"
                >
                    {generating ? 'Gerando...' : 'Gerar Carnê 2026'}
                </button>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : dasList.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>Nenhum boleto encontrado para este ano.</p>
                    <button onClick={handleGenerateValues} className="btn btn-primary">Gerar Carnê Agora</button>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Mês/Ano</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Vencimento</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Valor</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dasList.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>{item.month}/{item.year}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(item.dueDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>R$ {item.amount.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>{getStatusBadge(item.status)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {item.status !== 'PAID' && (
                                            <button
                                                onClick={() => handlePay(item.id)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                            >
                                                Pagar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
