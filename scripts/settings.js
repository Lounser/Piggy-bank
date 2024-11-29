document.addEventListener('DOMContentLoaded', () => {
    // Элементы настроек
    const elements = {
        disableProfileCharts: document.getElementById('disable-profile-charts'),
        disableTransactionCharts: document.getElementById('disable-transaction-charts'),
        userImageUpload: document.getElementById('user-image-upload'),
        userImagePreview: document.getElementById('user-image-preview'),
        saveSettingsButton: document.getElementById('save-settings'),
        usernameInput: document.getElementById('username'),
        themeSwitchCheckbox: document.getElementById('theme-switch-checkbox'),
        removeUserImageButton: document.getElementById('remove-user-image'),
    };

    // Проверка на существование всех элементов настроек
    if (Object.values(elements).some(el => el === null)) {
        console.error("Один или несколько элементов настроек не найдены!");
        return;
    }

    const defaultUserImage = 'https://i.postimg.cc/BbG6sGBc/default.png'; // Ensure path is correct and accessible

    // Загрузка настроек из localStorage
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        elements.disableProfileCharts.checked = savedSettings.disableProfileCharts || false;
        elements.disableTransactionCharts.checked = savedSettings.disableTransactionCharts || false;
        elements.usernameInput.value = savedSettings.username || '';
        elements.themeSwitchCheckbox.checked = savedSettings.darkMode || false;
        elements.userImagePreview.src = savedSettings.userImage || defaultUserImage;
        elements.userImagePreview.style.display = savedSettings.userImage ? 'block' : 'none'; // Ensure default image display is set
    }

    // Сохранение настроек в localStorage
    function saveSettings() {
        const username = elements.usernameInput.value.trim();
        if (!username) {
            alert('Поле "Имя пользователя" не может быть пустым.');
            return;
        }

        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        savedSettings.username = username;
        savedSettings.disableProfileCharts = elements.disableProfileCharts.checked;
        savedSettings.disableTransactionCharts = elements.disableTransactionCharts.checked;
        savedSettings.userImage = elements.userImagePreview.src;
        savedSettings.darkMode = elements.themeSwitchCheckbox.checked;

        try {
            localStorage.setItem('piggyBankSettings', JSON.stringify(savedSettings));
            console.log("Настройки успешно сохранены:", savedSettings);
            alert('Настройки сохранены!');
        } catch (error) {
            console.error("Ошибка при сохранении настроек в localStorage:", error);
            alert('Ошибка при сохранении настроек. Проверьте квоту localStorage или наличие ошибок в консоли.');
        }
    }

    // Обработка загрузки изображения
    elements.userImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                elements.userImagePreview.src = e.target.result;
                elements.userImagePreview.style.display = 'block';
            };
            reader.onerror = (error) => {
                console.error("Ошибка при чтении файла:", error);
                alert('Ошибка при загрузке изображения.');
                elements.userImagePreview.src = defaultUserImage;
            };
            reader.readAsDataURL(file);
        } else {
            elements.userImagePreview.src = defaultUserImage;
            elements.userImagePreview.style.display = 'none'; // Ensure default image display is set
        }
    });

    // Удаление изображения профиля
    elements.removeUserImageButton.addEventListener('click', () => {
        elements.userImagePreview.src = defaultUserImage;
        elements.userImagePreview.style.display = 'none'; // Ensure default image display is set
        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        delete savedSettings.userImage;
        localStorage.setItem('piggyBankSettings', JSON.stringify(savedSettings));
    });

    // Сохранение настроек при клике на кнопку
    elements.saveSettingsButton.addEventListener('click', saveSettings);

    // Загрузка начальных настроек
    loadSettings();

    //Обработка темной темы
    const body = document.body;
    const header = document.querySelector('header');

    elements.themeSwitchCheckbox.addEventListener('change', () => {
        if (elements.themeSwitchCheckbox.checked) {
            body.classList.add('dark');
            header.classList.add('dark');
        } else {
            body.classList.remove('dark');
            header.classList.remove('dark');
        }
        localStorage.setItem('darkMode', elements.themeSwitchCheckbox.checked);
    });

    if (localStorage.getItem('darkMode') === 'true') {
        elements.themeSwitchCheckbox.checked = true;
        body.classList.add('dark');
        header.classList.add('dark');
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionButton.addEventListener('click', () => {
            answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
        });
    });

    // Show first answer
    // faqItems[0].querySelector('.faq-answer').style.display = 'block';
});


