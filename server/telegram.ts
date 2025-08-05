import type { ShipmentRequest } from "@shared/schema";

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: string;
}

export class TelegramNotificationService {
  private botToken: string;
  private chatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    this.chatId = process.env.TELEGRAM_CHAT_ID || "";
  }

  async sendNewRequestNotification(request: ShipmentRequest): Promise<void> {
    if (!this.botToken || !this.chatId) {
      console.warn("Telegram credentials not configured, skipping notification");
      return;
    }

    const categoryText = request.category === 'astana' ? '🏢 Астана' : '🚛 Межгород';
    const statusEmoji = this.getStatusEmoji(request.status);
    
    const message = `
🔔 *Новая заявка на перевозку*

📋 *Номер заявки:* \`${request.requestNumber}\`
📦 *Категория:* ${categoryText}
${statusEmoji} *Статус:* ${this.getStatusText(request.status)}

📦 *Груз:* ${request.cargoName}
${request.cargoWeightKg ? `⚖️ *Вес:* ${request.cargoWeightKg} кг` : ''}
${request.cargoVolumeM3 ? `📏 *Объем:* ${request.cargoVolumeM3} м³` : ''}

📍 *Загрузка:* ${request.loadingAddress}
${request.loadingCity ? `🏙️ *Город загрузки:* ${request.loadingCity}` : ''}

📍 *Выгрузка:* ${request.unloadingAddress}
${request.unloadingCity ? `🏙️ *Город выгрузки:* ${request.unloadingCity}` : ''}

${request.loadingContactPerson ? `👤 *Контакт загрузки:* ${request.loadingContactPerson}` : ''}
${request.loadingContactPhone ? `📞 ${request.loadingContactPhone}` : ''}

${request.unloadingContactPerson ? `👤 *Контакт выгрузки:* ${request.unloadingContactPerson}` : ''}
${request.unloadingContactPhone ? `📞 ${request.unloadingContactPhone}` : ''}

${request.desiredShipmentDatetime ? `📅 *Желаемая дата:* ${new Date(request.desiredShipmentDatetime).toLocaleString('ru-RU')}` : ''}

${request.specialRequirements ? `⚠️ *Особые требования:* ${request.specialRequirements}` : ''}
${request.notes ? `📝 *Примечания:* ${request.notes}` : ''}

🕐 *Создана:* ${new Date(request.createdAt!).toLocaleString('ru-RU')}

🔗 *Для обработки:* /dashboard
    `.trim();

    await this.sendMessage(message);
  }

  async sendStatusUpdateNotification(request: ShipmentRequest, oldStatus: string, newStatus: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      return;
    }

    const statusEmoji = this.getStatusEmoji(newStatus);
    const message = `
🔄 *Статус заявки изменен*

📋 *Номер:* \`${request.requestNumber}\`
📦 *Груз:* ${request.cargoName}

📈 *Статус изменен:*
${this.getStatusEmoji(oldStatus)} ${this.getStatusText(oldStatus)} → ${statusEmoji} ${this.getStatusText(newStatus)}

🕐 *Время обновления:* ${new Date().toLocaleString('ru-RU')}
    `.trim();

    await this.sendMessage(message);
  }

  private async sendMessage(text: string): Promise<void> {
    try {
      const message: TelegramMessage = {
        chat_id: this.chatId,
        text: text,
        parse_mode: 'Markdown'
      };

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Telegram API error:', error);
      } else {
        console.log('Telegram notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  private getStatusEmoji(status: string): string {
    const statusEmojis: Record<string, string> = {
      'new': '🆕',
      'processing': '⚙️',
      'assigned': '👨‍💼',
      'transit': '🚛',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return statusEmojis[status] || '📋';
  }

  private getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'new': 'Новая',
      'processing': 'В обработке',
      'assigned': 'Назначена',
      'transit': 'В пути',
      'delivered': 'Доставлена',
      'cancelled': 'Отменена'
    };
    return statusTexts[status] || status;
  }

  async testConnection(): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      return response.ok;
    } catch (error) {
      console.error('Telegram connection test failed:', error);
      return false;
    }
  }
}

export const telegramService = new TelegramNotificationService();