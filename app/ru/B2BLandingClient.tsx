import Link from "@/i18n/navigation";
import {
  ArrowRight,
  BarChart3,
  ChefHat,
  Package,
  Users,
  Check,
  Upload,
  Smartphone,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import LandingCharts from "./LandingCharts";

import "./landing.css";

const modules = [
  {
    id: "panel",
    icon: BarChart3,
    label: "01 / АНАЛИТИКА POS",
    title: "Ваши результаты. Наконец понятно.",
    text: "Загрузите CSV из POS и смотрите выручку, тенденции продаж и доступные данные о товарах. Переключайте месяцы вместо открытия новых таблиц.",
    href: "/demo/panel_demo",
    cta: "Посмотреть панель продаж",
  },
  {
    id: "kuchnia",
    icon: ChefHat,
    label: "02 / КУХНЯ",
    title: "Хорошее блюдо должно приносить прибыль.",
    text: "Свяжите рецептуры с ингредиентами на складе. Контролируйте себестоимость порции, цену продажи, НДС, маржу, аллергены и категории. При изменении цены ингредиента связанные затраты пересчитываются.",
    href: "/demo/kuchnia_demo",
    cta: "Посмотреть расходы кухни",
  },
  {
    id: "magazyn",
    icon: Package,
    label: "03 / СКЛАД",
    title: "Знайте, что покупаете. И что теряете.",
    text: "От кофе и масла до чистящих средств. Добавляйте товары и цены за килограмм, литр, штуку или упаковку. Записывайте поставки, расход, списания и заметки о закупках. Сравнивайте месяцы.",
    href: "/demo/magazyn_demo",
    cta: "Посмотреть склад",
  },
  {
    id: "personel",
    icon: Users,
    label: "04 / ПЕРСОНАЛ",
    title: "Команда и график, которые сходятся.",
    text: "Данные сотрудников, должности, почасовые или месячные ставки и план смен. Дни, часы и плановые расходы на персонал в одном месте. Планируйте до трёх месяцев вперёд.",
    href: "/demo/personel_demo",
    cta: "Посмотреть график и зарплаты",
  },
];
export const landingFaqs = [
  {
    q: "Для кого alxorithm?",
    a: "Для владельцев и управляющих ресторанов, кафе и баров. Управляйте продажами, кухней, складом и персоналом в браузере на английском, польском или русском.",
  },
  {
    q: "Как работает анализ данных POS?",
    a: "Экспортируйте данные POS в CSV и загрузите файлы для выбранного месяца. Система распознаёт столбцы и рассчитывает результаты по загруженным строкам. Отчёт зависит от содержимого: сводка чеков позволяет анализировать выручку, а для деталей по товарам нужны позиции продаж.",
  },
  {
    q: "Нужна ли готовая таблица рецептур?",
    a: "Нет. Товары склада и блюда можно добавлять вручную. На кухне можно загрузить документы, включая CSV, и проверить черновик перед сохранением. Недостающие цены, оценённые по рыночным источникам, помечены и доступны для исправления.",
  },
  {
    q: "Меняет ли цена ингредиента себестоимость блюда?",
    a: "Да. Рецептуры используют цены товаров на складе. Обновление цены пересчитывает себестоимость порции, прибыль и маржу связанных блюд. Предыдущие закупки сохраняют историческую цену.",
  },
  {
    q: "Можно пользоваться на телефоне и компьютере?",
    a: "Да. Войдите в аккаунт через браузер, чтобы открыть сохранённые данные на телефоне, планшете или компьютере. Переносить файлы графика между устройствами не нужно.",
  },
  {
    q: "Можно попробовать до подписки?",
    a: "Да. Интерактивное демо работает без входа и содержит примеры данных. Изучите каждый из четырёх модулей, прежде чем выбрать тариф.",
  },
];
function Actions({ light = false }: { light?: boolean }) {
  return (
    <div className="landing-actions">
      <Link
        href="/cennik"
        className={"landing-button " + (light ? "landing-button-light" : "")}
      >
        {" Выбрать подписку "}<ArrowRight size={18} />
      </Link>
      <Link
        href="/demo"
        className={
          "landing-button landing-secondary " +
          (light ? "landing-secondary-light" : "")
        }
      >
        {" Открыть бесплатное демо "}<ArrowRight size={18} />
      </Link>
    </div>
  );
}

export default function B2BLandingClient() {
  return (
    <div className="saas-landing">
      <main>
        <section
          className="landing-hero landing-wrap"
          aria-labelledby="landing-h1"
        >
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <span className="landing-dot" /> {" ДЛЯ РЕСТОРАНОВ, КАФЕ И БАРОВ "}</span>
            <h1 id="landing-h1">{"alxorithm"}</h1>
            <h2>
              {" Меньше таблиц. "}<br />
              {" Больше "}<span>{"контроля."}</span>
            </h2>
            <p>
              {" В вашем заведении много процессов. Объедините продажи, себестоимость блюд, склад и команду и верните время для управления бизнесом. "}</p>
            <Actions />
            <div className="landing-hero-notes">
              <span>
                <Check size={15} /> {" Демо без входа "}</span>
              <span>
                <Check size={15} /> {" На английском, польском и русском "}</span>
              <span>
                <Check size={15} /> {" На любом устройстве "}</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <LandingCharts />
            <div className="landing-insight">
              <span className="landing-insight-icon">
                <ChefHat size={21} />
              </span>
              <div>
                <strong>{"Изменилась цена ингредиента?"}</strong>
                <span>{"Узнайте, как это влияет на маржу блюда."}</span>
              </div>
              <ArrowRight size={19} />
            </div>
          </div>
        </section>
        <div className="landing-strip">
          <div className="landing-wrap">
            <span>{"Одно заведение. Полная картина."}</span>
            {modules.map((m) => (
              <Link key={m.id} href={"#" + m.id}>
                <m.icon size={18} />
                {m.id === "panel"
                  ? "Продажи"
                  : m.id === "kuchnia"
                    ? "Кухня"
                    : m.id === "magazyn"
                      ? "Склад"
                      : "Персонал"}
              </Link>
            ))}
          </div>
        </div>
        <section
          className="landing-section landing-wrap"
          aria-labelledby="pain-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"ЗНАКОМО?"}</span>
            <h2 id="pain-title">
              {" Полный зал не всегда "}<br />
              {" означает полную кассу. "}</h2>
            <p>
              {" Цены поставщиков растут. Изменения графика не заканчиваются. А реальная себестоимость блюда теряется в таблицах. "}</p>
          </div>
          <div className="landing-pains">
            {[
              [
                "01",
                "Маржа исчезает незаметно.",
                "Новая закупочная цена, прежняя цена в меню. Трудно заметить, когда блюдо перестаёт окупаться.",
                "Считайте себестоимость рецептур по складским ценам.",
              ],
              [
                "02",
                "Для списаний недостаточно заметок.",
                "Закупки, расход и выброшенные продукты. Без общей истории трудно понять, куда уходят деньги.",
                "Записывайте движения и сравнивайте расходы по месяцам.",
              ],
              [
                "03",
                "График хранится в разных местах.",
                "Листок в подсобке, сообщение в телефоне, отдельный файл со ставками. Каждое изменение требует новых расчётов.",
                "Объедините смены, часы и плановые зарплаты.",
              ],
            ].map(([number, title, pain, answer]) => (
              <article className="landing-pain" key={number}>
                <span className="landing-number">{number}</span>
                <h3>{title}</h3>
                <p>{pain}</p>
                <div>
                  <Check size={18} />
                  <span>{answer}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="funkcje"
          className="landing-section landing-product-section"
          aria-labelledby="features-title"
        >
          <div className="landing-wrap">
            <div className="landing-section-heading">
              <span className="landing-eyebrow">
                {" ЧЕТЫРЕ МОДУЛЯ. ОДИН АККАУНТ. "}</span>
              <h2 id="features-title">
                {" От первого чека "}<br />
                {" до последней смены. "}</h2>
              <p>
                {" Откройте модуль и посмотрите, как может выглядеть ежедневная работа с данными вашего заведения. "}</p>
            </div>
            <div className="landing-modules">
              {modules.map((m) => (
                <article
                  key={m.id}
                  id={m.id}
                  className={"landing-module landing-module-" + m.id}
                >
                  <div className="landing-module-copy">
                    <span className="landing-eyebrow">
                      <m.icon size={18} />
                      {m.label}
                    </span>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <Link href={m.href} className="landing-text-link">
                      {m.cta}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                  <div
                    className="landing-module-preview"
                    aria-label="Пример данных модуля"
                  >
                    {m.id === "panel" ? (
                      <LandingCharts compact />
                    ) : m.id === "kuchnia" ? (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Рецептура · пример"}</span>
                          <ChefHat size={19} />
                        </div>
                        <h4>{"Томатный крем-суп"}</h4>
                        <span className="landing-pill">
                          {" Супы · НДС 8% · аллерген: молоко "}</span>
                        <div className="landing-recipe-numbers">
                          <div>
                            <small>{"Цена с НДС"}</small>
                            <strong>{"24,00 PLN"}</strong>
                          </div>
                          <div>
                            <small>{"Себестоимость порции"}</small>
                            <strong>{"6,40 PLN"}</strong>
                          </div>
                          <div>
                            <small>{"Валовая маржа"}</small>
                            <strong>73,3%</strong>
                          </div>
                        </div>
                        <div className="landing-cost-track">
                          <span />
                        </div>
                        <p className="landing-caption">
                          {" Себестоимость порции / цена продажи с НДС "}</p>
                        <div className="landing-mini-row">
                          <span>{"Помидоры · 250 г"}</span>
                          <strong>{"3,00 PLN"}</strong>
                        </div>
                        <div className="landing-mini-row">
                          <span>{"Другие ингредиенты"}</span>
                          <strong>{"3,40 PLN"}</strong>
                        </div>
                      </>
                    ) : m.id === "magazyn" ? (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Склад · пример"}</span>
                          <Package size={19} />
                        </div>
                        <h4>{"Каждая единица имеет значение."}</h4>
                        {[
                          [
                            "Рапсовое масло",
                            "12,00 PLN / 0,9 л",
                            "13,33 PLN / л",
                          ],
                          ["Соль", "20,00 PLN / 900 г", "22,22 PLN / кг"],
                          [
                            "Туалетная бумага",
                            "30,00 PLN / 12 шт.",
                            "2,50 PLN / шт.",
                          ],
                        ].map(([name, pack, unit]) => (
                          <div className="landing-stock-row" key={name}>
                            <span className="landing-stock-icon">
                              <Package size={19} />
                            </span>
                            <div>
                              <strong>{name}</strong>
                              <small>{pack}</small>
                            </div>
                            <span>{unit}</span>
                          </div>
                        ))}
                        <div className="landing-note">
                          <Check size={16} /> {" Поставка записана в истории закупок "}</div>
                      </>
                    ) : (
                      <>
                        <div className="landing-preview-top">
                          <span>{"График · пример"}</span>
                          <CalendarDays size={19} />
                        </div>
                        <h4>{"Ваша неделя. Без догадок."}</h4>
                        <div
                          className="landing-week"
                          aria-label="Пример графика Анны"
                        >
                          <span>
                            {" Анна "}<br />
                            <small>{"Кухня"}</small>
                          </span>
                          {["ПН", "ВТ", "СР", "ЧТ", "ПТ"].map((day, i) => (
                            <div key={day}>
                              <small>{day}</small>
                              <span className={i === 2 ? "off" : ""}>
                                {i === 2 ? "Выходной" : "9–17"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="landing-recipe-numbers">
                          <div>
                            <small>{"Часы за вычетом перерывов"}</small>
                            <strong>{"30 ч"}</strong>
                          </div>
                          <div>
                            <small>{"Ставка до вычетов"}</small>
                            <strong>{"30 PLN / ч"}</strong>
                          </div>
                        </div>
                        <div className="landing-pay-total">
                          <span>{"Плановая зарплата"}</span>
                          <strong>{"900,00 PLN"}</strong>
                        </div>
                        <p className="landing-caption">
                          {" 4 смены по 8 ч, по 30 мин перерыва. Пример данных. "}</p>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="jak-to-dziala"
          className="landing-section landing-wrap"
          aria-labelledby="steps-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"ПРОСТОЙ СТАРТ"}</span>
            <h2 id="steps-title">
              {" Ваши данные уже есть. "}<br />
              {" Сделайте их понятными. "}</h2>
          </div>
          <div className="landing-steps">
            {[
              {
                icon: Upload,
                n: "01",
                title: "Добавьте данные",
                text: "Загрузите CSV из POS. Добавьте товары склада и команду, внесите рецептуры вручную или импортируйте для проверки.",
              },
              {
                icon: BarChart3,
                n: "02",
                title: "Посмотрите, что происходит",
                text: "Перейдите от строк к графикам, карточкам товаров и расписанию. Сравнивайте месяцы и находите причины расходов.",
              },
              {
                icon: Smartphone,
                n: "03",
                title: "Управляйте откуда угодно",
                text: "Измените цену, запишите поставку или исправьте график. Откройте данные после входа на телефоне, планшете или компьютере.",
              },
            ].map((s) => (
              <article key={s.n}>
                <div>
                  <s.icon size={23} />
                  <span>{s.n}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="landing-account landing-wrap"
          aria-labelledby="account-title"
        >
          <div>
            <span className="landing-eyebrow">{"ОТ ПОДСОБКИ ДО ЗАЛА"}</span>
            <h2 id="account-title">
              {" Ваше заведение не помещается "}<br />
              {" за одним столом. "}</h2>
            <p>
              {" И ваши данные тоже не должны. Один аккаунт и сохранённая информация в браузере без отправки себе очередной версии Excel. "}</p>
            <Link className="landing-text-link" href="/demo">
              {" Посмотреть в действии "}<ArrowRight size={18} />
            </Link>
          </div>
          <div className="landing-device">
            <div className="landing-device-bar">
              <span />
              <span />
              <span />
              <small>{"alxorithm / склад"}</small>
            </div>
            <div className="landing-device-content">
              <Package size={28} />
              <strong>{"Порядок на складе."}</strong>
              <span>{"Те же данные в вашем аккаунте."}</span>
              <div className="landing-device-lines">
                <i />
                <i />
                <i />
              </div>
              <span className="landing-pill">
                <Check size={14} /> {" Сохранено "}</span>
            </div>
            <div className="landing-phone">
              <Smartphone size={24} />
              <span>
                {" Ваше заведение "}<br />
                <strong>{"под рукой."}</strong>
              </span>
            </div>
          </div>
        </section>
        <section
          className="landing-section landing-wrap landing-faq"
          aria-labelledby="faq-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"ПЕРЕД НАЧАЛОМ"}</span>
            <h2 id="faq-title">{"Несколько хороших вопросов."}</h2>
          </div>
          <div>
            {landingFaqs.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <ChevronDown size={19} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section
          id="cennik"
          className="landing-final"
          aria-labelledby="cta-title"
        >
          <div className="landing-wrap">
            <span className="landing-eyebrow">
              {" МЕНЬШЕ РАСЧЁТОВ ПОСЛЕ РАБОТЫ. "}</span>
            <h2 id="cta-title">
              {" Займитесь своим заведением. "}<br />
              {" Держите цифры под рукой. "}</h2>
            <p>
              {" Изучите четыре модуля в демо. Выберите подписку и начните работать с данными своего бизнеса. "}</p>
            <Actions light />
            <small>{"Демо бесплатно и не требует входа."}</small>
          </div>
        </section>
      </main>
      <footer className="landing-footer landing-wrap">
        <div>
          <strong>{"alxorithm"}</strong>
          <p>{"Программа для управления рестораном."}</p>
        </div>
        <nav aria-label="Подвал сайта">
          <Link href="/demo">{"Демо"}</Link>
          <Link href="/polityka-prywatnosci">{"Конфиденциальность"}</Link>
          <Link href="/regulamin">{"Условия"}</Link>
        </nav>
      </footer>
    </div>
  );
}
