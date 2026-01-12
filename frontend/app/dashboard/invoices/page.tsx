'use client';

import { useEffect, useState } from 'react';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cnpjId, setCnpjId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        clientName: '',
        clientDoc: '',
        amount: '',
        description: ''
    });

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
                setCnpjId(data[0].id);
                fetchInvoices(data[0].id);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchInvoices = async (id: string) => {
        try {
            const token = localStorage.getItem('mei_token');
            const res = await fetch(`http://localhost:3001/api/invoices?cnpjId=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setInvoices(data);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cnpjId) return;

        try {
            const token = localStorage.getItem('mei_token');
            const res = await fetch('http://localhost:3001/api/invoices', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cnpjId,
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ clientName: '', clientDoc: '', amount: '', description: '' });
                fetchInvoices(cnpjId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Notas Fiscais</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? 'Cancelar' : 'Nova Nota'}
                </button>
            </div>

            {showForm && (
                <div className="card animate-fade-in" style={{ marginBottom: '2rem', border: '1px solid #bfdbfe' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Emitir NFS-e Simplificada</h2>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="label">Nome do Cliente</label>
                            <input
                                className="input"
                                required
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">CPF/CNPJ</label>
                            <input
                                className="input"
                                required
                                value={formData.clientDoc}
                                onChange={e => setFormData({ ...formData, clientDoc: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Valor (R$)</label>
                            <input
                                className="input"
                                type="number"
                                step="0.01"
                                required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="label">Descrição do Serviço</label>
                            <textarea
                                className="input"
                                rows={3}
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                            <button type="submit" className="btn btn-primary">Emitir Nota</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Data</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Cliente</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Descrição</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>Valor</th>
                            <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    Nenhuma nota emitida ainda.
                                </td>
                            </tr>
                        ) : invoices.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>{new Date(item.issuedAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500' }}>{item.clientName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.clientDoc}</div>
                                </td>
                                <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.description}
                                </td>
                                <td style={{ padding: '1rem' }}>R$ {item.amount.toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <a href={item.pdfUrl} target="_blank" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                        📄 Baixar
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
