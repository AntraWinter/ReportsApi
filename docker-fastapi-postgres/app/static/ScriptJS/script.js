let rowCount = 0;
let isEditMode = true;

function addRow() {
  rowCount++;
  const tbody = document.getElementById('tableBody');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td data-label="№" id="id">${rowCount}</td>
    <td data-label="Местоположение"><textarea id="location" rows="2" placeholder="Укажите местоположение"></textarea></td>
    <td data-label="Описание"><textarea id="defect_description" rows="2" placeholder="Опишите дефект"></textarea></td>
    <td data-label="Категория по ГОСТ">
      <select id="defect_category" required>
        <option value="">Выберите категорию</option>
        <option value="устранимый">устранимый</option>
        <option value="критический">критический</option>
      </select>
    </td>
    <td data-label="Метод устранения"><textarea id="elimination_method" rows="2" placeholder="Предложите метод устранения"></textarea></td>
    <td data-label="Фото">
      <input id="photo" type="file" accept="image/*" onchange="previewImage(event, this)">
      <div class="preview-container"></div>
    </td>
    <td data-label="Ссылка">
      <div class="link-container">
        <textarea id="tag_link" rows="1" placeholder="Введите ссылку" oninput="toggleIcon(this)"></textarea>
        <img src="https://img.icons8.com/ios-filled/24/external-link.png" class="link-icon" alt="Ссылка">
      </div>
    </td>
    <td data-label="Действие"><button type="button" class="remove-btn" onclick="removeRow(this)">🗑 Удалить</button></td>
  `;
  tbody.appendChild(row);
  
  // Добавляем класс для строки с фото, если нужно
  const fileInput = row.querySelector('input[type="file"]');
  fileInput.addEventListener('change', function(e) {
    previewImage(e, this);
  });
}

function removeRow(button) {
  if (confirm('Вы уверены, что хотите удалить эту строку?')) {
    const row = button.closest('tr');
    row.remove();
    updateRowNumbers();
  }
}

function updateRowNumbers() {
  const rows = document.querySelectorAll('#tableBody tr');
  rowCount = 0;
  rows.forEach((row, index) => {
    rowCount++;
    row.cells[0].textContent = rowCount;
  });
}

function previewImage(event, input) {
  const container = input.nextElementSibling;
  const file = event.target.files[0];
  const row = input.closest('tr');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      container.innerHTML = `
        <img src="${e.target.result}" class="preview-img">
        <button type="button" class="remove-btn" onclick="removeImage(this)" style="width: 100%; margin-top: 8px;">🗑 Удалить фото</button>
      `;
      row.classList.add('has-photo');
      
      // Адаптируем высоту textarea в этой строке
      const textareas = row.querySelectorAll('textarea');
      textareas.forEach(ta => {
        ta.style.height = '100px';
      });
    };
    reader.readAsDataURL(file);
  }
}

function removeImage(button) {
  const container = button.parentElement;
  const fileInput = container.previousElementSibling;
  const row = container.closest('tr');
  
  fileInput.value = "";
  container.innerHTML = "";
  row.classList.remove('has-photo');
  
  // Возвращаем стандартную высоту textarea
  const textareas = row.querySelectorAll('textarea');
  textareas.forEach(ta => {
    ta.style.height = '';
  });
}

function toggleIcon(textarea) {
  const icon = textarea.nextElementSibling;
  icon.style.display = textarea.value.trim() ? "inline-block" : "none";
}

// Функции редактора текста
function format(command) {
  document.execCommand(command, false, null);
  document.getElementById('text-editor').focus();
}

function insertLink() {
  const url = prompt("Введите URL ссылки:", "https://");
  if (url) {
    document.execCommand("createLink", false, url);
  }
}

function toggleEditMode() {
  const editor = document.getElementById('text-editor');
  const toggleBtn = document.getElementById('toggleBtn');
  
  isEditMode = !isEditMode;
  editor.contentEditable = isEditMode;
  toggleBtn.textContent = isEditMode ? "🔒 Режим просмотра" : "✏️ Режим редактирования";
}

function setFontSize(size) {
  if (size) document.execCommand('fontSize', false, size);
}

function setFontFamily(font) {
  if (font) document.execCommand('fontName', false, font);
}

function alignText(alignment) {
  document.execCommand('justify' + alignment);
}

// Инициализация
window.onload = function() {
  addRow();
  document.getElementById('text-editor').focus();
};


async function saveTableData() {
    const rows = [];
    const table = document.querySelector('tbody');
    const tableRows = table.querySelectorAll('tr');
    
    // Собираем данные из каждой строки таблицы
    tableRows.forEach(row => {
        const rowData = {
            location: row.querySelector('#location').value,
            defect_description: row.querySelector('#defect_description').value,
            defect_category: row.querySelector('#defect_category').value,
            elimination_method: row.querySelector('#elimination_method').value,
            photo: row.querySelector('#photo').files[0]?.name || null,
            tag_link: row.querySelector('#tag_link').value || null
        };
        rows.push(rowData);
    });
    
    try {
        const response = await fetch('/save-table-data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rows)
        });
        
        const result = await response.json();
        if (response.ok) {
            alert('Данные успешно сохранены!');
        } else {
            alert('Ошибка при сохранении: ' + result.detail);
        }
    } catch (error) {
        alert('Ошибка сети: ' + error);
    }
}

