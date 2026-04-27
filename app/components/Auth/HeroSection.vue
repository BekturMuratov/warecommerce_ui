<template>
  <section class="hero">

    <div class="overlay"></div>

    <div class="container">
      <div class="content">

        <v-chip
          class="mb-4 bg-svh-primary text-white"
          size="small"
        >
          Нормативно-правовая база
        </v-chip>

        <h1 class="title">
          Автоматизация учета товаров на
          Складах Временного Хранения
        </h1>

        <p class="subtitle">
          Данный сервис разработан в целях реализации требований
          Постановления Правительства Кыргызской Республики
          от 13 февраля 2020 года №79.
        </p>

        <p class="subtitle2">
          Система обеспечивает автоматизированный учет товаров и транспортных средств,
          формирование отчетности по формам ДО-1 и ДО-2,
          а также прозрачный мониторинг сроков временного хранения.
        </p>

        <div class="info-grid">

          <div>
            <h4>История решения</h4>
            <p class="text-gray-400">
              Переход от бумажных журналов к цифровому контролю
              в рамках упрощения таможенных процедур ЕАЭС.
            </p>
          </div>

          <div>
            <h4>Функционал</h4>
            <p class="text-gray-400">
              Контроль въезда АТС, проверка ИНН владельцев,
              автоматическая верификация статуса таможенной очистки.
            </p>
          </div>

        </div>

      </div>

      <div class="technical-support glass-effect">
        <h4 class="support-title">Техническая поддержка</h4>

        <p class="support-item">
          📞 +996 (312) 51-24-00
        </p>

        <p class="support-item">
          ✉️ support@ais-svh.kg
        </p>
      </div>

    </div>

  </section>
</template>

<style scoped>
.hero{
  position:relative;
  min-height:100vh;
  background-image:url('../../assets/img/warehouse.png');
  background-size:cover;
  background-position:center;
  display:flex;
  align-items:center;
}

.overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(
    90deg,
    rgba(8,20,40,0.85),
    rgba(8,20,40,0.6)
  );
}

.container{
  position:relative;
  width:100%;
  max-width:1200px;
  margin:0 auto;
  padding:40px;

  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:40px;
}

.content{
  max-width:700px;
  color:white;
}

.title{
  font-size:40px;
  font-weight:700;
  line-height:1.2;
  margin-bottom:20px;
}

.subtitle{
  opacity:.85;
  margin-bottom:24px;
  font-size:18px;
}

.subtitle2{
  opacity:.85;
  margin-bottom:40px;
  font-size:18px;
}

.info-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:24px;
}

.info-grid h4{
  text-transform:uppercase;
  margin-bottom:8px;
  font-weight:600;
}

.info-grid p{
  font-size:14px;
  opacity:.8;
}

/* SUPPORT */

.technical-support{
  border:1px solid hsla(0,0%,100%,.2);
  border-radius:8px;
  color:#fff;
  min-width:240px;
  padding:25px;
}

.glass-effect{
  background:rgba(17,24,39,0.8);
  backdrop-filter:blur(10px);
}

.support-title{
  font-size:12px;
  font-weight:700;
  text-transform:uppercase;
  color:rgba(255,255,255,0.6);
  margin-bottom:8px;
}

.support-item{
  font-size:14px;
  margin-bottom:4px;
}

.bg-svh-primary{
  background-color:#2563EB !important;
}

.text-gray-400{
  color:rgba(255,255,255,0.6);
}

/* TABLET */

@media (max-width:1200px){

  .title{
    font-size:32px;
  }

}

/* MOBILE */

@media (max-width:960px){

  .container{
    flex-direction:column;
    align-items:flex-start;
    padding:32px 20px;
  }

  .title{
    font-size:26px;
  }

  .subtitle,
  .subtitle2{
    font-size:16px;
  }

  .info-grid{
    grid-template-columns:1fr;
  }

  .technical-support{
    width:100%;
    margin-top:30px;
  }

}

</style>