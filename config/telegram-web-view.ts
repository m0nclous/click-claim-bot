const telegramWebView = {
    mtk: {
        entity: 'mtkbossbot',
        webViewUrl: 'https://clicker.fanschain.io',
        telegramInitData: (tgWebAppData: TelegramWebAppData) => encodeURIComponent(btoa(`"${tgWebAppData}"`)),
    },
};

type TelegramWebAppData = string;

export default telegramWebView;
