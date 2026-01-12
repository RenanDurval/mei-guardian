// Mock Service for WhatsApp Notifications
// In a real scenario, this would integrate with Twilio, WPPConnect, or Meta API

exports.sendNotification = async (phoneNumber, message) => {
    console.log(`\n================================`);
    console.log(`📱 [WHATSAPP MOCK] Sending to ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    console.log(`================================\n`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, timestamp: new Date() };
};
