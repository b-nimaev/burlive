<template>
  <div class="page home-page">
    <header>
      <div class="container">
        <h2 class="mb-0">Дорожная карта</h2>
        <p>
          Наша платформа предлагает уникальную возможность изучения языка и
          вовлечения в создание его будущего.
        </p>
        <div style="width: 500px" class="mt-5">
          <h4>Цель проекта:</h4>
          <p>
            разработка и внедрение русско-бурятского переводчика,
            поддерживаемого активным сообществом носителей бурятского языка, для
            сохранения культурного наследия и облегчения изучения бурятского
            языка новыми поколениями.
          </p>
        </div>
        <!-- <button class="btn btn-dark">Присоединиться</button> -->
      </div>
    </header>

    <main id="roadmap">
      <section>
        <div class="container">
          <h4>Этап 1: Исследование и планирование</h4>
          <ul>
            <li>Определение требований и функционала.</li>
            <li>Исследование технологий и инструментов.</li>
            <li>Разработка концепции реферальной системы.</li>
            <li>Создание начальной структуры API и телеграмм-бота.</li>
            <li>Оценка юридических и регуляторных аспектов.</li>
          </ul>
        </div>
      </section>
      <section>
        <div class="container">
          <h4>Этап 2: Разработка и запуск реферальной системы</h4>
          <ul>
            <li>Разработка реферальной системы в телеграмм-боте.</li>
            <li>Тестирование и запуск реферальной программы.</li>
            <li>
              Сбор обратной связи от первых пользователей и корректировка
              системы.
            </li>
          </ul>
        </div>
      </section>
      <section>
        <div class="container">
          <h4>Этап 3: Сбор данных и обучение модели</h4>
          <ul>
            <li>Организация кампаний по сбору данных.</li>
            <li>
              Разработка интерфейсов для сбора данных в телеграмм-боте и на
              сайте.
            </li>
            <li>Проверка и верификация собранных данных.</li>
            <li>
              Обучение модели машинного перевода и начальное тестирование.
            </li>
            <li>Корректировка модели на основе полученных результатов.</li>
          </ul>
        </div>
      </section>
      <section>
        <div class="container">
          <h4>Этап 4: Развитие инфраструктуры</h4>
          <ul>
            <li>Доработка и оптимизация API для интеграции переводчика.</li>
            <li>Разработка и тестирование сайта с функционалом перевода.</li>
            <li>Интеграция переводчика в телеграмм-бот и сайт.</li>
            <li>
              Обеспечение безопасности данных и стабильности работы системы.
            </li>
          </ul>
        </div>
      </section>
      <section>
        <div class="container">
          <h4>Этап 5: Продвижение и масштабирование</h4>
          <ul>
            <li>
              Запуск маркетинговой кампании для привлечения новых пользователей.
            </li>
            <li>
              Заключение партнерств с образовательными и культурными
              учреждениями.
            </li>
            <li>
              Постоянное улучшение модели перевода и добавление новых функций.
            </li>
            <li>
              Организация мероприятий и акций для повышения вовлеченности
              пользователей.
            </li>
            <li>
              Мониторинг и анализ эффективности проекта для дальнейшего
              развития.
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
header {
  padding: 50px 0;
}

#roadmap {
  section {
    margin-bottom: 3rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
p,
ul li {
  font-size: 1rem;
}
</style>

<script lang="ts" setup>
useSeoMeta({
  title: "Дорожная карта",
});
</script>
