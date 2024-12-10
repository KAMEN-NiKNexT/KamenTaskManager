using Telegram.Bot;
using Telegram.Bot.Types.ReplyMarkups;

var botClient = new TelegramBotClient("7836871253:AAHkr42Xeu3yzldzSFnYQmOyOZEPmHyWFDw");

// Отправляем сообщение с кнопкой
await botClient.SendTextMessageAsync(
    chatId: "1",
    text: "Нажмите кнопку, чтобы открыть мини-приложение:",
    replyMarkup: new InlineKeyboardMarkup(
        InlineKeyboardButton.WithWebApp(
            text: "Открыть мини-приложение",
            webApp: new WebAppInfo { Url = "https://example.com" }
        )
    )
);
