document.addEventListener('DOMContentLoaded', () => {
    // Элементы настроек
    const elements = {
        disableProfileCharts: document.getElementById('disable-profile-charts'),
        disableTransactionCharts: document.getElementById('disable-transaction-charts'),
        userImageUpload: document.getElementById('user-image-upload'),
        userImagePreview: document.getElementById('user-image-preview'),
        usernameInput: document.getElementById('username'),
        themeSwitchCheckbox: document.getElementById('theme-switch-checkbox'),
        removeUserImageButton: document.getElementById('remove-user-image'),
        disableDeleteConfirmation: document.getElementById('disable-delete-confirmation'),
    };

    // Проверка на существование всех элементов настроек
    if (Object.values(elements).some(el => el === null)) {
        console.error("Один или несколько элементов настроек не найдены!");
        return;
    }

    const defaultUserImage = 'https://i.postimg.cc/BbG6sGBc/default.png'; // Путь к изображению по умолчанию

    // Загрузка настроек из localStorage
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        elements.disableProfileCharts.checked = savedSettings.disableProfileCharts || false;
        elements.disableTransactionCharts.checked = savedSettings.disableTransactionCharts || false;
        elements.usernameInput.value = savedSettings.username || '';
        elements.themeSwitchCheckbox.checked = savedSettings.darkMode || false;
        elements.userImagePreview.src = savedSettings.userImage || defaultUserImage;
        elements.userImagePreview.style.display = savedSettings.userImage ? 'block' : 'none';
        elements.disableDeleteConfirmation.checked = savedSettings.disableDeleteConfirmation || false;

        if (savedSettings.darkMode) {
            document.body.classList.add('dark'); // Применяем тёмную тему
        } else {
            document.body.classList.remove('dark'); // Убираем тёмную тему
        }

        // Обновление видимости графиков
        updateChartVisibility();
    }

    // Сохранение настроек в localStorage
    function saveSettings() {
        const savedSettings = {
            disableProfileCharts: elements.disableProfileCharts.checked,
            disableTransactionCharts: elements.disableTransactionCharts.checked,
            username: elements.usernameInput.value.trim(),
            userImage: elements.userImagePreview.src,
            darkMode: elements.themeSwitchCheckbox.checked, // Сохраняем состояние темной темы
            disableDeleteConfirmation: elements.disableDeleteConfirmation.checked,
        };

        try {
            localStorage.setItem('piggyBankSettings', JSON.stringify(savedSettings));
            console.log("Настройки успешно сохранены:", savedSettings);

            // Применяем или убираем тёмную тему
            if (savedSettings.darkMode) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('Превышен лимит хранения localStorage. Попробуйте освободить место.');
            } else {
                console.error("Ошибка при сохранении настроек в localStorage:", error);
            }
        }

        // Обновление видимости графиков
        updateChartVisibility();
    }

    // Обновление видимости графиков
    function updateChartVisibility() {
        const profileChartsContainer = document.getElementById('profile-charts-container');
        const transactionChartsContainer = document.getElementById('transaction-charts-container');

        if (profileChartsContainer) {
            profileChartsContainer.style.display = elements.disableProfileCharts.checked ? 'none' : 'block';
        }

        if (transactionChartsContainer) {
            transactionChartsContainer.style.display = elements.disableTransactionCharts.checked ? 'none' : 'block';
        }
    }

    // Обработка изменений в элементах
    elements.disableProfileCharts.addEventListener('change', saveSettings);
    elements.disableTransactionCharts.addEventListener('change', saveSettings);
    elements.usernameInput.addEventListener('input', saveSettings);
    elements.themeSwitchCheckbox.addEventListener('change', saveSettings);
    elements.disableDeleteConfirmation.addEventListener('change', saveSettings);

    // Обработка загрузки изображения
    elements.userImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                elements.userImagePreview.src = e.target.result;
                elements.userImagePreview.style.display = 'block';
                saveSettings();
            };
            reader.onerror = (error) => {
                console.error("Ошибка при чтении файла:", error);
                alert('Ошибка при загрузке изображения.');
                elements.userImagePreview.src = defaultUserImage;
            };
            reader.readAsDataURL(file);
        } else {
            elements.userImagePreview.src = defaultUserImage;
            elements.userImagePreview.style.display = 'none';
        }
    });

    // Удаление изображения профиля
    elements.removeUserImageButton.addEventListener('click', () => {
        elements.userImagePreview.src = defaultUserImage;
        elements.userImagePreview.style.display = 'none';
        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        delete savedSettings.userImage;
        localStorage.setItem('piggyBankSettings', JSON.stringify(savedSettings));
    });

    // Загрузка начальных настроек
    loadSettings();
});