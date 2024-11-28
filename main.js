async function fetchMinecraftStatus() {
  try {
    const response = await fetch("http://localhost:3000/get-server-status");
    const data = await response.json();

    if (data.success) {
      document.getElementById("serveronline").textContent = `Онлайн: ${data.players}`; // Обновляем на количество игроков
    } else {
      document.getElementById("serveronline").textContent =
        "Сервер не доступен";
    }
  } catch (error) {
    console.error("Ошибка:", error);
    document.getElementById("serveronline").textContent = "Ошибка подключения";
  }
}

// Запускаем функцию при загрузке страницы
fetchMinecraftStatus();

async function fetchMinecraftStatus1() {
  try {
    const response = await fetch("http://localhost:3000/get-server-status");
    const data = await response.json();

    if (data.success) {
      document.getElementById("serveronline1").textContent = `Онлайн: ${data.players}`; // Обновляем на количество игроков
    } else {
      document.getElementById("serveronline1").textContent =
        "Сервер не доступен";
    }
  } catch (error) {
    console.error("Ошибка:", error);
    document.getElementById("serveronline1").textContent = "Ошибка подключения";
  }
}

// Запускаем функцию при загрузке страницы
fetchMinecraftStatus1();

// Скрипт для управления бургер меню
document.addEventListener("DOMContentLoaded", () => {
  const burgerIcon = document.getElementById("burger-icon");
  const menu = document.getElementById("burgermenu");

  // Обработчик клика на иконку
  burgerIcon.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  // Закрытие меню при клике вне его области (опционально)
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && event.target !== burgerIcon) {
      menu.classList.remove("active");
    }
  });
});

const getFirstFormInput = document.getElementById("nickname");
const getSecondFormInput = document.getElementById("email");
const getPromoFormInput = document.getElementById("promo");
const getCheckboxForm = document.getElementById("check-box_privacy");
const getSubmitButton = document.getElementById("submitbutton");

function checkFormValidity() {
  // Выполняем проверку в следующем цикле событий
  setTimeout(() => {
    if (
      getFirstFormInput.value.trim() !== "" &&
      getSecondFormInput.value.trim() !== "" &&
      getCheckboxForm.checked
    ) {
      getSubmitButton.disabled = false; // Активируем кнопку
    } else {
      getSubmitButton.disabled = true; // Деактивируем кнопку
    }
  }, 0);
}

// Добавляем обработчики событий для полей и чекбокса
getFirstFormInput.addEventListener("input", checkFormValidity);
getSecondFormInput.addEventListener("input", checkFormValidity);
getCheckboxForm.addEventListener("change", checkFormValidity); // Изменение здесь

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".products__btn");
  const cardsContainer = document.getElementById("cardsContainer");
  const modal = document.getElementById("paymentform1");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrice = document.getElementById("modalPrice");
  const form = document.getElementById("donationForm");

  async function loadPrivileges() {
    try {
      const response = await fetch("/bluespace1/privileges.json");
      const privileges = await response.json();

      // Отображаем карточки для категории "Привилегии" по умолчанию
      renderCards(privileges, "Привилегии");

      // Настраиваем обработчики для кнопок
      setupCategorySwitching(privileges);
      setupModalHandler(privileges);
    } catch (error) {
      console.error("Ошибка загрузки привилегий:", error);
    }
  }

  let isRendering = false; // Флаг для предотвращения дублирования

  let renderQueue = Promise.resolve(); // Очередь задач

  let currentCategory = ""; // Начальное значение для текущей категории

  function renderCards(privileges, category = "Привилегии") {
    if (category === currentCategory) return; // Если категория не изменилась, выходим
    currentCategory = category; // Обновляем текущую категорию

    renderQueue = renderQueue.then(() => {
      if (isRendering) return;
      isRendering = true;

      const container = document.querySelector(
        "#cardsContainer .cards-container__row"
      );

      const existingCardIds = new Set(
        Array.from(container.children).map((card) =>
          parseInt(card.dataset.id, 10)
        )
      );

      const newPrivileges = privileges.filter((p) => p.category === category);
      const newIds = newPrivileges.map((p) => p.id);

      const removalPromises = Array.from(container.children).map((card) => {
        const id = parseInt(card.dataset.id, 10);
        if (!newIds.includes(id)) {
          card.classList.add("hidden");
          return new Promise((resolve) => {
            setTimeout(() => {
              card.remove();
              resolve();
            }, 200);
          });
        }
        return Promise.resolve();
      });

      return Promise.all(removalPromises).then(() => {
        container.innerHTML = ""; // Убираем старые карточки перед добавлением новых

        newPrivileges.forEach((privilege) => {
          const truncatedTitle =
            privilege.title.length > 15
              ? privilege.title.slice(0, 15) + ".."
              : privilege.title;

          const card = document.createElement("div");
          card.className = "card hidden";
          card.dataset.id = privilege.id;
          card.innerHTML = `
          <div class="img" style="background: url('${privilege.image}') center/cover no-repeat"></div>
          <div class="title"><h3>${truncatedTitle}</h3></div>
          <div class="item">
            <button type="button" class="btn">${privilege.price}₽</button>
            <button type="button" data-id="${privilege.id}" class="card__button btn-hover">
            Купить
            </button>
            <div class="card__last-element"></div>
          </div>
        `;

          container.appendChild(card);

          setTimeout(() => {
            card.classList.remove("hidden");
          }, 200);
        });

        if (newPrivileges.length === 0) {
          container.innerHTML = `<div class="nothing-cards">Нет доступных карточек в данной категории. Администратор сайта должен добавить их.</div>`;
        }

        isRendering = false;
      });
    });
  }

  function setupCategorySwitching(privileges) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const category = button.dataset.target;
        renderCards(privileges, category);
        setupModalHandler(privileges); // Перенастройка модальных кнопок при переключении категорий
      });
    });
  }

  function setupModalHandler(privileges) {
    cardsContainer.addEventListener("click", (event) => {
      const button = event.target.closest(".card__button");
      if (button) {
        const id = parseInt(button.dataset.id, 10);
        const privilege = privileges.find((p) => p.id === id);
        const checkPrivilegeLength =
          privilege.title.length > 21
            ? privilege.title.slice(0, 21) + ".."
            : privilege.title;
        if (privilege) {
          if (privilege.category == "Привилегии") {
            modalTitle.textContent = `Привилегия ${checkPrivilegeLength}`;
          } else {
            modalTitle.textContent = checkPrivilegeLength;
          }
          modalPrice.textContent = `${privilege.price}`;
          form.dataset.privilegeId = privilege.id;
          openModal();
        }
      }
    });
  }

  function openModal() {
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
    // Очистка полей формы
    getFirstFormInput.value = ""; // Сброс поля nickname
    getSecondFormInput.value = ""; // Сброс поля email
    getPromoFormInput.value = ""; // Сброс поля promo
    getCheckboxForm.checked = false; // Сброс чекбокса
    getSubmitButton.disabled = true; // Отключение кнопки отправки
  }

  document.addEventListener("click", function (event) {
    const closeButton = event.target.closest(".paymentform__closebtn");
    if (closeButton) {
      closeModal();
      // Очистка полей формы
      getFirstFormInput.value = ""; // Сброс поля nickname
      getSecondFormInput.value = ""; // Сброс поля email
      getPromoFormInput.value = ""; // Сброс поля promo
      getCheckboxForm.checked = false; // Сброс чекбокса
      getSubmitButton.disabled = true; // Отключение кнопки отправки
    }
  });

  modal.addEventListener("click", function (event) {
    if (!event.target.closest(".paymentform__box")) {
      closeModal();
      // Очистка полей формы
      getFirstFormInput.value = ""; // Сброс поля nickname
      getSecondFormInput.value = ""; // Сброс поля email
      getPromoFormInput.value = ""; // Сброс поля promo
      getCheckboxForm.checked = false; // Сброс чекбокса
      getSubmitButton.disabled = true; // Отключение кнопки отправки
    }
  });
  // Функционал уведомлений
  const notificationContainer = document.createElement("div");
  notificationContainer.classList.add("notification-container");
  document.body.appendChild(notificationContainer);

  const MAX_NOTIFICATIONS = 1; // Максимальное количество уведомлений
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const privilegeId = form.dataset.privilegeId;
    const nickname = document.getElementById("nickname").value;
    const email = document.getElementById("email").value;
    const coupon = document.getElementById("promo").value;

    const nicknamePattern = /^[A-Za-z0-9_]{2,16}$/;
    if (!nicknamePattern.test(nickname)) {
      showNotification(
        "Невалидный ник! Используйте только англ. буквы, цифры и нижние подчеркивания и от 2 до 16 символов в нике."
      );
      return;
    }
    function showNotification(message) {
      // Если уведомлений больше или равно MAX_NOTIFICATIONS, удаляем самое старое
      const existingNotifications = notificationContainer.children;
      if (existingNotifications.length >= MAX_NOTIFICATIONS) {
        existingNotifications[0].remove();
      }

      // Создаем новое уведомление
      const notification = document.createElement("div");
      notification.className = "notification";
      notification.textContent = message;

      // Кнопка закрытия уведомления
      const closeButton = document.createElement("span");
      closeButton.className = "close-btn";
      closeButton.textContent = "✖";
      notification.appendChild(closeButton);

      notificationContainer.appendChild(notification);

      // Удаляем уведомление через 3 секунды, если пользователь не закрыл его вручную
      const timeout = setTimeout(() => {
        notification.remove();
      }, 3000);

      closeButton.addEventListener("click", () => {
        clearTimeout(timeout); // Останавливаем таймер
        notification.remove(); // Удаляем уведомление
      });
    }
    // Очистка полей формы
    getFirstFormInput.value = ""; // Сброс поля nickname
    getSecondFormInput.value = ""; // Сброс поля email
    getPromoFormInput.value = ""; // Сброс поля promo
    getCheckboxForm.checked = false; // Сброс чекбокса
    getSubmitButton.disabled = true; // Отключение кнопки отправки

    const url = `http://127.0.0.1:3000/create-payment?privilegeId=${privilegeId}&customer=${nickname}&email=${email}&coupon=${coupon}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Успешный платеж:", data.paymentUrl);
          window.location.href = data.paymentUrl;
        } else {
          console.error("Ошибка при создании платежа:", data.message);
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
      });
  });

  loadPrivileges();
});

function truncateTitle(title) {
  return title.length > 15 ? title.slice(0, 14) + ".." : title;
}

// Находим все элементы с классом card-title
const cardTitleElements = document.querySelectorAll(".title");

// Применяем функцию укорочения для каждого заголовка
cardTitleElements.forEach((element) => {
  element.textContent = truncateTitle(element.textContent);
});

/*const buttons = document.querySelectorAll(".products__btn"); // Получаем все кнопки
const cards = document.querySelectorAll(".blocks"); // Получаем все блоки категорий
const showCards = document.querySelectorAll(".card"); // Получаем все карточки

// Функция для переключения блоков категорий
function switchSection(targetId) {
  cards.forEach((card) => {
    if (card.id === targetId) {
      card.classList.remove("hidden");
      setTimeout(() => {
        card.style.display = "flex"; // Скрываем карточки через время
      }, 300);
    } else {
      card.classList.add("hidden");
      setTimeout(() => {
        card.style.display = "none"; // Скрываем карточки через время
      }, 300);
    }
  });

  buttons.forEach((btn) => btn.classList.remove("active"));
  const activeButton = Array.from(buttons).find(
    (btn) => btn.getAttribute("data-target") === targetId
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

// Функция для переключения карточек внутри блока категории
function switchSection1(targetId) {
  showCards.forEach((card) => {
    if (card.id === targetId) {
      card.classList.remove("somecard");
      card.classList.add("activecard");
    } else {
      card.classList.remove("activecard");
      card.classList.add("somecard");
    }
  });
}

// Начальное состояние для блоков и карточек
document.addEventListener("DOMContentLoaded", () => {
  switchSection("privileges");
  switchSection1("privileges1");
});

// Обработчик клика для переключения категорий
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    switchSection(targetId);
    switchSection1(targetId + "1");
  });
});

// Начальная установка: все карточки скрыты, кроме начальных
showCards.forEach((card) => {
  if (card.id !== "privileges1") {
    card.classList.add("somecard");
  }
});
*/
