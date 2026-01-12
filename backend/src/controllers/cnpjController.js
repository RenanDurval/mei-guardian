const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require('../services/whatsappService');

exports.addCnpj = async (req, res) => {
    try {
        const { cnpj, legalName, tradeName } = req.body;
        const userId = req.user.userId; // From JWT middleware

        const newCnpj = await prisma.cnpj.create({
            data: {
                userId,
                cnpj,
                legalName: legalName || 'MEI - ' + cnpj,
                tradeName: tradeName || 'Minha Empresa',
                status: 'ACTIVE' // Mock initial status
            }
        });

        await whatsappService.sendNotification(
            '5511999999999', // Would be user phone
            `Bem-vindo! O CNPJ ${cnpj} agora está sendo monitorado pelo MEI Guardian.`
        );

        res.status(201).json(newCnpj);
    } catch (error) {
        console.error('Error adding CNPJ:', error);
        res.status(500).json({ error: 'Error adding CNPJ' });
    }
};

exports.listCnpjs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cnpjs = await prisma.cnpj.findMany({
            where: { userId },
            include: { dasList: true } // Include DAS history
        });
        res.json(cnpjs);
    } catch (error) {
        console.error('Error listing CNPJs:', error);
        res.status(500).json({ error: 'Error listing CNPJs' });
    }
};

exports.syncStatus = async (req, res) => {
    // Mock external API call to Receita Federal
    const { id } = req.params;

    try {
        // Randomly change status for demo purposes if desired, or keep Active
        const cnpj = await prisma.cnpj.update({
            where: { id },
            data: { lastCheck: new Date() }
        });

        res.json({ message: 'CNPJ Status synced', status: cnpj.status });
    } catch (error) {
        res.status(500).json({ error: 'Sync failed' });
    }
};
