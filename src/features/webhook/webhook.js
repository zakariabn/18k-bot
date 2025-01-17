/*
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const webhookId = 'YOUR_WEBHOOK_ID'; // Replace with your Webhook ID
const webhookToken = 'YOUR_WEBHOOK_TOKEN'; // Replace with your Webhook Token

const rest = new REST({ version: '10' }).setToken(webhookToken);

async function sendMessage() {
    const data = {
        content: 'Hello from my webhook!', // Message content
        username: 'Webhook Bot', // Custom username for the webhook (optional)
        avatar_url: 'https://example.com/avatar.png' // Custom avatar for the webhook (optional)
    };

    try {
        await rest.post(Routes.webhook(webhookId, webhookToken), { body: data });
        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

sendMessage();

*/
