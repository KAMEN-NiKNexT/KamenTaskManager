using Telegram.Bot;
using Telegram.Bot.Types.ReplyMarkups;

var botClient = new TelegramBotClient("7836871253:AAHkr42Xeu3yzldzSFnYQmOyOZEPmHyWFDw");

// ���������� ��������� � �������
await botClient.SendTextMessageAsync(
    chatId: "1",
    text: "������� ������, ����� ������� ����-����������:",
    replyMarkup: new InlineKeyboardMarkup(
        InlineKeyboardButton.WithWebApp(
            text: "������� ����-����������",
            webApp: new WebAppInfo { Url = "https://example.com" }
        )
    )
);
