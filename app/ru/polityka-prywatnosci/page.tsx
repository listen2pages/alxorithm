import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Политика конфиденциальности и cookies",
  description:
    "Узнайте, как мы защищаем данные, какую информацию собираем и зачем обрабатываем её согласно GDPR.",
  alternates: {
    canonical: "/ru/polityka-prywatnosci", languages: languageAlternates("/ru/polityka-prywatnosci"),
  },
  openGraph: {
    title: "Политика конфиденциальности и cookies — alxorithm.com",
    description:
      "Узнайте, как мы защищаем данные, какую информацию собираем и зачем обрабатываем её согласно GDPR.",
    url: "https://alxorithm.com/ru/polityka-prywatnosci",
  },
};

export default function PolitykaPrywatnosciPage() {
  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-brown mb-8 text-center">
          {" Политика конфиденциальности и cookies "}</h1>

        <div className="space-y-8 text-brand-brown/80 font-jakarta leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 1. Оператор персональных данных "}</h2>
            <p>
              {" Оператор персональных данных — Yousif Hussein Yousif, адрес: sabaly 62, 02-362 Варшава (незарегистрированная деятельность). Связь по электронной почте:"}{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                {" yousifhussein1996@gmail.com "}</a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 2. Какие данные обрабатываются и зачем? (GDPR) "}</h2>
            <p className="mb-4">{"Мы обрабатываем данные для следующих целей:"}</p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>{"Аккаунт и аутентификация:"}</strong> {" При регистрации мы обрабатываем email, имя пользователя и пароль. Правовое основание — исполнение договора (статья 6(1)(b) GDPR). "}</li>
              <li>
                <strong>{"Вход через Google OAuth:"}</strong> {" Аутентификация выполняется без пароля через аккаунт Google (OAuth 2.0), который передаёт адрес электронной почты, имя и необязательный аватар профиля. "}</li>
              <li>
                <strong>{"Заведения общепита (B2B):"}</strong> {" У представителей ресторанов собираем сведения для проверки и создания панели: данные компании, налоговый номер, адрес и контакты. "}</li>
              <li>
                <strong>{"Оплата подписки и пробный период:"}</strong> {" Платёжные данные и статус 7-дневного пробного периода и подписки обрабатываются для исполнения договора и бухгалтерских обязательств (ст. 6 п. 1 лит. b и c GDPR). "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 3. Кому передаются ваши данные? "}</h2>
            <p className="mb-4">
              {" Данные защищены; для оказания услуг мы используем доверенных подрядчиков: "}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{"Поставщики IT и хостинга:"}</strong> {" Данные, включая данные входа, хранятся на защищённых серверах облачных и базовых провайдеров. Сервис использует инфраструктуру Supabase. "}</li>
              <li>
                <strong>{"Платёжный оператор Stripe:"}</strong> {" Оплата картами, 7-дневный пробный период и портал управления подпиской обрабатываются компанией Stripe Payments Europe, Ltd. Данные банковских карт передаются напрямую в Stripe и не хранятся на серверах Сервиса. "}</li>
              <li>
                <strong>{"Сервисы ИИ (Google Gemini API и Google Search Grounding):"}</strong> {" При автоматическом определении столбцов POS и импорте документов меню/кухни отдельные фрагменты загруженных файлов анализируются моделью Google Gemini для сопоставления столбцов или черновиков рецептур. Итоговые финансовые отчёты всегда рассчитываются детерминированно на стороне Сервиса. "}</li>
              <li>
                <strong>{"Аналитические инструменты:"}</strong> {" Мы можем собирать обезличенные данные о посещениях сайта. "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 4. Ваши права "}</h2>
            <p className="mb-4">{"Согласно GDPR, вы вправе:"}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{"Получить доступ к данным и их копию."}</li>
              <li>{"Исправить свои данные."}</li>
              <li>
                {" Удалить данные (право на забвение), например запросив удаление аккаунта. "}</li>
              <li>{"Ограничить обработку и возразить против неё."}</li>
              <li>{"Отозвать согласие на обработку в любое время."}</li>
            </ul>
            <p>
              {" Для реализации прав напишите:"}{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                {" yousifhussein1996@gmail.com "}</a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 5. Политика cookies "}</h2>
            <p className="mb-4">
              {" Сервис использует cookies для корректной работы, включая необходимые для сохранения сеанса входа. "}</p>
            <p className="mb-4">
              {" Мы также используем аналитические cookies для изучения посещений и улучшения навигации. "}</p>
            <p>
              {" Настройки cookies можно изменить в браузере в любое время. "}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
