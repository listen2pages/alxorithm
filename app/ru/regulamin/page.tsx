import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Условия использования",
  description:
    "Условия использования alxorithm.com, права и обязанности пользователей, технические требования и регистрация.",
  alternates: {
    canonical: "/ru/regulamin", languages: languageAlternates("/ru/regulamin"),
  },
  openGraph: {
    title: "Условия использования — alxorithm.com",
    description:
      "Условия использования alxorithm.com, права и обязанности пользователей, технические требования и регистрация.",
    url: "https://alxorithm.com/ru/regulamin",
  },
};

export default function RegulaminPage() {
  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-brown mb-8 text-center">
          {" Условия использования alxorithm.com "}</h1>

        <div className="space-y-8 text-brand-brown/80 font-jakarta leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 1. Общие положения "}</h2>
            <p className="mb-2">
              {" Настоящие условия регулируют использование сайта по адресу"}{' '}
              <a
                href="https://alxorithm.com/ru"
                className="text-brand-orange hover:underline"
              >
                {" https://alxorithm.com/ "}</a>{' '}
              {"(далее «Сервис»)."}
            </p>
            <p className="mb-2">
              {" Владелец и администратор сервиса — Yousif Hussein Yousif, адрес: sabaly 62, 02-362 Варшава, осуществляющий незарегистрированную деятельность по статье 5 Закона Польши о предпринимателях от 6 марта 2018 года. Контакты:"}{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                {" yousifhussein1996@gmail.com "}</a>
              {", тел. +48 57844875 (далее «Поставщик услуг»)."}
            </p>
            <p>
              {" Сервис предоставляет инструменты управления продажами, рецептурами, складом и персоналом заведений общепита. "}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 2. Электронные услуги "}</h2>
            <p className="mb-4">
              {" Поставщик предоставляет через сайт следующие бесплатные услуги: "}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{"Создание и ведение аккаунта пользователя."}</li>
              <li>{"Доступ к интерактивному демо-режиму всех четырёх модулей Сервиса."}</li>
            </ul>
            <p className="mb-2">
              {" Инструменты управления заведением доступны по подписке, описанной на странице тарифа. "}</p>
            <p>
              {" Подписка стоимостью 400 PLN / месяц начинается с 7-дневного бесплатного пробного периода, автоматически продлевается каждый месяц и может быть отменена в любой момент до окончания пробного или текущего расчётного периода через платёжный портал Stripe или по электронной почте. "}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 3. Технические требования и регистрация "}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {" Для работы нужен доступ к интернету и стандартный браузер с включёнными cookies. "}</li>
              <li>{"Просмотр сервиса не требует регистрации."}</li>
              <li>
                {" Для создания аккаунта нужен email и пароль. Пользователь обязан указывать достоверные данные. "}</li>
              <li>
                {" Вход и создание аккаунта в Сервисе осуществляются без пароля с помощью аутентификации Google OAuth. "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 4. Права и обязанности "}</h2>
            <p className="mb-4">
              {" Пользователям запрещено размещать незаконный контент. "}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 5. Жалобы и отказ от договора "}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {" Жалобы на работу сервиса можно отправить по email:"}{' '}
                <a
                  href="mailto:yousifhussein1996@gmail.com"
                  className="text-brand-orange hover:underline"
                >
                  {" yousifhussein1996@gmail.com "}</a>
                .
              </li>
              <li>{"Жалобы рассматриваются в течение 14 дней."}</li>
              <li>
                {" Потребитель может отказаться от электронных услуг, например удалить аккаунт, в любое время без причины, связавшись с поставщиком. Для бесплатного информационного сервиса положения о возврате товаров не применяются. "}</li>
              <li>
                {" Отмена подписки в течение 7-дневного пробного периода означает отсутствие списания средств, а отмена активной подписки останавливает дальнейшие продления в конце оплаченного расчётного периода. "}</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
