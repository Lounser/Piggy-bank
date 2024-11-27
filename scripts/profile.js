
const piggyBanksContainer = document.getElementById('piggy-banks-container');
const addPiggyBankForm = document.getElementById('add-piggy-bank');
const piggyBankNameInput = addPiggyBankForm.querySelector('#piggy-bank-name');
const piggyBankGoalInput = addPiggyBankForm.querySelector('#piggy-bank-goal');
const piggyBankStartInput = addPiggyBankForm.querySelector('#piggy-bank-start');
const piggyBankGoalDateInput = addPiggyBankForm.querySelector('#piggy-bank-goal-date');
const piggyBankImageInput = addPiggyBankForm.querySelector('#piggy-bank-image');
const piggyBankImagePreview = addPiggyBankForm.querySelector('#piggy-bank-image-preview');
const piggyBankDescriptionInput = addPiggyBankForm.querySelector('#piggy-bank-description');
const piggyBankIdInput = addPiggyBankForm.querySelector('#piggy-bank-id');
const savePiggyBankBtn = addPiggyBankForm.querySelector('#save-piggy-bank');
const cancelPiggyBankBtn = addPiggyBankForm.querySelector('#cancel-piggy-bank');
const themeSwitchCheckbox = document.getElementById('theme-switch-checkbox');
const nameFilterInput = document.getElementById('name-filter');
const goalFilterSelect = document.getElementById('goal-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const totalAmountEl = document.getElementById('total-amount');
const averageAmountEl = document.getElementById('average-amount');
const piggyBankCountEl = document.getElementById('piggy-bank-count');
const goalReachedCountEl = document.getElementById('goal-reached-count');
const avgDailyTransactionsEl = document.getElementById('avg-daily-transactions');
const leaderboardList = document.getElementById('leaderboard-list');
const distributionChartCanvas = document.getElementById('distributionChart');
const updateChartsButton = document.getElementById('update-charts');
const loadingIndicator = updateChartsButton.querySelector('.loading-indicator');
const updaterText = updateChartsButton.querySelector('.updater-text');
const achievementImagesPath = '../images/';

let piggyBanks = [];
let transactionsCharts = {};

const achievements = {
    'Золотая свинья': { goal: 10000, imagePath: 'golden-pig.png' },
    'Серебряная свинья': { goal: 5000, imagePath: 'iron-pig.png' },
    'Бронзовая свинья': { goal: 2500, imagePath: 'bronze-pig.png' },
    
};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createPiggyBank(name, goal, start, image, description, id, goalDate) {
    const goalNum = parseFloat(goal);
    const startNum = parseFloat(start);

    if (!name.trim() || isNaN(goalNum) || isNaN(startNum) || goalNum <= 0 || startNum < 0) {
        alert('Некорректный ввод. Убедитесь, что все поля заполнены корректными значениями.');
        return;
    }
    
    const newPiggyBank = {
        isPinned: false,
        name,
        goal: goalNum,
        current: startNum,
        image: image || '/images/no-image.png',
        description,
        id: id || generateUUID(),
        points: startNum,
        transactions: [],
        goalDate: goalDate ? new Date(goalDate) : null
    };
    if (id) {
        piggyBanks = piggyBanks.map(p => p.id === id ? newPiggyBank : p);
    } else {
        piggyBanks.push(newPiggyBank);
    }
    renderPiggyBanks();
    clearForm();
    savePiggyBanks();
}
function savePinnedPiggyBanks() {
    localStorage.setItem('pinnedPiggyBanks', JSON.stringify(piggyBanks.filter(bank => bank.isPinned)));
}

function loadPinnedPiggyBanks() {
    const pinnedBanks = localStorage.getItem('pinnedPiggyBanks');
    if (pinnedBanks) {
        try {
            const parsedBanks = JSON.parse(pinnedBanks);
            piggyBanks.forEach(bank => {
                const pinnedBank = parsedBanks.find(pBank => pBank.id === bank.id);
                if (pinnedBank) {
                    bank.isPinned = true;
                }
            });
        } catch (error) {
            console.error('Ошибка при загрузке закрепленных копилок:', error);
        }
    }
}
function renderPiggyBanks(filteredBanks = piggyBanks) {
    piggyBanksContainer.innerHTML = '';
    const sortedBanks = [...filteredBanks].sort((a, b) => b.isPinned - a.isPinned);
    sortedBanks.forEach(piggyBank => {
        const piggyBankEl = createPiggyBankElement(piggyBank);
        piggyBanksContainer.appendChild(piggyBankEl);
        attachPiggyBankListeners(piggyBankEl, piggyBank);
        createTransactionsChart(piggyBank);
    });
    updateStatistics(filteredBanks);
    updateLeaderboard();
    createDistributionChart(filteredBanks);
}

function createPiggyBankElement(piggyBank) {
    const piggyBankEl = document.createElement('div');
    piggyBankEl.classList.add('piggy-bank');
    piggyBankEl.dataset.id = piggyBank.id;
    piggyBankEl.innerHTML = `
        <h3>${piggyBank.name}</h3>
        <img class="piggy-bank-image" src="${piggyBank.image || '/images/no-image.png'}" alt="${piggyBank.name}">
        <div class="progress-bar">
            <div class="progress-bar-fill"></div>
            <div class="progress-text"></div>
        </div>
        <p class="goal-date"></p>
        <p>Текущий баланс: <span class="current-balance">${piggyBank.current}</span>₽</p>
        <p>Цель: ${piggyBank.goal}₽</p>
        <p class="description">Описание: ${piggyBank.description || ''}</p>
        <div class="actions-container">
            <button class="edit-button">Редактировать</button>
            <button class="delete-button">Удалить</button>
        </div>
        <div class="add-amount-container">
            <input type="number" class="add-amount" placeholder="Добавить">
            <button class="add-button">+</button>
            <input type="number" class="subtract-amount" placeholder="Убавить">
            <button class="subtract-button">-</button>
        </div>
        <div class="transactions-container">
            <h3>История транзакций:</h3>
            <ul class="transactions-list"></ul>
        </div>
        <canvas data-id="${piggyBank.id}" class="transactions-chart"></canvas>
    `;

    // Добавляем кнопку "Закрепить/Открепить"
    const actionsContainer = piggyBankEl.querySelector('.actions-container');
    const pinButton = document.createElement('button');
    pinButton.classList.add('pin-button');
    pinButton.dataset.pinned = piggyBank.isPinned; // Добавляем атрибут данных
    pinButton.textContent = piggyBank.isPinned ? 'Открепить' : 'Закрепить';
    actionsContainer.appendChild(pinButton);


    updateTransactionsList(piggyBank, piggyBankEl);
    showGoalDate(piggyBank, piggyBankEl);
    updateProgressBar(piggyBank);

    return piggyBankEl;
}
function updatePiggyBankElement(piggyBank) {
    const piggyBankEl = document.querySelector(`.piggy-bank[data-id="${piggyBank.id}"]`);
    if (piggyBankEl) {
        const pinButton = piggyBankEl.querySelector('.pin-button');
        pinButton.dataset.pinned = piggyBank.isPinned;
        pinButton.textContent = piggyBank.isPinned ? 'Открепить' : 'Закрепить';
        renderPiggyBanks();
    }
}
function showGoalDate(piggyBank, piggyBankEl) {
    const goalDateSpan = piggyBankEl.querySelector('.goal-date');
    if (piggyBank.goalDate) {
        const date = new Date(piggyBank.goalDate);
        const formattedDate = date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        goalDateSpan.textContent = `Цель до: ${formattedDate}`;
    } else {
        goalDateSpan.textContent = '';
    }
}

function addTransactionListeners(piggyBankEl, piggyBank) {
    const addButton = piggyBankEl.querySelector('.add-button');
    const addAmountInput = piggyBankEl.querySelector('.add-amount');
    const subtractButton = piggyBankEl.querySelector('.subtract-button');
    const subtractAmountInput = piggyBankEl.querySelector('.subtract-amount');
    const currentBalanceSpan = piggyBankEl.querySelector('.current-balance');

    addButton.addEventListener('click', () => handleTransaction(piggyBank, addAmountInput, currentBalanceSpan, 'add'));
    subtractButton.addEventListener('click', () => handleTransaction(piggyBank, subtractAmountInput, currentBalanceSpan, 'subtract'));
}

function handleTransaction(bank, amountInput, balanceSpan, type) {
    const amount = parseFloat(amountInput.value);
    if (!isNaN(amount) && amount > 0) {
        bank.current += (type === 'add' ? amount : -amount);
        // bank.points += (type === 'add' ? amount : -amount); 
        bank.transactions.push({ amount, date: new Date(), type });
        amountInput.value = '';
        balanceSpan.textContent = bank.current;
        updateProgressBar(bank);
        updateStatistics(piggyBanks);
        updateLeaderboard();
        savePiggyBanks();
        updateTransactionsList(bank);
        createTransactionsChart(bank);
    } else {
        alert('Введите корректное число.');
    }
}

function updateTransactionsList(piggyBank, piggyBankEl) {
    const transactionsList = piggyBankEl ? piggyBankEl.querySelector('.transactions-list') : document.querySelector(`.piggy-bank[data-id="${piggyBank.id}"] .transactions-list`);
    if (transactionsList) {
        transactionsList.innerHTML = piggyBank.transactions.map(transaction => `
            <li class="transaction ${transaction.type === 'add' ? 'add' : 'subtract'}">
                <span class="transaction-date">${transaction.date.toLocaleDateString()}</span>
                <span class="transaction-amount">${transaction.amount}₽</span>
                <span class="transaction-type">${transaction.type === 'add' ? 'Пополнение' : 'Снятие'}</span>
            </li>
        `).join('');
        if (piggyBank.transactions.length > 6) {
            transactionsList.classList.add('scrollable');
        } else {
            transactionsList.classList.remove('scrollable');
        }
    }
}

function addEditDeleteListeners(piggyBankEl, piggyBank) {
    const editButton = piggyBankEl.querySelector('.edit-button');
    const deleteButton = piggyBankEl.querySelector('.delete-button');

    editButton.addEventListener('click', () => populateForm(piggyBank));
    deleteButton.addEventListener('click', () => {
        if (confirm("Вы уверены, что хотите удалить копилку?")) {
            piggyBanks = piggyBanks.filter(p => p.id !== piggyBank.id);
            savePiggyBanks();
            renderPiggyBanks();
        }
    });
}

function updateProgressBar(piggyBank) {
    const piggyBankEl = document.querySelector(`.piggy-bank[data-id="${piggyBank.id}"]`);
    if (!piggyBankEl) return;
    const progressBarFill = piggyBankEl.querySelector('.progress-bar-fill');
    const progressText = piggyBankEl.querySelector('.progress-text');
    const progressWidth = ((piggyBank.current / piggyBank.goal) * 100).toFixed(2);
    progressBarFill.style.width = `${progressWidth}%`;
    progressText.textContent = `${progressWidth}%`;
    updateGoalClass(piggyBankEl, piggyBank);
}

function updateGoalClass(piggyBankEl, piggyBank) {
    piggyBankEl.classList.remove('over-goal', 'double-over-goal', 'triple-over-goal', 'quadruple-over-goal');
    if (piggyBank.current > piggyBank.goal) {
        piggyBankEl.classList.add('over-goal');
        if (piggyBank.current > piggyBank.goal * 2) {
            piggyBankEl.classList.add('double-over-goal');
        }
        if (piggyBank.current > piggyBank.goal * 3) {
            piggyBankEl.classList.add('triple-over-goal');
        }
        if (piggyBank.current > piggyBank.goal * 4) {
            piggyBankEl.classList.add('quadruple-over-goal');
        }
    }
}

function populateForm(piggyBank) {
    piggyBankNameInput.value = piggyBank.name;
    piggyBankGoalInput.value = piggyBank.goal;
    piggyBankStartInput.value = piggyBank.current;
    piggyBankDescriptionInput.value = piggyBank.description;
    piggyBankIdInput.value = piggyBank.id;
    piggyBankGoalDateInput.value = piggyBank.goalDate ? piggyBank.goalDate.toISOString().slice(0, 10) : '';
    piggyBankImagePreview.src = piggyBank.image || '/images/no-image.png';
    piggyBankImagePreview.style.display = 'block';

    savePiggyBankBtn.textContent = 'Сохранить';
    cancelPiggyBankBtn.style.display = 'block';
}

function clearForm() {
    piggyBankNameInput.value = '';
    piggyBankGoalInput.value = '';
    piggyBankStartInput.value = '';
    piggyBankDescriptionInput.value = '';
    piggyBankIdInput.value = '';
    piggyBankImagePreview.src = '';
    piggyBankImagePreview.textContent = 'Вы не выбрали изображение';
    piggyBankImagePreview.style.display = 'none';
    savePiggyBankBtn.textContent = 'Создать';
    cancelPiggyBankBtn.style.display = 'none';
}

piggyBankImageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            piggyBankImagePreview.src = e.target.result;
            piggyBankImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        piggyBankImagePreview.src = '/images/no-image.png';
        piggyBankImagePreview.style.display = 'none';
    }
});

function validateForm() {
    let isValid = true;
    const name = piggyBankNameInput.value.trim();
    const goal = parseFloat(piggyBankGoalInput.value);
    const start = parseFloat(piggyBankStartInput.value);

    const nameErrorMessage = piggyBankNameInput.nextElementSibling;
    const goalErrorMessage = piggyBankGoalInput.nextElementSibling;
    const startErrorMessage = piggyBankStartInput.nextElementSibling;

    nameErrorMessage.style.display = 'none';
    goalErrorMessage.style.display = 'none';
    startErrorMessage.style.display = 'none';

    if (!name) {
        nameErrorMessage.style.display = 'block';
        isValid = false;
    }
    if (isNaN(goal) || goal <= 0) {
        goalErrorMessage.style.display = 'block';
        isValid = false;
    }
    if (isNaN(start) || start < 0) {
        startErrorMessage.style.display = 'block';
        isValid = false;
    }

    return isValid;
}

// Save piggy bank
savePiggyBankBtn.addEventListener('click', () => {
    if (validateForm()) {
        const name = piggyBankNameInput.value;
        const goal = parseFloat(piggyBankGoalInput.value);
        const start = parseFloat(piggyBankStartInput.value);
        const image = piggyBankImagePreview.src !== '#' ? piggyBankImagePreview.src : null;
        const description = piggyBankDescriptionInput.value;
        const id = piggyBankIdInput.value;
        const goalDate = piggyBankGoalDateInput.value;
        createPiggyBank(name, goal, start, image, description, id, goalDate);
    }
});

// Cancel piggy bank creation
cancelPiggyBankBtn.addEventListener('click', clearForm);

// Theme switch
themeSwitchCheckbox.addEventListener('change', (event) => {
    const isDark = event.target.checked;
    document.body.classList.toggle('dark', isDark);
    document.querySelector('.theme-switch label').classList.toggle('dark', isDark);
    document.getElementById('add-piggy-bank').classList.toggle('dark', isDark);
    document.getElementById('statistics').classList.toggle('dark', isDark);
    document.getElementById('stats-container').classList.toggle('dark', isDark);
    document.getElementById('leaderboard').classList.toggle('dark', isDark);
    document.getElementById('piggy-banks-container').classList.toggle('dark', isDark);
    document.getElementById('welcome-message').classList.toggle('dark', isDark);
    document.getElementById('stats-container').classList.toggle('dark', isDark);
    document.querySelectorAll('.fa-sun, .fa-moon').forEach(icon => icon.classList.toggle('light', !isDark));
    localStorage.setItem('darkMode', isDark);
    
});

if (localStorage.getItem('darkMode') === 'true') {
    themeSwitchCheckbox.checked = true;
    document.body.classList.add('dark');
    document.querySelector('.theme-switch label').classList.add('dark');
    document.getElementById('add-piggy-bank').classList.add('dark');
    document.getElementById('statistics').classList.add('dark');
    document.getElementById('leaderboard').classList.add('dark');
    document.getElementById('piggy-banks-container').classList.add('dark');
    document.getElementById('welcome-message').classList.add('dark');
    document.querySelectorAll('.fa-sun, .fa-moon').forEach(icon => icon.classList.add('light'));
}
// Apply filters
document.getElementById('apply-filters').addEventListener('click', () => {
    const nameFilter = document.getElementById('name-filter').value.toLowerCase();
    const goalFilter = document.getElementById('goal-filter').value;

    // Сортируем массив piggyBanks, а не фильтруем
    piggyBanks.sort((a, b) => {
        // Сначала сортируем по имени (если фильтр задан)
        if (nameFilter !== '') {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
        }

        // Затем сортируем по цели (если фильтр задан)
        if (goalFilter !== '') {
            if (goalFilter === 'less') {
                return a.current - b.current; // По возрастанию текущей суммы
            } else if (goalFilter === 'more') {
                return b.current - a.current; // По убыванию текущей суммы
            }
        }

        // Если фильтры не заданы, оставляем порядок без изменений
        return 0;
    });

    renderPiggyBanks(piggyBanks); // Перерисовываем с новым порядком
});
// Update statistics
function updateStatistics(piggyBanksToDisplay) {
    if (piggyBanksToDisplay.length === 0) {
        totalAmountEl.textContent = '0';
        averageAmountEl.textContent = '0';
        piggyBankCountEl.textContent = '0';
        goalReachedCountEl.textContent = '0';
        avgDailyTransactionsEl.textContent = '0';
        return;
    }

    const totalAmount = piggyBanksToDisplay.reduce((sum, piggyBank) => sum + piggyBank.current, 0);
    const averageAmount = totalAmount / piggyBanksToDisplay.length || 0;
    const piggyBankCount = piggyBanksToDisplay.length;
    const goalReachedCount = piggyBanksToDisplay.filter(piggyBank => piggyBank.current >= piggyBank.goal).length;

    let totalTransactions = 0;
    let totalAddedAmount = 0;
    piggyBanksToDisplay.forEach(bank => {
        totalTransactions += bank.transactions.length;
        bank.transactions.forEach(transaction => {
            if (transaction.type === 'add') {
                totalAddedAmount += transaction.amount;
            }
        });
    });
    const avgDaily = totalTransactions / piggyBanksToDisplay.length || 0;
    const averageAddAmount = totalAddedAmount / totalTransactions || 0;

    totalAmountEl.textContent = totalAmount.toFixed(2);
    averageAmountEl.textContent = isNaN(averageAddAmount) ? '0' : averageAddAmount.toFixed(2);
    piggyBankCountEl.textContent = piggyBankCount;
    goalReachedCountEl.textContent = goalReachedCount;
    avgDailyTransactionsEl.textContent = isNaN(avgDaily) ? '0' : avgDaily.toFixed(2);
}

// Update leaderboard
function updateLeaderboard() {
    const sortedPiggyBanks = [...piggyBanks].sort((a, b) => b.points - a.points);
    leaderboardList.innerHTML = '';
  
    // Загрузка настроек пользователя из localStorage (с обработкой ошибок)
    let userName = 'Неизвестный пользователь';
    let userImage = '../default.png';
  
    try {
      const settings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
      userName = settings.username || 'Неизвестный пользователь';
      userImage = settings.userImage || userImage;
      if (!userImage || !userImage.trim()) {
        userImage = '../default.png';
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
    }
  
    sortedPiggyBanks.forEach((piggyBank, index) => {
      // Важная проверка на корректность данных piggyBank
      if (!piggyBank || !piggyBank.id || !piggyBank.name || isNaN(piggyBank.current)) {
        console.error("Ошибка: Некорректные данные для копилки:", piggyBank);
        return;
      }
  
      const listItem = document.createElement('li');
      listItem.dataset.id = piggyBank.id;
  
      // Обновляем points на основе текущего баланса, включая начальный
      piggyBank.points = piggyBank.current;
  
  
      const achievementsHTML = Object.entries(achievements)
        .map(([achievementName, achievementData]) => {
          if (!achievements[achievementName] || isNaN(achievementData.goal)) {
            console.error("Ошибка: Неверные данные для достижения:", achievementName);
            return '';
          }
          const progress = Math.min(100, (piggyBank.points / achievementData.goal) * 100);
          const imagePath = `${achievementImagesPath}${achievementData.imagePath}`;
  
          return `
            <div class="achievement" data-achievement="${achievementName}" data-goal="${achievementData.goal}">
              ${progress >= 100 ? `<img src="${imagePath}" alt="${achievementName}">` : ''}
            </div>
          `;
        })
        .join('');
  
  
      listItem.innerHTML = `
        <span>${index + 1}. </span>
        <div class="user-info">
          <img src="${userImage}" alt="Иконка пользователя" class="leaderboard-icon">
          <span class="username">${userName}</span>
        </div>
        <span>Копилка: ${piggyBank.name}</span> -
        <span>${piggyBank.current.toFixed(2)}₽</span>
        <div class="achievements">${achievementsHTML}</div>
      `;
  
      // Обработка кликов по достижениям, вызывается после создания элементов
      const userImageEl = listItem.querySelector('.leaderboard-icon');
      if (userImageEl) {
        userImageEl.addEventListener('click', () => openImageModal(userImage));
      }
  
      leaderboardList.appendChild(listItem);
    });
  
    addAchievementListeners(); //Вызываем addAchievementListeners после создания элементов
  }
  function openAchievementModal(piggyBank, achievementName, achievementGoal, achievementImagePath) {
    // Проверки на корректность данных
    if (!piggyBank || !achievementName || !achievementGoal || !achievementImagePath) {
        console.error("Ошибка: Не все параметры переданы в openAchievementModal");
        return;
    }
    if (isNaN(achievementGoal) || achievementGoal <= 0) {
        console.error("Ошибка: Некорректное значение achievementGoal:", achievementGoal);
        return;
    }

    const currentPoints = piggyBank.points;
    const progress = `${currentPoints}/${achievementGoal}`;
    const imagePath = `${achievementImagesPath}${achievementImagePath}`;

    const modal = document.createElement('div');
    modal.classList.add('achievement-modal','dark-mode');
    modal.innerHTML = `
        <div class="achievement-modal-content dark">
            <img src="${imagePath}" alt="${achievementName}" class="achievement-modal-image">
            <p>Достижение: ${achievementName} </p>
            <p>Копилка: ${piggyBank.name}</p>
            <p>Цель: накопить ${achievementGoal}₽</p>
            <p>Прогресс: ${progress}₽</p>
            <button class="achievement-modal-close dark-mode">Закрыть</button>
        </div>
    `;

    modal.classList.add('zoom-in');
    document.body.appendChild(modal);

    modal.querySelector('.achievement-modal-close').addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
}

function closeModal(modal){
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');
    setTimeout(() => modal.remove(), 300); // Таймаут для анимации
}

function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Leaderboard Image';
    img.classList.add('modal-image');

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Закрыть';
    closeButton.classList.add('modal-close');
    closeButton.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    img.addEventListener('click', () => {
        if (img.style.transform === 'scale(1.5)') {
            img.style.transform = 'scale(1)';
        } else {
            img.style.transform = 'scale(1.5)';
        }
    });

    modal.appendChild(img);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);
}

function openLeaderboardImageModal(event) {
    const imageSrc = event.target.src;
    const modal = createModal(imageSrc);
    document.body.appendChild(modal);
}

function createModal(imageSrc, achievementName, goal, current) {
    const modal = document.createElement('div');
    modal.classList.add('achievement-modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content-wrapper');

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Leaderboard Image';
    img.classList.add('modal-image');

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Закрыть';
    closeButton.classList.add('modal-close');
    closeButton.addEventListener('click', () => modal.remove());

    const goalElement = document.createElement('p');
    goalElement.textContent = `Цель: ${goal}₽`;

    const currentElement = document.createElement('p');
    currentElement.textContent = `Прогресс: ${current}₽`;

    const progressElement = document.createElement('progress');
    progressElement.max = goal;
    progressElement.value = current;

    modalContent.appendChild(img);
    modalContent.appendChild(goalElement);
    modalContent.appendChild(currentElement);
    modalContent.appendChild(progressElement);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    return modal;
}

function addAchievementListeners() {
    leaderboardList.querySelectorAll('.achievement').forEach(achievement => {
        const piggyBankId = achievement.closest('li').dataset.id;
        if (!piggyBankId) {
            console.error("Ошибка: Не найден data-id у элемента achievement. Проверьте структуру HTML.");
            return;
        }

        const piggyBank = piggyBanks.find(bank => bank.id === piggyBankId);
        if (!piggyBank) {
            console.error("Ошибка: Копилка не найдена по ID:", piggyBankId);
            return;
        }

        achievement.addEventListener('click', () => {
            const achievementName = achievement.dataset.achievement;
            const achievementGoal = parseFloat(achievement.dataset.goal);
            //Проверка на корректность achievementGoal
            if(isNaN(achievementGoal)){
                console.error("Ошибка: achievementGoal не является числом:", achievement.dataset.goal);
                return;
            }
            const achievementImage = achievements[achievementName].imagePath;
            openAchievementModal(piggyBank, achievementName, achievementGoal, achievementImage);
        });
    });
}


// Load piggy banks from localStorage
function loadPiggyBanks() {
    const storedPiggyBanks = localStorage.getItem('piggyBanks');
    if (storedPiggyBanks) {
        try {
            piggyBanks = JSON.parse(storedPiggyBanks).map(bank => ({
                ...bank,
                transactions: bank.transactions.map(t => ({
                    amount: t.amount,
                    date: new Date(t.date),
                    type: t.type
                })),
                goalDate: bank.goalDate ? new Date(bank.goalDate) : null
            }));
        } catch (error) {
            console.error("Ошибка при парсинге данных из localStorage:", error);
            piggyBanks = [];
        }
    }
}

// Save piggy banks to localStorage
function savePiggyBanks() {
    localStorage.setItem('piggyBanks', JSON.stringify(piggyBanks));
}

// Doughnut chart
let distributionChart;
let distributionChartLoading = false;

function createDistributionChart(piggyBanks) {
    const ctx = distributionChartCanvas.getContext('2d');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('chart-loading');
    loadingIndicator.textContent = 'Обновление...';

    if (piggyBanks.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (distributionChart) {
            distributionChart.destroy();
            distributionChart = null;
        }
        return;
    }

    if (!distributionChartLoading) {
        distributionChartLoading = true;
        ctx.canvas.parentNode.appendChild(loadingIndicator);
    }

    const data = {
        labels: piggyBanks.map(piggyBank => piggyBank.name),
        datasets: [{
            label: 'Средства',
            data: piggyBanks.map(piggyBank => piggyBank.current),
            backgroundColor: generateColors(piggyBanks.length),
            hoverOffset: 4,
            cutout: '70%'
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500,
                easing: 'easeInOutCubic'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14,
                            family: 'Arial'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Распределение средств',
                    font: {
                        size: 16,
                        family: 'Arial',
                        weight: 'bold'
                    }
                }
            },
            cutout: '70%'
        }
    };

    if (distributionChart) {
        distributionChart.data.datasets[0].data = data.datasets[0].data;
        distributionChart.data.datasets[0].backgroundColor = generateColors(piggyBanks.length);
        distributionChart.update();
    } else {
        distributionChart = new Chart(ctx, config);
    }

    setTimeout(() => {
        loadingIndicator.remove();
        distributionChartLoading = false;
    }, 600);
}

// Line chart for transaction history
function createTransactionsChart(piggyBank) {
    const canvas = document.querySelector(`canvas[data-id="${piggyBank.id}"]`);
    if (!canvas) return;

    if (transactionsCharts[piggyBank.id]) {
        transactionsCharts[piggyBank.id].destroy();
    }

    const ctx = canvas.getContext('2d');
    const data = {
        labels: piggyBank.transactions.map(transaction => transaction.date.toLocaleDateString()),
        datasets: [{
            label: piggyBank.name,
            data: piggyBank.transactions.map(transaction => transaction.amount),
            borderColor: '#3e95cd',
            backgroundColor: 'rgba(53, 149, 205, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#3e95cd',
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'white',
            pointHitRadius: 10
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `История транзакций: ${piggyBank.name}`,
                    font: {
                        size: 16,
                        family: 'Arial',
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value}₽`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Дата',
                        font: {
                            size: 14,
                            family: 'Arial'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Сумма (₽)',
                        font: {
                            size: 14,
                            family: 'Arial'
                        }
                    }
                }
            }
        }
    };

    transactionsCharts[piggyBank.id] = new Chart(ctx, config);
}

// Color generator
function generateColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);
    }
    return colors;
}

// Add piggy bank listeners (only once)
function attachPiggyBankListeners(piggyBankEl, piggyBank) {
  if (!piggyBankEl.dataset.hasEventListeners) {
    addTransactionListeners(piggyBankEl, piggyBank);
    addEditDeleteListeners(piggyBankEl, piggyBank);
    piggyBankEl.dataset.hasEventListeners = true;
    const pinButton = piggyBankEl.querySelector('.pin-button');
    pinButton.addEventListener('click', () => {
        piggyBank.isPinned = !piggyBank.isPinned;
        pinButton.dataset.pinned = piggyBank.isPinned;
        pinButton.textContent = piggyBank.isPinned ? 'Открепить' : 'Закрепить';
        updatePiggyBankElement(piggyBank); // Обновляем отображение
        savePiggyBanks();
    });
  }
}


// Piggy bank event handlers (improved)
piggyBanksContainer.addEventListener('click', (event) => {
    const piggyBankEl = event.target.closest('.piggy-bank');
    if (!piggyBankEl) return;
    event.stopPropagation();
    const piggyBankId = piggyBankEl.dataset.id;
    const piggyBank = piggyBanks.find(bank => bank.id === piggyBankId);
    attachPiggyBankListeners(piggyBankEl, piggyBank);
});

// Update charts
function updateCharts() {
    if (!distributionChart || piggyBanks.length === 0) {
        alert('Невозможно обновить графики. Проверьте, что данные загружены и копилки созданы.');
        return;
    }

    loadingIndicator.style.display = 'inline';
    updaterText.style.display = 'none';
    distributionChart.data.datasets[0].data = piggyBanks.map(bank => bank.current);
    distributionChart.update();

    setTimeout(() => {
        loadingIndicator.style.display = 'none';
        updaterText.style.display = 'inline';
    }, 600);
}

// Open image in full size
piggyBanksContainer.addEventListener('click', (event) => {
    const imageEl = event.target.closest('.piggy-bank-image');
    if (imageEl) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';
        modal.style.transition = 'background-color 0.3s ease';

        const image = new Image();
        image.src = imageEl.src;
        image.style.maxWidth = '90%';
        image.style.maxHeight = '90%';
        image.style.opacity = '0';
        image.style.transition = 'opacity 0.3s ease';

        modal.appendChild(image);
        document.body.appendChild(modal);

        setTimeout(() => modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)');
        setTimeout(() => image.style.opacity = '1');

        modal.addEventListener('click', () => {
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            image.style.opacity = '0';

            setTimeout(() => document.body.removeChild(modal), 300);
        });
    }
});

updateChartsButton.addEventListener('click', updateCharts);

// Load data and render
document.addEventListener('DOMContentLoaded', () => {
    loadPiggyBanks();
    renderPiggyBanks();
    createDistributionChart(piggyBanks);
    updateStatistics(piggyBanks);
    updateLeaderboard();

    // Обработка настроек из localStorage с обработкой ошибок
    let savedSettings = {};
    try {
        const storedSettings = localStorage.getItem('piggyBankSettings');
        savedSettings = storedSettings ? JSON.parse(storedSettings) : {};
    } catch (error) {
        console.error("Ошибка при загрузке настроек из localStorage:", error);
        // Можно добавить обработку ошибки, например, показ сообщения пользователю
    }

    const disableProfileCharts = savedSettings.disableProfileCharts || false;
    const disableTransactionCharts = savedSettings.disableTransactionCharts || false;

    // Скрытие графиков на основе настроек
    if (disableProfileCharts) {
        const distributionChart = document.getElementById('distributionChart');
        if (distributionChart) { // Проверка на существование элемента, чтобы избежать ошибок
            distributionChart.style.display = 'none';
        }
    }

    if (disableTransactionCharts) {
        const transactionCharts = document.querySelectorAll('.piggy-bank canvas.transactions-chart');
        transactionCharts.forEach(chart => {
            if (chart) { // Проверка на существование элемента
                chart.style.display = 'none';
            }
        });
    }
});
