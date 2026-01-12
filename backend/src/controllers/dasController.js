const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require('../services/whatsappService');

exports.generateDasForYear = async (req, res) => {
    // Creating mock DAS for the current year
    try {
        const { cnpjId } = req.body;
        const year = new Date().getFullYear();
        const mockAmount = 75.00; // Average MEI tax

        const dasList = [];

        for (let month = 1; month <= 12; month++) {
            // Logic to determine if paid (past months) or pending (future)
            const now = new Date();
            const dueDate = new Date(year, month - 1, 20); // Due 20th of each month
            let status = 'PENDING';

            if (dueDate < now) {
                // Randomly mark past ones as PAID or OVERDUE for demo
                status = Math.random() > 0.2 ? 'PAID' : 'OVERDUE';
            }

            const das = await prisma.das.create({
                data: {
                    cnpjId,
                    month,
                    year,
                    amount: mockAmount,
                    dueDate,
                    status,
                    barcode: '89600000000-1 23123123123-1 12312312312-1 12312312312-3'
                }
            });
            dasList.push(das);
        }

        res.json({ message: `Generated DAS for ${year}`, count: dasList.length });
    } catch (error) {
        console.error('DAS Generation Error', error);
        res.status(500).json({ error: 'Failed to generate DAS' });
    }
};

exports.listDas = async (req, res) => {
    try {
        const { cnpjId } = req.query;
        if (!cnpjId) return res.status(400).json({ error: 'cnpjId required' });

        const list = await prisma.das.findMany({
            where: { cnpjId },
            orderBy: { month: 'asc' }
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching DAS' });
    }
};

exports.simulatePay = async (req, res) => {
    try {
        const { id } = req.params;
        const das = await prisma.das.update({
            where: { id },
            data: { status: 'PAID' }
        });

        await whatsappService.sendNotification(
            '5511999999999',
            `Obrigado! O pagamento do DAS referente a ${das.month}/${das.year} foi confirmado.`
        );

        res.json(das);
    } catch (error) {
        res.status(500).json({ error: 'Payment simulation failed' });
    }
};
