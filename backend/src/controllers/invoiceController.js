const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createInvoice = async (req, res) => {
    try {
        const { cnpjId, clientName, clientDoc, amount, description } = req.body;

        // Mock PDF generation - in real app would use pdfkit or puppeteer
        const pdfUrl = `https://mock-storage.com/invoices/${Date.now()}.pdf`;

        const invoice = await prisma.invoice.create({
            data: {
                cnpjId,
                clientName,
                clientDoc,
                amount,
                description,
                pdfUrl
            }
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Invoice Error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

exports.listInvoices = async (req, res) => {
    try {
        const { cnpjId } = req.query;
        if (!cnpjId) return res.status(400).json({ error: 'cnpjId required' });

        const invoices = await prisma.invoice.findMany({
            where: { cnpjId },
            orderBy: { issuedAt: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Error listing invoices' });
    }
};
