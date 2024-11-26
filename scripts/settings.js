document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM с проверкой на null
    const elements = [
        'disable-profile-charts', 'disable-transaction-charts', 'user-image-upload', 'user-image-preview',
        'save-settings', 'username', 'theme-switch-checkbox'
    ].map(id => document.getElementById(id));

    if (elements.some(el => el === null)) {
        console.error("Один или несколько элементов настроек не найдены!");
        return;
    }

    const [disableProfileChartsCheckbox, disableTransactionChartsCheckbox, userImageUpload, userImagePreview,
           saveSettingsButton, usernameInput, themeSwitchCheckbox] = elements;


    // Загрузка настроек с обработкой ошибок и использованием ??
    const savedSettings = JSON.parse(localStorage.getItem('piggyBankSettings')) ?? {};

    // Применение сохраненных настроек или значений по умолчанию
    disableProfileChartsCheckbox.checked = savedSettings.disableProfileCharts ?? false;
    disableTransactionChartsCheckbox.checked = savedSettings.disableTransactionCharts ?? false;
    usernameInput.value = savedSettings.username ?? '';
    themeSwitchCheckbox.checked = savedSettings.darkMode ?? false;
    userImagePreview.src = savedSettings.userImage ?? 'images/user-icons/default.png';
    if (savedSettings.userImage) userImagePreview.style.display = 'block';


    // Обработчик загрузки изображения с обработкой ошибок и восстановлением изображения по умолчанию
    userImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userImagePreview.src = e.target.result;
                userImagePreview.style.display = 'block';
            };
            reader.onerror = (error) => {
                console.error("Ошибка при чтении файла:", error);
                alert('Ошибка при загрузке изображения.');
                userImagePreview.src = 'images/user-icons/default.png';
            };
            reader.readAsDataURL(file);
        } else {
            userImagePreview.src = 'images/user-icons/default.png';
            userImagePreview.style.display = 'block';
        }
    });


    //Обработчик сохранения настроек с валидацией
    saveSettingsButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Поле "Имя пользователя" не может быть пустым.');
            return;
        }

        const settings = {
            disableProfileCharts: disableProfileChartsCheckbox.checked,
            disableTransactionCharts: disableTransactionChartsCheckbox.checked,
            userImage: userImagePreview.src,
            username: username,
            darkMode: themeSwitchCheckbox.checked,
        };

        try {
            localStorage.setItem('piggyBankSettings', JSON.stringify(settings));
            console.log("Настройки успешно сохранены:", settings);
            alert('Настройки сохранены!');
        } catch (error) {
            console.error("Ошибка при сохранении настроек в localStorage:", error);
            alert('Ошибка при сохранении настроек. Проверьте квоту localStorage или наличие ошибок в консоли.');
        }
    });
});
const themeSwitchCheckbox = document.getElementById('theme-switch-checkbox');
const body = document.body;
const header = document.querySelector('header');

// Загрузка настроек темной темы из локального хранилища при загрузке страницы
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