// Fetch data from Google Sheets
// console.log(userid)

function fetchData() {
  const sheetName = document.getElementById('sheetName').value.trim();
  const submitBtn = document.getElementById("dsw_submit");
  submitBtn.textContent = "Loading...";

  if (!sheetName) {
    alert('Please enter a sheet name.');
    submitBtn.textContent = "Fetch Data";
    return;
  }

  const url = `https://script.google.com/macros/s/AKfycby4WEYQjiJJOg_nyP-oRLB39fatKNpu_9TMK__t91-3GJEEQDuY0F9mZ_OdByZI76Wa/exec?action=getAllData&sheet_name=${userid + "_" + sheetName}`;

  fetch(url)
    .then(response => response.text())
    .then(text => {
      const jsonData = JSON.parse(text.replace(/^undefined\(/, '').replace(/\)$/, ''));
      // console.log(jsonData)
      if (jsonData.status === "success" && jsonData.all_data.length > 0) {
        renderTable(jsonData.all_data);
        const showmain = jsonData.all_data;
        submitBtn.textContent = "Find";
      } else {
        alert('No data found for the provided sheet name.');
        submitBtn.textContent = "Find";
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching data. Please check the console for details.');
      submitBtn.textContent = "Find";
    });
}

  
  // Render data into a table
  // Dynamic Filtering Function
  function addFilters(headers) {
    const filterRow = document.createElement('tr');
  
    // Empty cell for Action column
    filterRow.appendChild(document.createElement('th'));
  
    // Empty cell for Checkbox column
    filterRow.appendChild(document.createElement('th'));
  
    // Add filter input for Status column (3rd column)
    const statusFilterCell = document.createElement('th');
    const statusInput = document.createElement('input');
    statusInput.type = 'text';
    statusInput.placeholder = 'Filter Status';
    statusInput.className = 'form-control';
    statusInput.addEventListener('input', filterTable);
    statusFilterCell.appendChild(statusInput);
    filterRow.appendChild(statusFilterCell);
  
    // Add filter inputs for each remaining header
    headers.forEach(header => {
      const th = document.createElement('th');
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Filter ${beautifyLabel(header)}`;
      input.className = 'form-control';
      input.addEventListener('input', filterTable);
      th.appendChild(input);
      filterRow.appendChild(th);
    });
  
    document.getElementById('dataTable').appendChild(filterRow);
  }
  
  
  function filterTable() {
    const table = document.getElementById('dataTable');
    const filters = table.querySelectorAll('tr:nth-child(2) input'); // Filter row is second
    const rows = table.querySelectorAll('tr:not(:first-child):not(:nth-child(2))'); // Exclude header and filter row
  
    rows.forEach(row => {
      let isVisible = true;
  
      filters.forEach((input, index) => {
        const cell = row.cells[index + 2]; // Skip action and checkbox columns
        if (cell && input.value.trim() !== '') {
          const filterValue = input.value.toLowerCase();
          const cellValue = cell.textContent.toLowerCase();
  
          if (!cellValue.includes(filterValue)) {
            isVisible = false;
          }
        }
      });
  
      row.style.display = isVisible ? '' : 'none';
    });
  } 
  
  // Ensure this function is called when rendering the table
function renderTable(data) {
  const table = document.getElementById('dataTable');
  table.innerHTML = '';
  if (!data || !data.length) return;

  // Columns to exclude (case-insensitive)
  const excludeColumns = ['document number', 'userid', 'callback', 'unique_code', 'sheet_name'];

  // ✅ Get headers except excluded
  let headers = Object.keys(data[0]).filter(
    h => !excludeColumns.includes(h.toLowerCase())
  );

  // ✅ Sort alphabetically by beautified label
  headers.sort((a, b) =>
    beautifyLabel(a).localeCompare(beautifyLabel(b))
  );

  const headerRow = document.createElement('tr');

  // ----- Fixed columns -----
  const actionHeader = document.createElement('th');
  actionHeader.textContent = 'Action';
  headerRow.appendChild(actionHeader);

  const selectAllTh = document.createElement('th');
  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.row-select');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
  });
  selectAllTh.appendChild(selectAllCheckbox);
  headerRow.appendChild(selectAllTh);

  const statusHeader = document.createElement('th');
  statusHeader.textContent = 'Status';
  headerRow.appendChild(statusHeader);

  // ----- Dynamic, sorted headers -----
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = beautifyLabel(h);
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  // Optional filter row
  addFilters(headers);

  // ----- Data rows -----
  data.forEach(rowData => {
    const row = table.insertRow();
    row.classList.add('row-tabledata');

    // Action button
    const actionCell = row.insertCell();
    const showBtn = document.createElement('button');
    showBtn.className = 'btn btn-primary';
    showBtn.textContent = 'Show';
    showBtn.onclick = () => showDetails(rowData);
    actionCell.appendChild(showBtn);

    // Checkbox
    const checkboxCell = row.insertCell();
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'row-select';
    checkboxCell.appendChild(checkbox);

    // Status
    const statusCell = row.insertCell();
    const callback = (rowData.callback || '').toLowerCase();
    statusCell.textContent =
      callback === 'handleresponse' ? 'Created' :
      callback === 'updaterowdata' ? 'Updated' : '-';

    // Sorted dynamic cells
    headers.forEach(h => {
      const cell = row.insertCell();
      const val = formatDateTime(rowData[h]) || '';
      cell.textContent = val;
      cell.title = val;
    });
  });

  // Align + make sortable if you have those helpers
  alignTableCells();
  makeTableSortable("dataTable");
}



function alignTableCells() {
  const table = document.getElementById("dataTable");
  if (!table) return;

  table.querySelectorAll(".row-tabledata td").forEach(td => {
    const value = td.textContent.trim();
    // If the value is a valid number, align right, else align left
    if (value !== '' && !isNaN(Number(value))) {
      td.classList.add("align-right");
      td.classList.remove("align-left");
    } else {
      td.classList.add("align-left");
      td.classList.remove("align-right");
    }
  });
}

function makeTableSortable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const headers = table.querySelectorAll("thead th");
  headers.forEach((th, index) => {
    th.style.cursor = "pointer"; // show pointer
    th.addEventListener("click", () => {
      sortTableByColumn(table, index);
    });
  });
}

function sortTableByColumn(table, colIndex) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const isNumeric = rows.every(row => !isNaN(row.cells[colIndex].textContent.trim()));

  let asc = table.dataset.sortColumn !== colIndex || table.dataset.sortOrder === "desc";
  table.dataset.sortColumn = colIndex;
  table.dataset.sortOrder = asc ? "asc" : "desc";

  rows.sort((a, b) => {
    let aText = a.cells[colIndex].textContent.trim();
    let bText = b.cells[colIndex].textContent.trim();

    if (isNumeric) {
      aText = parseFloat(aText) || 0;
      bText = parseFloat(bText) || 0;
    } else {
      aText = aText.toLowerCase();
      bText = bText.toLowerCase();
    }

    if (aText > bText) return asc ? 1 : -1;
    if (aText < bText) return asc ? -1 : 1;
    return 0;
  });

  // Re-append sorted rows
  rows.forEach(row => tbody.appendChild(row));
}

  
  
  function addExportButton(data) {
    const container = document.getElementById('tablecontainer');
  
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export to Excel';
    exportBtn.className = 'btn btn-success'; // Bootstrap or your own style
    exportBtn.style.marginBottom = '10px';
    
    exportBtn.onclick = function () {
      exportToExcel(data);
    };
  
    container.appendChild(exportBtn); // Add button at top of container
  }
  

function isLikelyDate(value) {
    // Skip empty values or obviously non-date strings
    if (!value || typeof value !== 'string') return false;

    // Common date string patterns (ISO, short date, datetime with AM/PM, JS Date.toString())
    const dateRegex = [
        /^\d{4}-\d{2}-\d{2}T/,           // ISO 8601 datetime: "2025-05-20T12:30:00"
        /^\d{4}\/\d{2}\/\d{2}/,          // "2025/05/20"
        /^\d{2}\/\d{2}\/\d{4}/,          // "05/20/2025"
        /^\d{2}-\d{2}-\d{4}/,            // "05-20-2025"
        /\d{1,2}:\d{2} [AP]M/,           // "7:34 PM"
        /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/, // "2025-05-20 07:34"
        /^[A-Z][a-z]{2} [A-Z][a-z]{2}/   // "Tue Sep 16 2025 ..." (Date.toString())
    ];

    return dateRegex.some(regex => regex.test(value));
}

function formatDateTime(value) {
    if (!value || !isLikelyDate(value)) return value;

    let date;

    if (value instanceof Date && !isNaN(value.getTime())) {
        date = value;
    } else if (typeof value === 'string' && isLikelyDate(value)) {
        date = new Date(value);
        if (isNaN(date.getTime())) return value; // Invalid date string
    } else {
        return value; // Not a date-like value
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    // If time is exactly midnight, omit time part
    if (hours === 12 && minutes === '00' && ampm === 'AM') {
        return `${day}/${month}/${year}`;
    }

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

  
  
  // // Show Details Modal
  // function showDetails(rowData) {
  //   const modalBody = document.getElementById('modalBody');
  //   modalBody.innerHTML = "";
  
  //   const excludedFields = ["callback", "data", "customercode"];
  
  //   Object.entries(rowData).forEach(([key, value]) => {
  //     if (excludedFields.includes(key.toLowerCase())) return; // Skip excluded fields
  
  //     const formGroup = document.createElement('div');
  //     formGroup.className = 'mb-3';
  
  //     const label = document.createElement('label');
  //     label.className = 'form-label';
  //     label.textContent = key;
  
  //     const input = document.createElement('input');
  //     input.className = 'form-control';
  //     input.value = formatDateTime(value);
  //     input.disabled = true;
  //     input.dataset.key = key;
  
  //     formGroup.appendChild(label);
  //     formGroup.appendChild(input);
  //     modalBody.appendChild(formGroup);
  //   });
  
  //   const editBtn = document.getElementById('editBtn');
  //   editBtn.textContent = 'Edit';
  //   editBtn.onclick = function () {
  //     toggleEdit(this, rowData);
  //   };
  
  //   const modal = new bootstrap.Modal(document.getElementById('dataModal'));
  //   modal.show();
  // }
  
  // Toggle Edit/Save Mode
  function toggleEdit(button, rowData) {
    const inputs = document.querySelectorAll('#modalBody input');
  
    if (button.textContent === 'Edit') {
      inputs.forEach(input => input.disabled = false);
      button.textContent = 'Save';
    } else {
      inputs.forEach(input => {
        const key = input.dataset.key;
        rowData[key] = input.value; // Update the rowData with new values
        input.disabled = true;
      });
      console.log('Updated Data:', rowData); // Handle updated data here
      button.textContent = 'Edit';
    }
  }
  
  
  // Show details in a modal
  function showDetails(rowData) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = "";
  
    // Inject styles dynamically (if not already added)
    let styleTag = document.getElementById('dynamicGridStyles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamicGridStyles';
      styleTag.textContent = `
        .data-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem 1.5rem;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 12px;
        }
        .data-row {
          display: contents;
        }
        .data-grid label {
          font-weight: 600;
          color: #374151;
          text-align: left !important;     /* Ensure label text is left aligned */
          align-self: left;
        }
        .data-grid input {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          color: #111827;
        }
      `;
      document.head.appendChild(styleTag);
    }
  
    // Create a grid container
    const dataGrid = document.createElement('div');
    dataGrid.className = 'data-grid';
  
    Object.entries(rowData).forEach(([key, value]) => {
      const dataRow = document.createElement('div');
      dataRow.className = 'data-row';
  
      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = beautifyLabel(key);
  
      const input = document.createElement('input');
      input.className = 'form-control';
  
      // Format date fields before setting the value
      if (isDateField(key)) {
        input.value = formatDateTime(value);  // Format date if it's a date field
      } else {
        input.value = value || '';
      }
  
      input.disabled = true;
      input.dataset.key = key;
  
      dataRow.appendChild(label);
      dataRow.appendChild(input);
      dataGrid.appendChild(dataRow);
    });
  
    modalBody.appendChild(dataGrid);
  
    // Edit button setup
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
      editBtn.textContent = 'Edit';
      editBtn.onclick = function () {
        toggleEdit(this, rowData);
      };
    }
  
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('dataModal'));
    modal.show();
  
    // Optional: Remove style tag when modal is hidden
    const modalElement = document.getElementById('dataModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
      const existingStyle = document.getElementById('dynamicGridStyles');
      if (existingStyle) existingStyle.remove();
    }, { once: true });
  }
  
  // Function to check if the key corresponds to a date field
  function isDateField(key) {
    const dateFields = ['timestamp', 'date', 'created_at', 'updated_at'];  // Add your date fields here
    return dateFields.some(field => key.toLowerCase().includes(field));
  }
  
  
  // Toggle between edit and update
  function toggleEdit(button, rowData) {
    const inputs = document.querySelectorAll('#modalBody input');
    const editBtn = document.getElementById('editBtn');
  
    const disabledFields = ["timestamp", "document number", "callback", "sheet_name", "userid", "unique_code"];
  
    if (editBtn.textContent === 'Edit') {
      inputs.forEach(input => {
        if (!disabledFields.includes(input.dataset.key.toLowerCase())) {
          input.disabled = false;
        }
      });
      editBtn.textContent = 'Update';
    } else {
      const updatedData = {};
  
      inputs.forEach(input => {
        // Update 'Timestamp' field with current time
        if (input.dataset.key.toLowerCase() === "timestamp") {
          const newTime = formatDateTime(new Date().toISOString());
          input.value = newTime;
          updatedData[input.dataset.key] = newTime;
        } else {
          updatedData[input.dataset.key] = input.value;
        }
      });
  
      // Final update call
      updateData(updatedData);
    }
  }
  
  
  
  function updateData(rowData) {
    const inputs = document.querySelectorAll('#modalBody input');
    inputs.forEach(input => input.disabled = true);
    // console.log('Row Data:', rowData); // Confirm the data to be updated
  
    const sheetName = document.getElementById('sheetName').value;
    const documentNumber = rowData['Document Number'];
  
    // ✅ Construct the data object
    const data = {
      action: 'updateRowData',
      sheet_name: sheetName,
      document_number: documentNumber
    };
  
    // Merge rowData into the data object
    Object.assign(data, rowData);
  
    // ✅ Dynamically update the callback
    data.callback = `updaterowdata`;
  
    // Convert data to query string
    const queryString = new URLSearchParams(data).toString();
  
    // Send the request
    sendRequest(queryString, data.callback);
  }
  function sendRequest(queryString, callbackName) {
    const scriptURL = `https://script.google.com/macros/s/AKfycby4WEYQjiJJOg_nyP-oRLB39fatKNpu_9TMK__t91-3GJEEQDuY0F9mZ_OdByZI76Wa/exec?${queryString}`;
  
    // console.log('Sending request to:', scriptURL); // Debug the request URL
    // console.log('Sending request to:', callbackName); // Debug the request URL
  
    // ✅ Dynamic JSONP callback
    window[callbackName] = function (response) {
      // console.log('Server Response:', response); // Log the server response
  
      if (response.status === "success") {
        // alert('Data updated successfully!');
        errorNotificationHandler("success","Data updated successfully!")
        fetchData(); // Refresh the table after updating
      } else {
        alert('Error updating data: ' + response.message);
      }
  
      // ✅ Cleanup: Remove script tag and callback after response
      document.body.removeChild(script);
      delete window[callbackName];
    };
  
    // ✅ Create and append the script tag for JSONP
    const script = document.createElement('script');
    script.src = scriptURL;
    document.body.appendChild(script);
  }
    

  function beautifyLabel(key) {
    return key
      .replace(/_/g, ' ')                       // Replace underscores with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2')      // Add space before capital letters
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
  }
  

  function closeModal() {
    const modalElement = document.getElementById('dataModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.hide();
  }

  function simulateEsc() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }
  
  function simulateEsc() {
    const modalElement = document.getElementById('dataModal');
  
    // Fallback for older Bootstrap versions
    const modalInstance = modalElement.__bs_modal || new bootstrap.Modal(modalElement);
    modalInstance.hide();
  }

  function exportToExcel(data) {
    const excludedFields = []; // Do NOT exclude any fields
    const headers = Object.keys(data[0]);
  
    // Format each row just like in the table
    const formattedData = data.map(row => {
      const newRow = {};
  
      // Add Status field based on 'callback'
      const callback = (row.callback || '').toLowerCase();
      newRow['Status'] = callback === 'handleresponse' ? 'Created' :
                         callback === 'updaterowdata' ? 'Updated' : '-';
  
      // Format each field like your table
      headers.forEach(header => {
        const value = row[header];
        newRow[beautifyLabel(header)] = formatDateTime(value);
      });
  
      return newRow;
    });
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
    // Download the Excel file
    XLSX.writeFile(workbook, 'ExportedData.xlsx');
  }


const formNames = Array.from(document.querySelectorAll(".tosend"))
  .map(form => form.getAttribute("id"))
  .filter(id => id); // Remove null or empty ids

const datalist = document.getElementById("formNamesList");


formNames.forEach(id => {
  const option = document.createElement("option");

  // datalist only uses 'value' attribute to show suggestions
  // so use beautifyLabel(id) as the visible value if you want user to see label
  option.value =id; // value shown in dropdown

  // Optionally store raw id for internal use (not shown)
  option.setAttribute('data-id', beautifyLabel(id));

  datalist.appendChild(option);
});


  