document.addEventListener('DOMContentLoaded', () => {
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

    if (Object.values(elements).some(el => el === null)) {
        console.error("Один или несколько элементов настроек не найдены!");
        return;
    }

    const defaultUserImage = '../user-icons/default.png';

    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        elements.disableProfileCharts.checked = savedSettings.disableProfileCharts || false;
        elements.disableTransactionCharts.checked = savedSettings.disableTransactionCharts || false;
        elements.usernameInput.value = savedSettings.username || '';
        elements.themeSwitchCheckbox.checked = savedSettings.darkMode || false;
        elements.userImagePreview.src = savedSettings.userImage || defaultUserImage;
        elements.userImagePreview.style.display = savedSettings.userImage ? 'block' : 'none';
    }

    function saveSettings() {
        const username = elements.usernameInput.value.trim();
        if (!username) {
            alert('Поле "Имя пользователя" не может быть пустым.');
            return;
        }

        const settings = {
            disableProfileCharts: elements.disableProfileCharts.checked,
            disableTransactionCharts: elements.disableTransactionCharts.checked,
            userImage: elements.userImagePreview.src,
            username: username,
            darkMode: elements.themeSwitchCheckbox.checked,
        };

        try {
            localStorage.setItem('piggyBankSettings', JSON.stringify(settings));
            console.log("Настройки успешно сохранены:", settings);
            alert('Настройки сохранены!');
        } catch (error) {
            console.error("Ошибка при сохранении настроек в localStorage:", error);
            alert('Ошибка при сохранении настроек. Проверьте квоту localStorage или наличие ошибок в консоли.');
        }
    }

    loadSettings();

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
            elements.userImagePreview.style.display = 'block';
        }
    });

    elements.saveSettingsButton.addEventListener('click', saveSettings);

    elements.removeUserImageButton.addEventListener('click', () => {
        elements.userImagePreview.src = defaultUserImage;
        elements.userImagePreview.style.display = 'block';
        const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) || {};
        delete savedSettings.userImage;
        localStorage.setItem('piggyBankSettings', JSON.stringify(savedSettings));
    });


    const themeSwitchCheckbox = elements.themeSwitchCheckbox;
    const body = document.body;
    const header = document.querySelector('header');

    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        themeSwitchCheckbox.checked = true;
        body.classList.add('dark');
        header.classList.add('dark');
    }

    themeSwitchCheckbox.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('dark');
            header.classList.add('dark');
        } else {
            body.classList.remove('dark');
            header.classList.remove('dark');
        }
        localStorage.setItem('darkMode', this.checked);
    });

    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            answer.classList.toggle('show');
        });
    });
});
