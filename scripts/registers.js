// Target the datalist
const voucherList = document.getElementById("voucherList");

// Clear old options (optional, so no duplicates)
voucherList.innerHTML = "";

// Loop through all forms with class .tosendtransa
document.querySelectorAll('.tosendtransa').forEach(form => {
  const formId = form.id;

  // Create option
  const option = document.createElement("option");
  option.value = formId;                 // The actual value for input
  option.textContent = `Voucher - ${formId}`; // Nice label
  
  // Append to datalist
  voucherList.appendChild(option);
});

function findregister(event) {
  event.preventDefault(); // stop form from refreshing page

  const sheetName = event.target.querySelector("#searchvoucher").value.trim();
  const submitBtn = event.target.querySelector('[type="submit"]');

  if (!sheetName) {
    alert("Please enter a sheet name.");
    if (submitBtn) submitBtn.textContent = "Find";
    return;
  }

  const url = `https://script.google.com/macros/s/AKfycby4WEYQjiJJOg_nyP-oRLB39fatKNpu_9TMK__t91-3GJEEQDuY0F9mZ_OdByZI76Wa/exec?action=getAllData&sheet_name=${userid}_${sheetName}`;

  if (submitBtn) {
  submitBtn.disabled = true; // prevent double clicks
  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Fetching...`;
}


  fetch(url)
    .then(response => response.text())
    .then(text => {
      const cleanText = text.replace(/^undefined\(/, "").replace(/\)$/, "");
      const jsonData = JSON.parse(cleanText);
      if (jsonData.status === "success" && jsonData.all_data.length > 0) {
          // renderTable(jsonData.all_data);
          renderTransTable(text)
          window.open = jsonData.all_data
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Find";
        }

      } else {
        alert("No data found for the provided sheet name.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Find";
        }

      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while fetching data. Please check the console for details.");
            if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Find";
            }

    });
}

// --- Start of Simple JavaScript Solution with Detail Row Numbering ---
// The server response data
var responseText = `undefined({"status":"success","all_data":[
  {"Timestamp":"2025-09-23T18:38:16.000Z","Document Number":"USEHU20250924000815","Credit Account":"DITYR20250924000559","Profit Center":"STX9A1","instrumentDate":"2025-09-22T18:30:00.000Z","submission_id":"SUB-1758652694384","documenttype":"RECEIPT","Debit Account":10010002,"Amount":50000,"Description":"Payment for Invoice 1","sheet_name":"GCYVP20250923233851_Receiptform","Company Name":1000,"unique_code":"WBZHOO","Transaction Behavior":"Transaction","valueDate":"2025-09-22T18:30:00.000Z","paymentRef":78454845},
  {"Timestamp":"2025-09-24T16:09:41.000Z","Document Number":"ILSIT20250924213940","Credit Account":"LFGQQ20250924000700","Profit Center":"STX9A1","instrumentDate":"2025-09-23T18:30:00.000Z","submission_id":"SUB-1758730180779","documenttype":"RECEIPT","Debit Account":10010001,"Amount":5000,"Description":"Advance payment","sheet_name":"GCYVP20250923233851_Receiptform","Company Name":1000,"unique_code":"TO1P9H","Transaction Behavior":"Transaction","valueDate":"2025-09-23T18:30:00.000Z","paymentRef":""},
  {"Timestamp":"2025-10-02T13:07:03.000Z","Document Number":"JOHIW20251002183703","Credit Account":10010002,"Profit Center":"STX9A1","instrumentDate":"2025-10-01T18:30:00.000Z","submission_id":"SUB-1759410424460","documenttype":"RECEIPT","Debit Account":10010001,"Amount":45000,"Description":"Oct Invoice","sheet_name":"GCYVP20250923233851_Receiptform","Company Name":1000,"unique_code":"FJ687R","Transaction Behavior":"Transaction","valueDate":"2025-10-01T18:30:00.000Z","paymentRef":"dsf4654dsfsdhf"},
  {"Timestamp":"2025-10-02T13:25:13.000Z","Document Number":"KTPVW20251002185512","Credit Account":10010002,"Profit Center":"STX9A1","instrumentDate":"2025-10-01T18:30:00.000Z","submission_id":"SUB-1759410424460","documenttype":"RECEIPT","Debit Account":10010001,"Amount":4500,"Description":"Oct Fee","sheet_name":"GCYVP20250923233851_Receiptform","Company Name":1000,"unique_code":"08HXSW","Transaction Behavior":"Transaction","valueDate":"2025-10-01T18:30:00.000Z","paymentRef":12},
  {"Timestamp":"2025-09-24T16:12:25.000Z","Document Number":"OYFSR20250924214224","Credit Account":10010002,"Profit Center":"STX9A1","instrumentDate":"2025-09-23T18:30:00.000Z","submission_id":"SUB-1758730180779","documenttype":"RECEIPT","Debit Account":10010001,"Amount":45800,"Description":"Second part of advance","sheet_name":"GCYVP20250923233851_Receiptform","Company Name":1000,"unique_code":"7DIV5D","Transaction Behavior":"Transaction","valueDate":"2025-09-23T18:30:00.000Z","paymentRef":""}
]}` ;


const PREFIX = "receiptVoucher_";
const STORAGE_KEY = PREFIX + "detailHeaders";

// --- UTILITY FUNCTIONS ---



function formatIndianCurrency(amount) {
    const num = Number(amount);
    if (isNaN(num)) return amount;

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(num);
}

function formatDate(isoDateString) {
    if (!isoDateString) return "";
    try {
        const date = new Date(isoDateString);
        if (isNaN(date)) return isoDateString;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return isoDateString;
    }
}

function toggleCollapse(parentRow, collapseRow, arrow) {
    const detailDiv = collapseRow.querySelector('.collapse-content');

    const isCollapsed = detailDiv.style.maxHeight === '0px' || !detailDiv.style.maxHeight;

    if (isCollapsed) {
        // Show (Expand) - Use a large max-height for the animation
        detailDiv.style.maxHeight = '1000px'; 
        arrow.style.transform = 'rotate(90deg)';
        parentRow.style.backgroundColor = '#e9ecef';
        parentRow.style.borderBottom = '2px solid #0d6efd';
    } else {
        // Hide (Collapse)
        detailDiv.style.maxHeight = '0px'; 
        arrow.style.transform = 'rotate(0deg)';
        parentRow.style.backgroundColor = '';
        parentRow.style.borderBottom = '';
    }
}


// --- HEADER CONFIGURATION LOGIC ---

function getAllHeadersFromData() {
    try {
        const jsonStr = responseText.replace(/^undefined\(/, '').replace(/\)$/, '');
        const data = JSON.parse(jsonStr).all_data || [];
        if (data.length === 0) return [];
        
        const headers = Object.keys(data[0]);

        const excludedHeaders = ["sheet_name", "Transaction Behavior", "unique_code", "submission_id", "documenttype", "Timestamp", "instrumentDate"];
        return headers.filter(h => !excludedHeaders.includes(h));
    } catch (e) {
        console.error("Error parsing data for headers:", e);
        return [];
    }
}

function getHeaderSettings() {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    const allHeaders = getAllHeadersFromData();
    
    if (savedSettings) {
        return JSON.parse(savedSettings);
    } else {
        return allHeaders.map(header => ({
            key: header,
            label: beautifyLabel(header),
            visible: true
        }));
    }
}

function saveHeaderSettings() {
    const list = document.getElementById('header-list');
    const newSettings = [];

    Array.from(list.children).forEach(li => {
        const key = li.getAttribute('data-key');
        const checkbox = li.querySelector('input[type="checkbox"]');
        
        newSettings.push({
            key: key,
            label: beautifyLabel(key),
            visible: checkbox ? checkbox.checked : true
        });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    
    if (typeof closeCustomModal === 'function') {
        closeCustomModal(); 
    }
}
document.addEventListener('DOMContentLoaded',()=>{

    renderTransTable(responseText);
})

function showHeaderSettingsModal() {
    if (typeof openCustomModal !== 'function') {
        return console.error("openCustomModal function is not available.");
    }

    const settings = getHeaderSettings();
    
    const allUniqueKeys = getAllHeadersFromData();
    const existingKeys = settings.map(s => s.key);

    allUniqueKeys.forEach(key => {
        if (!existingKeys.includes(key)) {
            settings.push({
                key: key,
                label: beautifyLabel(key),
                visible: true
            });
        }
    });
    

    const listItems = settings.map(setting => `
        <li class="list-group-item d-flex justify-content-between align-items-center" data-key="${setting.key}" draggable="true" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
            <span class="flex-grow-1" style="cursor: move;">&#9776; ${setting.label}</span>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="check-${setting.key}" ${setting.visible ? 'checked' : ''}>
                <label class="form-check-label" for="check-${setting.key}">Show</label>
            </div>
        </li>
    `).join('');

    const modalContent = `
        <div class="modal-header-1">
            <h5 class="modal-title">Configure Detail Headers (Drag to Reorder)</h5>
        </div>
        <div class="modal-body">
            <p class="text-muted">Drag items to change sequence. Uncheck to hide the column.</p>
            <ul id="header-list" class="list-group">
                ${listItems}
            </ul>
        </div>
        <div class="modal-footer p-3">
            <button type="button" class="btn btn-secondary m-1" onclick="closeCustomModal()">Cancel</button>
            <button type="button" class="btn btn-primary m-1" onclick="saveHeaderSettings()">Save Changes</button>
        </div>
    `;

    openCustomModal(modalContent);
    
    setTimeout(() => {
        setupDragAndDrop();
    }, 100); 
}

// Global variables and drag-and-drop functions (simplified for self-contained code)
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';

    const target = e.target.closest('li');
    if (target && target !== draggedItem) {
        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);

        if (e.clientY > offset) {
            if (target.nextSibling !== draggedItem) {
                target.parentNode.insertBefore(draggedItem, target.nextSibling);
            }
        } else {
            if (target !== draggedItem.nextSibling) {
                target.parentNode.insertBefore(draggedItem, target);
            }
        }
    }
}

function handleDrop(e) {
    e.stopPropagation(); 
    draggedItem.style.opacity = '1';
    draggedItem = null;
}

function setupDragAndDrop() {
    const items = document.querySelectorAll('#header-list li');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', () => item.style.opacity = '1');
    });
}


// --- CORE RENDERING FUNCTION (MODIFIED FOR SCROLLING) ---

function renderTransTable(serverResponse) {
    const jsonStr = serverResponse.replace(/^undefined\(/, '').replace(/\)$/, '');
    const parsedResponse = JSON.parse(jsonStr);
    const all_data = parsedResponse.all_data || [];

    // Load configured detail headers
    const configuredHeaders = getHeaderSettings();
    const detailHeaders = configuredHeaders.filter(h => h.visible).map(h => h.key);

    const tbody = document.getElementById("voucherTableBody");
    if (!tbody) {
        return console.warn("voucherTableBody element not found.");
    }
    tbody.innerHTML = '';

    // Grouping data remains the same
    const grouped = all_data.reduce((acc, item) => {
        const id = item.submission_id;
        if (!acc[id]) acc[id] = [];
        acc[id].push(item);
        return acc;
    }, {});

    let srNo = 1;
    Object.entries(grouped).forEach(([submissionId, items]) => {
        const uniqueId = PREFIX + submissionId.replace(/-/g, '_');

        const first = items[0];
        const totalAmount = items.reduce((sum, i) => sum + Number(i.Amount || 0), 0);

        // Parent row (Summary row)
        const tr = document.createElement("tr");
        tr.id = `${uniqueId}_parentRow`;
        tr.innerHTML = `
            <td>${srNo++}</td>
            <td>${formatDate(first.Timestamp)}</td>
            <td>${formatDate(first.valueDate)}</td>
            <td>${first["Credit Account"]} / ${first["Debit Account"]}</td>
            <td>${beautifyLabel(first.documenttype)}</td>
            <td style="text-align: right;"><strong>${formatIndianCurrency(totalAmount)}</strong></td>
            <td><span style="background-color: #dc3545; color: white; padding: 0.25em 0.5em; border-radius: 0.25rem;">Unreconciled</span></td>
            <td style="text-align: center;">
                <span id="${uniqueId}_arrow" role="button" style="display: inline-block; transition: transform 0.2s ease-in-out; cursor: pointer; font-weight: bold;">
                    ▶
                </span>
            </td>
        `;
        tbody.appendChild(tr);

        // *** NEW: Attach Double-Click Listener ***
        tr.addEventListener("dblclick", () => {
            // Pass the submission ID and the full data array
            showTransactionDetailModal(submissionId, all_data);
        });

        // Collapsible detail row (unchanged)
        const collapseRow = document.createElement("tr");
        collapseRow.innerHTML = `
            <td colspan="8" style="padding: 0; border-top: none;">
                <div id="${uniqueId}_collapse" class="collapse-content" style="max-height: 0px; padding: 0; margin:0px; border: none; overflow-x: auto;">
                    <table class="innerscrolltable" style="width: 100%; min-width: max-content; margin-bottom: 0; font-size: 0.9em; border-collapse: collapse;">
                        <thead style="background-color: #e9ecef;">
                            <tr>
                                <th style=" border: 1px solid #dee2e6; width: 40px;">No.</th> 
                                ${detailHeaders.map(h => `<th style=" border: 1px solid #dee2e6;">${beautifyLabel(h)}</th>`).join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((it, i) => ` <tr>
                                    <td style=" border: 1px solid #dee2e6; text-align: center;">${i + 1}</td> 
                                    ${detailHeaders.map(h => {
                                        let value = it[h] ?? "";
                                        if (h === "Amount") {
                                            value = formatIndianCurrency(value);
                                        } else if (h === "valueDate") {
                                            value = formatDate(value);
                                        }
                                        return `<td style=" border: 1px solid #dee2e6;">${value}</td>`;
                                    }).join("")}
                                </tr>`).join("")}
                        </tbody>
                    </table>
                </div>
            </td>
        `;
        tbody.appendChild(collapseRow);

        // 6. Attach click listener for the arrow (unchanged)
        const arrow = document.getElementById(`${uniqueId}_arrow`);
        const parentRow = document.getElementById(`${uniqueId}_parentRow`);

        arrow.addEventListener("click", () => {
            toggleCollapse(parentRow, collapseRow, arrow);
        });
    });
}

// --- CONFIGURATION VARIABLES (MUST MATCH FORM FIELD NAMES) ---

// Fields that must be hidden from the modal entirely (e.g., system fields)
const HIDDEN_MODAL_FIELDS = ["sheet_name", "Transaction Behavior", "unique_code", "submission_id", "Timestamp"];

// Fields that are UNIQUE per row and should be displayed in the editable table.
// The sequence here defines the table column order.
// NOTE: 'Credit Account' is the Offsetting Account in the table.
const EDITABLE_DETAIL_FIELDS = [
    "Document Number", // Used for tracking
    "Credit Account",  // Matches the name in the data/form table
    "Amount",
    "Description", // Matches the name in the data/form table
    "paymentRef"   // Moved paymentRef to the table as it might be unique per transaction
];

// Fields that are constant across all transactions in the submission (Header fields)
const GROUPED_HEADER_FIELDS = [
    "Debit Account", // The GL Account from the header
    "valueDate",
    "instrumentDate",
    "Profit Center", // The Project from the header
    "Company Name",  // The Company Code from the header
];


// ... (fetchFormTemplate and beautifyLabel functions remain the same) ...

/**
 * Displays a transaction detail modal by fetching the original form template
 * and populating it with transaction data, matching database keys ONLY to input NAMES.
 *
 * @param {string} submissionId The ID of the transaction submission.
 * @param {Array<Object>} allData All transaction records retrieved from the server.
 */
async function showTransactionDetailModal(submissionId, allData) {
    if (typeof openCustomModal !== 'function') {
        return console.error("openCustomModal function is not available.");
    }

    // --- 1. Filter Data and Initial Validation ---
    const transactions = allData.filter(item => item.submission_id === submissionId);
    if (transactions.length === 0) {
        return alert("No detailed data found for this submission.");
    }

    const referenceTransaction = transactions[0];
    const sheetName = referenceTransaction.sheet_name;

    // --- 2. Identify the Form ID ---
    const parts = sheetName.split('_');
    const formId = parts.length > 1 ? parts[parts.length - 1] : null;
    if (!formId) {
        return console.error("Could not extract form ID from sheet_name:", sheetName);
    }

    // --- 3. Fetch the Template ---
    let formTemplateHtml;
    try {
        formTemplateHtml = await fetchFormTemplate(formId); 
    } catch (error) {
        return console.error("Failed to fetch form template:", error);
    }

    // --- 4. Process and Populate the Template ---
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formTemplateHtml;
    const formElement = tempDiv.querySelector('form'); 

    if (!formElement) {
        return console.error("Form element not found in the fetched template.");
    }
    
    // a) Populate Static Header Data by matching DB Key to Input NAME
    console.log("--- Starting Header Data Population by Input NAME ---");
    
    for (const dbKey in referenceTransaction) {
        // Exclude detail/system keys
        if (['Document Number', 'Amount', 'Timestamp', 'sheet_name', 'submission_id', 'unique_code', 'Credit Account', 'Description'].includes(dbKey)) continue; 

        let input = formElement.querySelector(`[name="${dbKey}"]`);

        if (input) {
            let value = referenceTransaction[dbKey] ?? '';
            
            // Handle date formatting
            if (dbKey.includes('Date') && value) {
                value = value.split('T')[0];
                input.type = 'date';
            }
            
            if (typeof value !== 'string') {
                value = String(value);
            }

            // ***************************************************************
            // CRITICAL CHANGE: Set BOTH the property AND the HTML attribute
            // This ensures the value persists when innerHTML is generated.
            input.value = value; 
            input.setAttribute('value', value); 
            // ***************************************************************
            
            input.setAttribute('readonly', 'true');
            console.log(`SUCCESS: Populated input [name="${dbKey}"] with value: ${value}`);

        } else {
            if (!['callback'].includes(dbKey)) { 
                 console.log(`WARNING: Input not found for database key: "${dbKey}". Ensure its NAME attribute is "${dbKey}".`);
            }
        }
    }
    console.log("--- Header Data Population Complete ---");

    // b) Generate and Populate Dynamic Detail Data (All Rows)
    const detailTableBody = formElement.querySelector('#ItemDataTableForReceiptPayment'); 
    
    if (!detailTableBody) {
        console.warn("Detail table body (#ItemDataTableForReceiptPayment) not found in template. Skipping detail population.");
    } else {
         detailTableBody.innerHTML = ''; 
         
         // Fields for the detail table
         const DETAIL_FIELDS = ['Credit Account', 'Amount', 'Description', 'Document Number']; 
         
         transactions.forEach((item, rowIndex) => {
             const docNum = item["Document Number"];
             
             let rowHtml = `<tr class="credit-entry-row" data-doc-num="${docNum}">`;
             rowHtml += `<td>${rowIndex + 1}</td>`; 

             DETAIL_FIELDS.forEach(key => {
                 let value = item[key] ?? '';
                 let inputType = 'text';
                 let classList = 'form-control form-control-sm detail-input';
                 
                 if (key === "Document Number") {
                     rowHtml += `<input type="hidden" name="Document Number" class="doc-num-tracker" value="${value}">`;
                     return; 
                 }

                 if (key === "Amount") {
                     inputType = 'number';
                     classList += ' amount text-end';
                     value = parseFloat(value).toFixed(2);
                 }
                 
                 // Generate input field for detail rows (using key as NAME)
                 // NOTE: The 'value' attribute is set directly in the string here.
                 rowHtml += `
                     <td>
                         <input type="${inputType}" class="${classList}" 
                                data-key="${key}" value="${value}" name="${key}" readonly>
                     </td>
                 `;
             });

             rowHtml += `
                 <td><button type="button" class="btn btn-sm btn-danger delete-row-button" disabled>Delete</button></td>
             </tr>`;
             
             detailTableBody.innerHTML += rowHtml;
         });

         const totalAmountElement = formElement.querySelector('#totalAmount');
         if (totalAmountElement) {
             const total = transactions.reduce((sum, t) => sum + parseFloat(t.Amount || 0), 0);
             totalAmountElement.textContent = total.toFixed(2);
         }
    }

    // --- 5. Construct Final Modal Wrapper ---
    const modalContent = `
        <div class="header">
            <h5 class="modal-title">Edit Submission: ${submissionId}</h5>
        </div>
        <div class="body">
            <form id="editReceiptForm" class="tosendtransa">
                ${formElement.innerHTML} 
            </form>
        </div>
        <div class="footer">
            <button type="button" class="btn btn-secondary" onclick="closeCustomModal()">Close</button>
            <button type="button" class="btn btn-info" id="editButton" onclick="enableEditModeForm()">Edit</button>
            <button type="button" class="btn btn-primary d-none" id="saveButton" onclick="handleSaveForm('${submissionId}')">Save Changes</button>
        </div>
    `;

    // --- 6. Open Modal ---
    openCustomOffcanvas("Entry Display/Edit",modalContent);
}

// Example data structure for testing purposes (simulating parsing the responseText)
const rawData = JSON.parse(responseText.replace('undefined(', '').slice(0, -1));
const allData = rawData.all_data;
// --- NEW HELPER FUNCTIONS FOR FORM EDITING ---

function enableEditModeForm() {
    // Enable all inputs in the header (grouped fields)
    document.querySelectorAll('#editReceiptForm .form-group input').forEach(input => {
        input.removeAttribute('readonly');
        input.style.backgroundColor = '#fffbe7';
    });
    
    // Enable all inputs in the detail table
    document.querySelectorAll('#ItemDataTableForReceiptPayment .detail-input').forEach(input => {
        input.removeAttribute('readonly');
        input.style.backgroundColor = '#fffbe7';
    });
    
    // Enable delete buttons
    document.querySelectorAll('#ItemDataTableForReceiptPayment .delete-row-button').forEach(button => {
        button.removeAttribute('disabled');
    });

    // Toggle button visibility
    document.getElementById('editButton').classList.add('d-none');
    document.getElementById('saveButton').classList.remove('d-none');
}

/**
 * Extracts data from the structured form and prepares the payload for the server update.
 * @param {string} submissionId The unique ID of the entire submission.
 */
function handleSaveForm(submissionId) {
    const form = document.getElementById('editReceiptForm');
    const headerData = {};
    const detailData = [];

    // 1. Extract Header (Grouped) Data
    GROUPED_HEADER_FIELDS.forEach(key => {
        const input = form.querySelector(`input[name="${key}"]`);
        if (input) {
            headerData[key] = input.value;
        }
    });
    
    // Add hidden/constant fields
    headerData["documenttype"] = form.querySelector('input[name="documenttype"]').value;
    headerData["Transaction Behavior"] = form.querySelector('input[name="Transaction Behavior"]').value;
    headerData["submission_id"] = submissionId; // Key identifier for the entire group

    // 2. Extract Detail (Table) Data
    const rows = form.querySelectorAll('#ItemDataTableForReceiptPayment tr.credit-entry-row');
    rows.forEach(row => {
        // Only collect data from rows NOT marked for deletion (if you implement deletion logic)
        
        const rowObject = { ...headerData }; // Start with all header data
        
        // Find the Document Number (the hidden input used to track the row)
        const docNumInput = row.querySelector('.doc-num-tracker');
        rowObject["Document Number"] = docNumInput ? docNumInput.value : null;

        // Get all editable fields for this row
        row.querySelectorAll('.detail-input').forEach(input => {
            rowObject[input.name] = input.value;
        });

        // If the row is valid and not empty, push it
        if (rowObject["Document Number"] && rowObject["Amount"]) {
             detailData.push(rowObject);
        }
    });

    console.log("--- Final Server Update Payload (Structured Array) ---");
    console.log(detailData);
    
    // Call your final server update function
    updateTransactionRecord(detailData);
}

// Ensure the updateTransactionRecord function is available and handles an array of objects
/*
function updateTransactionRecord(transactions) {
    // ... server update logic goes here ...
}
*/



// --- INITIALIZATION & EVENT LISTENERS ---

// document.addEventListener('keydown', (e) => {
//     if (e.altKey && e.key === '6') {
//         e.preventDefault();
//         showHeaderSettingsModal();
//     }
// });

renderTransTable(responseText);
document.addEventListener('DOMContentLoaded', () => {
});




// document.addEventListener('keydown', (e) => {
//     // 1. PRIMARY CHECK: Is the Control key pressed?
//     // console.log(e.key)
//     // Use e.ctrlKey for cross-browser reliability (Cmd key on macOS often registers as ctrlKey or metaKey)
//     if (!e.ctrlKey) {
//         // console.log("running: No Ctrl key."); // Debug
//         return; // Exit if Ctrl key is not the modifier
//     }
//     // Optional: Prevent default browser actions (like Ctrl+P for Print, Ctrl+S for Save)
//     // We only prevent default if we know we are handling the key.
    
//     // 2. CONTEXT CHECK: Fetch the current section ID
//     const currentSecID = localStorage.getItem("PreviousSecID");
//     console.log(currentSecID)
//     // console.log("Current SecID:", currentSecID); // Debug
//     // console.log("Ctrl + Key pressed:", e.key); // Debug

    
//     // 3. SECTION-SPECIFIC EXECUTION (Case: "transactions")
//     if (currentSecID === "transactions") {
        
//         // Handle specific key presses for the 'transactions' section
//         switch (e.key) {
//             case '6':
//                 // Shortcut: Ctrl + 6 (Column Reorder/Hide)
//                 e.preventDefault(); // Prevent browser default for Ctrl+6 (if any)
//                 console.log("EXECUTE: Ctrl + 6 for 'transactions'");
//                 showHeaderSettingsModal();
//                 break;
            
//             // Example of another shortcut for the 'transactions' section:
//             // case 'e':
//             //     // Shortcut: Ctrl + E (Export Data)
//             //     e.preventDefault(); 
//             //     console.log("EXECUTE: Ctrl + E for 'transactions'");
//             //     // runTransactionsExport();
//             //     break;

//             default:
//                 // No custom action defined for this Ctrl + Key combination in this section.
//                 return; 
//         }
//     } 
    
//     // 4. ADD MORE SECTIONS HERE:
//     // else if (currentSecID === "ledgers") {
//     //     switch (e.key) {
//     //         case '6':
//     //             e.preventDefault();
//     //             console.log("EXECUTE: Ctrl + 6 for 'ledgers'");
//     //             // runLedgersSpecificModal();
//     //             break;
//     //     }
//     // }
// });

/**
 * Fetches the HTML content of a form template element from the current document
 * using its ID.
 * * NOTE: This function simulates the server-side template retrieval by looking
 * for a globally available, hidden DOM element.
 *
 * @param {string} formId The ID of the form element to retrieve (e.g., 'Receiptform').
 * @returns {Promise<string>} A Promise that resolves with the form's outer HTML string.
 */
function fetchFormTemplate(formId) {
    // Wrap in a Promise to simulate the asynchronous nature of a real fetch/AJAX call
    return new Promise((resolve, reject) => {
        const form = document.getElementById(formId);
        
        console.log(`Attempting to fetch template with ID: ${formId}`);

        if (form && form.outerHTML) {
            // Success: Return the HTML string of the form element
            console.log(`Template for ${formId} found and converting to HTML string.`);
            resolve(form.outerHTML);
        } else {
            // Failure: Reject the promise or resolve with an error message
            console.error(`Error: Form element with ID "${formId}" not found in the DOM.`);
            reject(`Form template not found for ID: ${formId}`);
        }
    });
}