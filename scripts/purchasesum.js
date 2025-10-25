// Inject styles dynamically
const style = document.createElement('style');
style.textContent = `
  .collapsible { display: none; }
  .toggle-btn::after { content: '▶'; transition: transform 0.3s; }
  .toggle-btn.active::after { content: '▼'; }
  .column-list { list-style: none; padding: 0; background: #f8f9fa; border-radius: 8px; }
  .column-list li { padding: 8px; margin: 4px 0; background: white; border: 1px solid #dee2e6; cursor: move; display: flex; align-items: center; gap: 8px; }
  .dragging { opacity: 0.5; }
  .nested-table { background: #f8f9fa; }
`;
document.head.appendChild(style);

let currentLayout = {
  mainColumns: ['Sr No', 'Document Number', 'GL', 'Total Taxable', 'Total Tax', 'Total Invoice'],
  detailColumns: [],
  allHeaders: []
};

function fetchAndRenderPurchaseData(sheetName) {
  const fullSheetName = `${userid}_${sheetName}`;
  const url = `https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec?action=getAllData&sheet_name=${fullSheetName}`;

  fetch(url)
    .then(response => response.text())
    .then(text => {
      const cleaned = text.replace(/^undefined\(/, '').replace(/\)$/, '');
      const jsonData = JSON.parse(cleaned);
      if (jsonData.status !== 'success') throw new Error('No data found');
      const dataArray = jsonData.all_data;
      const headers = Object.keys(dataArray[0]);
      const rawData = [
        headers.join('\t'),
        ...dataArray.map(row => headers.map(h => row[h]).join('\t'))
      ].join('\n');
      renderPurchaseTable(rawData, headers);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to fetch or render data');
    });
}

function renderPurchaseTable(rawData, headers) {
  localStorage.setItem('rawData', rawData);
  localStorage.setItem('availableHeaders', JSON.stringify(headers));

  if (!currentLayout.allHeaders.length) currentLayout.allHeaders = headers;
  if (!currentLayout.detailColumns.length) {
    currentLayout.detailColumns = headers.filter(h => !currentLayout.mainColumns.includes(h));
  }

  const rows = rawData.split('\n').slice(1);
  const data = rows.map(row => {
    const values = row.split('\t');
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
  });

  renderTable(data);
}

function renderTable(data) {
  const grouped = data.reduce((acc, row) => {
    const key = row.submission_id;
    (acc[key] ||= []).push(row);
    return acc;
  }, {});

  const tbody = document.getElementById('mainTableBody');
  const headerRow = document.getElementById('mainTableHead');
  if (!tbody || !headerRow) return;
  tbody.innerHTML = '';
  headerRow.innerHTML = '';

  currentLayout.mainColumns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  const toggleTh = document.createElement('th');
  toggleTh.textContent = 'Action';
  headerRow.appendChild(toggleTh);

  let srNo = 1;
  Object.entries(grouped).forEach(([submissionId, rows]) => {
    const firstRow = rows[0];
    const totals = rows.reduce((acc, row) => {
      const qty = parseFloat(row.Quantity) || 0;
      const rate = parseFloat(row.Rate) || 0;
      const tax = parseFloat(row.ItemTax) || 0;
      const amount = qty * rate;
      return {
        taxable: acc.taxable + amount,
        tax: acc.tax + (amount * tax / 100),
        invoice: acc.invoice + amount + (amount * tax / 100),
      };
    }, { taxable: 0, tax: 0, invoice: 0 });

    const mainRow = document.createElement('tr');
    currentLayout.mainColumns.forEach(col => {
      const td = document.createElement('td');
      td.textContent = {
        'Sr No': srNo++,
        'Total Taxable': totals.taxable.toFixed(2),
        'Total Tax': totals.tax.toFixed(2),
        'Total Invoice': totals.invoice.toFixed(2),
      }[col] ?? (firstRow[col] ?? '');
      mainRow.appendChild(td);
    });
    const toggleCell = document.createElement('td');
    toggleCell.innerHTML = `<button class="btn btn-sm btn-primary toggle-btn" onclick="toggleRow(this, '${submissionId}')">Toggle</button>`;
    mainRow.appendChild(toggleCell);
    tbody.appendChild(mainRow);

    const detailRow = document.createElement('tr');
    detailRow.id = `detail-${submissionId}`;
    detailRow.style.display = 'none';
    const nestedTableHTML = `
      <td colspan="${currentLayout.mainColumns.length + 1}">
        <div class="nested-table">
          <table class="table table-sm mb-0">
            <thead>
              <tr>${currentLayout.detailColumns.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row =>
                `<tr>${currentLayout.detailColumns.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </td>`;
    detailRow.innerHTML = nestedTableHTML;
    tbody.appendChild(detailRow);
  });
}

function toggleRow(btn, submissionId) {
  const row = document.getElementById(`detail-${submissionId}`);
  const isVisible = row.style.display === 'table-row';
  row.style.display = isVisible ? 'none' : 'table-row';
  btn.classList.toggle('active', !isVisible);
}

function openLayoutModal() {
  const allHeaders = currentLayout.allHeaders;  // Array of all possible headers

  // Build modal HTML with a form containing an empty UL for column items + buttons
  let formHTML = `
    <form onsubmit="return false;">
      <div class="d-flex gap-5" style="max-height:300px; overflow-y:auto; flex-wrap: wrap;">
        <ul id="columnList" class="column-list" style="min-width:250px;"></ul>
      </div>
      <div class="mt-3">
        <input type="button" value="Apply Changes" class="btn btn-success" onclick="applyLayout()">
        <input type="button" value="Cancel" class="btn btn-secondary ms-2" onclick="closeCustomModal()">
      </div>
    </form>
  `;

  openCustomModal(formHTML);

  // After modal is open, populate #columnList with allHeaders
  const columnList = document.getElementById('columnList');
  if (!columnList) return;  // Safety check

  // Clear any previous content
  columnList.innerHTML = '';

  // Combine current main and detail columns for initial order display
  const combined = [...currentLayout.mainColumns, ...currentLayout.detailColumns];

  // For each header, create a draggable <li> with a checkbox checked if in combined array
  allHeaders.forEach(header => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.col = header;
    li.style.padding = '8px';
    li.style.border = '1px solid #ccc';
    li.style.marginBottom = '4px';
    li.style.background = 'white';
    li.style.cursor = 'grab';
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '8px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = combined.includes(header);

    const span = document.createElement('span');
    span.textContent = header;

    li.appendChild(checkbox);
    li.appendChild(span);

    columnList.appendChild(li);
  });

  // Initialize drag-and-drop handlers for the list
  initializeDrag(columnList);
}

// Drag-and-drop helper function (if not already defined)
function initializeDrag(container) {
  let dragged;

  container.querySelectorAll('li').forEach(item => {
    item.addEventListener('dragstart', e => {
      dragged = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      if(dragged) dragged.classList.remove('dragging');
      dragged = null;
    });
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (dragged) {
      if (afterElement == null) {
        container.appendChild(dragged);
      } else {
        container.insertBefore(dragged, afterElement);
      }
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}
  

function applyLayout() {
  const listItems = Array.from(document.querySelectorAll('#columnList li'));
  const selected = listItems
    .filter(li => li.querySelector('input[type="checkbox"]').checked)
    .map(li => li.dataset.col);

  currentLayout.mainColumns = selected.filter(h => ['Sr No', 'Document Number', 'GL', 'Total Taxable', 'Total Tax', 'Total Invoice'].includes(h));
  currentLayout.detailColumns = selected.filter(h => !currentLayout.mainColumns.includes(h));

  closeCustomModal();

  const rawData = localStorage.getItem('rawData');
  const headers = JSON.parse(localStorage.getItem('availableHeaders'));

  if (rawData && headers) {
    renderPurchaseTable(rawData, headers);
  } else {
    fetchAndRenderPurchaseData("PurchaseForm");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderPurchaseData("PurchaseForm");
  window.toggleRow = toggleRow;
  window.applyLayout = applyLayout;
  window.openLayoutModal = openLayoutModal;
  window.closeCustomModal = closeCustomModal;
});


