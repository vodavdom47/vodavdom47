export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Проверяем наличие настроек
        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
            return Response.json(
                { error: "Telegram не настроен" },
                { status: 500 }
            );
        }

        // Проверяем размер заявки
        const contentLength = Number(
            request.headers.get("content-length") || 0
        );

        if (contentLength > 10000) {
            return Response.json(
                { error: "Слишком большая заявка" },
                { status: 413 }
            );
        }

        // Получаем данные формы
        const data = await request.json();

        const name = String(data.name || "").trim().slice(0, 100);
        const phone = String(data.phone || "").trim().slice(0, 30);
        const region = String(data.region || "").trim().slice(0, 100);
        const message = String(data.message || "").trim().slice(0, 1000);

        // Проверяем обязательные поля
        if (!name || !phone) {
            return Response.json(
                { error: "Укажите имя и телефон" },
                { status: 400 }
            );
        }

        // Формируем сообщение
        const text = [
            "💧 НОВАЯ ЗАЯВКА — ВОДА В ДОМ",
            "",
            "👤 Имя: " + name,
            "📞 Телефон: " + phone,
            "📍 Район: " + region,
            "💬 Комментарий: " + (message || "Нет"),
            "",
            "🌐 Заявка с сайта"
        ].join("\n");

        // Отправляем в Telegram
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: env.TELEGRAM_CHAT_ID,
                    text: text
                })
            }
        );

        if (!telegramResponse.ok) {
            return Response.json(
                { error: "Не удалось отправить заявку" },
                { status: 502 }
            );
        }

        return Response.json({
            success: true,
            message: "Заявка отправлена"
        });

    } catch (error) {
        return Response.json(
            { error: "Ошибка обработки заявки" },
            { status: 500 }
        );
    }
}
