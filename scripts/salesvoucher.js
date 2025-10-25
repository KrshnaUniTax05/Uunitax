

  function updateAmount(form) {
  if (!form || form.tagName.toLowerCase() !== 'form') {
    console.warn("❌ Provided element is not a valid form.");
    return;
  }
  // console.log(form)
  const tableBody = form.querySelector("#ItemDataTable");


  if (!tableBody) {
    // console.warn("⚠️ No #ItemDataTable found inside the form.");
    return;
  }

  // Add only once
  if (!tableBody.dataset.listenerAttached) {
    tableBody.dataset.listenerAttached = "true"; // Prevent duplicate listeners

    tableBody.addEventListener("input", function (event) {
      const target = event.target;

      // Only proceed if the change is in rate or quantity
      if (target.classList.contains("rate") || target.classList.contains("quantity")) {
        const row = target.closest("tr");
        if (!row) return;

        const rateInput = row.querySelector(".rate");
        const qtyInput = row.querySelector(".quantity");
        const amountInput = row.querySelector(".amount");

        if (!rateInput || !qtyInput || !amountInput) return;

        const rate = parseFloat(rateInput.value.replace(/,/g, '')) || 0;
        const qty = parseFloat(qtyInput.value.replace(/,/g, '')) || 0;

        const amount = rate * qty;

        amountInput.value = formatNumberIndianForForm(amount);
        updateTotal(form); // Update total after recalculation
      }
    });
  }
}

function updateTotal(form) {
  if (!form || form.tagName.toLowerCase() !== 'form') {
    console.warn("❌ Provided element is not a valid form.");
    return;
  }
  // console.log(form)
  let total = 0;

  form.querySelectorAll(".amount").forEach(input => {
    const raw = input.value || input.textContent || "0";
    const cleanValue = raw.toString().replace(/,/g, '');
    const number = parseFloat(cleanValue);
    if (!isNaN(number) && number > 0) {
      total += number;
    }
  });

  const totalDisplay = form.querySelector("#totalAmountsales");
   if (totalDisplay) {
    totalDisplay.textContent = formatNumberIndianForForm(total);
  } else {
    console.warn(form,"❌ No #totalAmountsales element found inside this form.");
  }

  // ✅ Update GST summary
  generateGSTSummaryTable(form);
}

function updateSerials(form) {
  const table = form.querySelector("table");
  if (!table) return;

  // Check if the table contains any cell with text "gst" (case-insensitive)
  const hasGst = Array.from(table.querySelectorAll("td, th"))
    .some(cell => cell.textContent.toLowerCase().includes("gst"));

  if (hasGst) return; // Don't update serials if "gst" is found

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row, index) => {
    const srNoCell = row.querySelector(".sr-no");
    if (srNoCell) srNoCell.textContent = index + 1;
  });
}


document.querySelectorAll("form").forEach(form => {
  const addBtn = form.querySelector(".add-row-button");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addRowToFormTable(form);
    });
  }
});

document.addEventListener("click", function (event) {
  // ✅ Only run when a delete button is clicked
  if (!event.target.classList.contains("delete-row-button")) return;

  const form = event.target.closest("form");
  const row  = event.target.closest("tr");
  if (!form || !row) return;

  const tableBody = form.querySelector(".form-table-body, table tbody");
  if (!tableBody) return console.error("❌ No table body found inside form", form);

  const formCode = form.dataset.formCode || "(no code)";
  console.log(`🗑️ Delete clicked in form [${formCode}]`);

  // ✅ Enforce at least one row remains
  if (tableBody.rows.length > 1) {
    row.remove();
    updateSerials(form);
  } else {
    // alert("⚠️ At least one row must remain in this form.");
    errorNotificationHandler("error", "At least one row must remain in this form.")
  }
});

function addRowToFormTable(form) {
  if (!form) return console.error("❌ No form passed");
  const tableBody = form.querySelector("table tbody");
  if (!tableBody) return console.error("❌ No <tbody> found inside the form.");

  const formCode = form.dataset.formCode || "(no code)";
  console.log(`➕ Adding row to form [${formCode}] , ${form.id}`);


  let offsetting;
  if(form.id === "Receiptform" ){
    offsetting = "Credit Account"
  } else {
    offsetting = "Debit Account"
  }
  // ----- Special case: Receipt/Payment -----
  if (form.classList.contains("receiptpayment")) {
    const rowCount = tableBody.querySelectorAll("tr").length + 1;
    const firstInput = tableBody.querySelector("tr:first-child td input[list]");
    const listId = firstInput ? firstInput.getAttribute("list") : "";

    const newRow = document.createElement("tr");
    newRow.className = "credit-entry-row";
    newRow.innerHTML = `
      <td class="sr-no">${rowCount}</td>
      <td><input type="text" class="form-control" ${listId ? `list="${listId}"` : ""} name="${offsetting}"></td>
      <td><input type="number" class="form-control amount" name="Amount" step="0.01" style="text-align: right;"></td>
      <td><input type="text" class="form-control" name="Description" autocomplete="on"></td>
      <td><button type="button" class="btn btn-primary delete-row-button">Delete</button></td>
    `;
    tableBody.appendChild(newRow);
    updateSerials(form);
    return;
  }

  // ----- General case -----
  const firstRow = tableBody.querySelector("tr");
  if (!firstRow) return console.error("❌ No first row to copy from.");
  const rowCount = tableBody.querySelectorAll("tr").length + 1;

  const newRow = document.createElement("tr");
  newRow.className = "credit-entry-row";

  const cells = [];
  cells.push(`<td class="sr-no">${rowCount}</td>`);

  const originalInputs = firstRow.querySelectorAll("input:not([type=hidden])");
  originalInputs.forEach(input => {
    let attrs = Array.from(input.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(" ");

    // Make sure we keep the original datalist if present
    const listAttr = input.getAttribute("list");
    if (listAttr) attrs = attrs.replace(/list=".*?"/, `list="${listAttr}"`);

    cells.push(`<td><input ${attrs}></td>`);
  });

  const hiddenInputs = firstRow.querySelectorAll("input[type='hidden']");
  hiddenInputs.forEach(input => {
    const attrs = Array.from(input.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(" ");
    cells.push(`<input ${attrs}>`);
  });

  cells.push(`<td><button type="button" class="btn btn-primary delete-row-button">Delete</button></td>`);

  newRow.innerHTML = cells.join("\n");
  tableBody.appendChild(newRow);
  updateSerials(form);
}




document.querySelectorAll('.table input[type="number"]').forEach(input => {
      input.style.textAlign = "right";
    });

// Universal input tracker for all forms on the page
document.addEventListener("input", (event) => {
  const input = event.target;
  const form = input.closest("form");

  if (!form) return; // Ignore inputs not inside a form

  // Log the input and its parent form
  // console.log("📝 Input changed in form:", form);
  // console.log("➡️ Field name:", input.name || input.className);
  // console.log("➡️ New value:", input.value);

  // ✅ Call your update logic here
  // updateTotal(form);
  updateAmount(form);
  // updateSerials(form)
  
});

  
document.querySelectorAll("form").forEach(form => {
  updateSerials(form);
});

function clearTaxSummaryIDIfExists(form) {
  if(form.classList.contains("receiptpayment")){
    return
  }


  if (!form || form.tagName.toLowerCase() !== 'form') {
    console.warn("❌ Provided element is not a valid form.");
    return;
  }

  const summaryDiv = form.querySelector('#tax-summary-working');
  if (summaryDiv) {
    summaryDiv.innerHTML = ''; // Clear the ID
    // console.log("✅ Cleared #tax-summary-working ID in form.");
  } else {
    console.log("ℹ️ No #tax-summary-working div found in form.");
  }
}













const scriptURL = 'https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec';

document.addEventListener('change', function(event) {
  if (event.target.matches('.itemName')) {
    const input = event.target;
    const identifier = "UID_" + Math.floor(Math.random()*50000)+"_"+generateCode(10)
    input.dataset.identifier = identifier;
    const itemName = input.value.trim();
    const row = input.closest('tr');
    showLoaderOnInput(input)
    // console.log("inputsee:",input)

    if (!itemName) return;

    console.log('Item Selected:', itemName);
    console.log('Row Element:', row);

    // Store row reference for callback use
    ItemRowInputHandler._currentRow = row;

    const sheetName = userId + "_Stock"; // Assuming userId is globally defined
    const columnNameji = input.dataset.column_name_add || 'itemName';
    const callbackName = 'ItemRowInputHandler';

    // Remove existing script if any
    const oldScript = document.getElementById('jsonp-script');
    if (oldScript) oldScript.remove();

    // Create JSONP script call
    const script = document.createElement('script');
    script.id = 'jsonp-script';
    script.src = `${scriptURL}?action=getRowData&sheet_name=${sheetName}&column_to_search=${columnNameji}&document_number=${encodeURIComponent(itemName)}&callback=${callbackName}&unique_code=${identifier}`;
    document.body.appendChild(script);

    console.log('JSONP Request Sent:', script.src);
  }
    // console.log("Non Input Select: ", event.target.id)
    // const input = event.target;
    // const identifier = generateCode(10)
    // input.dataset.identifier = identifier
    // console.log(identifier, input)
    // nonItemSelectChange(event, identifier)
});


function nonItemSelectChange(event, identifier) {
  // Prevent the default form submission (if this were an 'onsubmit' handler)
  event.preventDefault();

  // 1. Get the element that triggered the event (the input/select)
  const targetElement = event.target;

  // 2. Get the name of the element (which you are using as the identifier)
  // This will be something like "Debit Account"
  const inputName = targetElement.name;

  // 3. Find the element by its *name attribute* within the form
  // You must use an attribute selector: [name="VALUE"]
  // Since 'targetElement' *is* the element you want to style, you can use it directly.
  // If you must query for it, use: form.querySelector(`[name="${inputName}"]`);
  
  // Using the target element directly is simpler and more efficient:
  const elementToStyle = targetElement; 

  // 4. Style the element
  if (elementToStyle) {
    // Clear previous outline and then apply the new one
    elementToStyle.style.outline = 'none';
    elementToStyle.style.outline = '1px solid yellow';
  }

  // --- JSONP / API Request Logic ---
  const callbackName = "OffsetDataAppend";
  const inputVal = targetElement.value;
  // Assuming 'userId' and 'scriptURL' are defined in the surrounding scope
  const sheetName = userId + "_LedgerCreation";
  const columnNameji = "ledgerCode";

  const script = document.createElement('script');
  script.id = 'jsonp-script';

  // Construct the source URL with encoded parameters
  const source = `${scriptURL}?action=getRowData&sheet_name=${sheetName}&column_to_search=${encodeURIComponent(columnNameji)}&document_number=${encodeURIComponent(inputVal)}&callback=${callbackName}&unique_code=${identifier}`;
  
  script.src = source; // Assign the source to the script element

  // Append the script to the body to execute the JSONP request
  document.body.appendChild(script);

  console.log('Identifier:', identifier);
  console.log('JSONP Request Sent:', source);
}
  function OffsetDataAppend(data){
    console.log('📦 Full Server Response:', data);

    if (!data || data.status !== 'success' || !Array.isArray(data.matching_rows) || data.matching_rows.length === 0) {
      console.warn('❌ Invalid or empty response from server.');
      // console.groupEnd();
      return;
    }
    const item = data.matching_rows[0];
    const serverIdentifier = data.uniqueCode;
    console.log('✅ Server Provided Identifier:', serverIdentifier);
  }

function ItemRowInputHandler(data) {
  // console.group("🔍 ItemRowInputHandler Debug");
  console.log('📦 Full Server Response:', data);

  if (!data || data.status !== 'success' || !Array.isArray(data.matching_rows) || data.matching_rows.length === 0) {
    console.warn('❌ Invalid or empty response from server.');
    // console.groupEnd();
    return;
  }
  const item = data.matching_rows[0];
  const serverIdentifier = data.uniqueCode;
  console.log('✅ Server Provided Identifier:', serverIdentifier);
  console.log('⚠️ Item Object\'s unique_code (may be wrong):', item.unique_code);

  const matchingInput = document.querySelector(`.table .itemName[data-identifier="${serverIdentifier}"]`);
  if (!matchingInput) { 
    console.warn('❌ No input found with identifier:', serverIdentifier);
    errorNotificationHandler("error", `No input found with identifier:, ${serverIdentifier}`)
    // console.groupEnd();
    return;
  }
  removeLoaderFromInput(matchingInput)


  const row = matchingInput.closest('tr');
  const form = row.closest('form')
  if (!row) {
    console.warn('❌ No table row found for matching input');
    errorNotificationHandler("error", "No table row found for matching input")
    console.groupEnd();
    return;
  }

  console.log('🆗 Matched Table Row:', row);

  const fieldMap = {
    "ItemDocumentNumber": "Document Number",
    "Description": "Description",
    "ItemUnit": "ItemUnit",
    "itemGroup": "itemGroup",
    "ItemTax": "ItemTax",
    "ItemCode": "Stock Code",
    "itemHSN": "itemHSN",
    // "Rate": "Rate"
  };

  // console.group("🛠️ Field Update Debugging");
  Object.entries(fieldMap).forEach(([inputName, itemKey]) => {
    const inputEl = row.querySelector(`input[name="${inputName}"]`);
    if (inputEl) {
      const oldValue = inputEl.value;
      const newValue = item[itemKey] || '';
      inputEl.value = newValue;
      // console.log(`✅ [${inputName}] Updated: "${oldValue}" → "${newValue}"`);
    } else {
      console.warn(`⚠️ Missing input element: input[name="${inputName}"]`);
    }
  });
  // console.groupEnd();

  // console.log('✅ Final updated row values:', {
  //   ItemDocumentNumber: row.querySelector('input[name="ItemDocumentNumber"]')?.value,
  //   Description: row.querySelector('input[name="Description"]')?.value,
  //   ItemUnit: row.querySelector('input[name="ItemUnit"]')?.value,
  //   itemGroup: row.querySelector('input[name="itemGroup"]')?.value,
  //   ItemTax: row.querySelector('input[name="ItemTax"]')?.value,
  //   itemHSN: row.querySelector('input[name="itemHSN"]')?.value,
  //   Rate: row.querySelector('input[name="Rate"]')?.value
  // });

  // ✅ Remove the data-identifier after success
  matchingInput.removeAttribute('data-identifier');
  // console.log(`🧹 Removed data-identifier from input`, matchingInput);

  console.groupEnd(); // End Debug
  generateGSTSummaryTable(form);

}


function generateGSTSummaryTable(form) {
  if (!form || form.tagName.toLowerCase() !== 'form') {
    console.warn("❌ Provided element is not a valid form.");
    return;
  }

  if(form.classList.contains("receiptpayment")){
    return
  }

  const rows = form.querySelectorAll('table tbody tr');
  const taxSummary = {};

  rows.forEach(row => {
    const docInput = row.querySelector('input[name="ItemDocumentNumber"]');
    const amountInput = row.querySelector('input[name="amount"], .amount');
    const taxRateInput = row.querySelector('input[name="ItemTax"]');

    if (!docInput || !docInput.value.trim()) return;
    if (!amountInput || !(amountInput.value || amountInput.textContent)) return;

    const rawAmount = amountInput.value || amountInput.textContent || '0';
    const cleanAmount = rawAmount.toString().replace(/,/g, '');
    const amount = parseFloat(cleanAmount);

    if (isNaN(amount) || amount <= 0) return; // ⛔ Ignore non-numeric or 0 amounts

    const taxRate = parseFloat(taxRateInput?.value) || 0;

    if (!taxSummary[taxRate]) {
      taxSummary[taxRate] = 0;
    }
    taxSummary[taxRate] += amount;
  });

  const summaryContainer = form.querySelector('#tax-summary-working');
  if (!summaryContainer) {
    console.warn("⚠️ No #tax-summary-working div found in form.");
    return;
  }

  summaryContainer.innerHTML = ''; // Clear old summary

  const table = document.createElement('table');
  table.className = 'table tax-summary';
  table.innerHTML = `
    <tr>
      <td><strong>Tax Rate (%)</strong></td>
      <td><strong>Amount</strong></td>
      <td><strong>CGST</strong></td>
      <td><strong>SGST</strong></td>
      <td><strong>IGST</strong></td>
      <td><strong>Invoice Total</strong></td>
    </tr>
  `;

  let totalAmount = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0;

  for (const [rate, amount] of Object.entries(taxSummary)) {
    const taxRate = parseFloat(rate);
    const cgst = (taxRate / 2) * amount / 100;
    const sgst = (taxRate / 2) * amount / 100;
    const igst = 0; // Modify if IGST applies
    const invoiceAmount = amount + cgst + sgst + igst;

    totalAmount += amount;
    totalCGST += cgst;
    totalSGST += sgst;
    totalIGST += igst;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${taxRate.toFixed(2)}%</td>
      <td>${formatNumberIndianForForm(amount)}</td>
      <td>${formatNumberIndianForForm(cgst)}</td>
      <td>${formatNumberIndianForForm(sgst)}</td>
      <td>${formatNumberIndianForForm(igst)}</td>
      <td>${formatNumberIndianForForm(invoiceAmount)}</td>
    `;
    table.appendChild(row);
  }

  const grandTotal = totalAmount + totalCGST + totalSGST + totalIGST;

  const totalRow = document.createElement('tr');
  totalRow.style.fontWeight = "bold";
  totalRow.innerHTML = `
    <td>Total</td>
    <td>${formatNumberIndianForForm(totalAmount)}</td>
    <td>${formatNumberIndianForForm(totalCGST)}</td>
    <td>${formatNumberIndianForForm(totalSGST)}</td>
    <td>${formatNumberIndianForForm(totalIGST)}</td>
    <td>${formatNumberIndianForForm(grandTotal)}</td>
  `;
  table.appendChild(totalRow);

  summaryContainer.appendChild(table);
}


function formatNumberIndianForForm(num, decimals = 2) {
  const number = parseFloat(String(num).replace(/,/g, ''));

  if (isNaN(number)) return '';

  return number.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}



function showLoaderOnInput(input) {
  // input.disabled = true;
  input.style.outline = "1px solid orange";
  input.style.transition = "opacity 1s ease";

  input.blur();

  // Create loader element
  const loader = document.createElement("span");
  loader.className = "input-loader";
  loader.style.position = "absolute";
  loader.style.width = "16px";
  loader.style.height = "16px";
  loader.style.border = "2px solid #f3f3f3";
  loader.style.borderTop = "2px solid orange";
  loader.style.borderRadius = "50%";
  loader.style.animation = "spin 1s linear infinite";
  loader.style.opacity = "0";
  loader.style.transition = "opacity 1s ease";
  loader.style.pointerEvents = "none";

  // Position relative to input
  const rect = input.getBoundingClientRect();
  loader.style.position = "fixed";
  loader.style.top = rect.top + window.scrollY + input.offsetHeight / 2 - 8 + "px";
  loader.style.left = rect.right - 20 + "px";

  // Add keyframes once
  if (!document.getElementById("spin-keyframes")) {
    const style = document.createElement("style");
    style.id = "spin-keyframes";
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(loader);

  // Trigger fade-in
  requestAnimationFrame(() => {
    loader.style.opacity = "1";
  });

  // Store loader reference
  input._loader = loader;
}

function removeLoaderFromInput(input) {
  input.disabled = false;
  input.style.outline = "";
  input.style.transition = "opacity 1s ease";


  const loader = input._loader;
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
        input._loader = null;
      }
    }, 1000); // matches the fade-out duration
  }
}



function addadditonaldata(param) {
  let mainFormId;
  let mainForm;

  // Case 1: Called by button → param is an element (e.g., button)
  if (param instanceof HTMLElement) {
    const parentCard = param.closest(".card");
    if (parentCard) {
      mainForm = parentCard.querySelector("form");
      if (mainForm) {
        mainFormId = mainForm.id;
      } else {
        console.warn("⚠️ No form found inside the same .card as the button.");
        return;
      }
    } else {
      console.warn("⚠️ Button is not inside any .card container.");
      return;
    }
  } 
  // Case 2: Called directly by JS → param is form ID string
  else if (typeof param === "string") {
    mainForm = document.getElementById(param);
    mainFormId = param;
  } 
  // Invalid call
  else {
    console.error("❌ Invalid parameter passed to addadditonaldata(). Expected HTMLElement or string.");
    return;
  }

  // Validate found form
  if (!mainForm) {
    console.warn(`⚠️ Main form with ID "${mainFormId}" not found.`);
    return;
  }

  console.log("[DEBUG] Found form inside .card:", mainFormId);
  

    // 2. Define the ID of the container where the new form content should go
    const containerId = "additionalDataContainer";
    let container = mainForm.querySelector(`#${containerId}`);

    if (!container) {
        // If the container doesn't exist, create it and append it to the main form
        container = document.createElement('div');
        container.id = containerId;
        mainForm.appendChild(container);
        console.log(`[DEBUG] Created container #${containerId} inside #${mainFormId}`);
    } else {
        // Prevent duplicates if content is already loaded.
        if (container.innerHTML.trim() !== "") {
            console.log("Additional data form already exists.");
            return;
        }
    }

    // 3. Define the HTML/CSS code to be injected
    // The name attribute patterns for the date and mobile inputs have been adjusted 
    // to use double backslashes for proper escaping in the JavaScript string.
    const code = `
    <head>  
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
    
    
    
    
<body>
  
      <style>
        /* All your provided CSS, modified to be scoped or more robust */
        #Additional_Data_Content .form-container {
            max-width: 1000px;
            margin: 20px 0; /* Adjusted margin for insertion */
            background: #fff;
            border-radius: 12px;
            padding: 25px 35px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        #Additional_Data_Content h2 { text-align: left; margin-bottom: 20px; font-weight: 600; color: #333; }
        #Additional_Data_Content fieldset { border: 1px solid #e0e0e0; border-radius: 10px; margin-bottom: 25px; padding: 20px; }
        #Additional_Data_Content legend { font-weight: 600; padding: 0 10px; color: #444; }
        #Additional_Data_Content .form-row { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 15px; }
        #Additional_Data_Content .form-group { flex: 1; min-width: 250px; display: flex; flex-direction: column; }
        #Additional_Data_Content label { margin-bottom: 5px; font-size: 14px; color: #555; }
        #Additional_Data_Content input, #Additional_Data_Content select, #Additional_Data_Content textarea { 
            padding: 4px; border: 1px solid #d1d5db; font-size: 14px; transition: border-color 0.2s; 
        }
        #Additional_Data_Content input:focus, #Additional_Data_Content select:focus, #Additional_Data_Content textarea:focus { 
            border-color: #2563eb; outline: none; 
        }
        #Additional_Data_Content textarea { resize: vertical; }
        #Additional_Data_Content .form-actions { text-align: right; margin-top: 20px; }
        #Additional_Data_Content button { padding: 10px 18px; border: none; border-radius: 6px; font-size: 15px; cursor: pointer; margin-left: 10px; }
        #Additional_Data_Content .btn-primary { background: #2563eb; color: #fff; }
        #Additional_Data_Content .btn-primary:hover { background: #1d4ed8; }
        #Additional_Data_Content .btn-secondary { background: #e5e7eb; color: #333; }
        #Additional_Data_Content .btn-secondary:hover { background: #d1d5db; }
    </style>

    <div class="form-container" id="Additional_Data_Content">
        <fieldset>
          <legend>Consignee Details</legend>
          <div class="form-row">
            <div class="form-group">
              <label>Customer / Consignee Name</label>
              <input type="text" name="consignee_name" required minlength="3" maxlength="100">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Billing Address</label>
              <input type="text" name="billing_address1" required maxlength="200">
            </div>
            <div class="form-group">
              <label>Billing Address</label>
              <input type="text" name="billing_address2" required maxlength="200">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>State</label>
              <input type="text" id="state" list="state" name="state">
            </div>
            <div class="form-group">
              <label>Pin Code</label>
              <input type="number" name="pincode" pattern="\\d{6}" >
            </div>
            <div class="form-group">
              <label>Country</label>
              <input type="text" name="Country" list="country">
            </div>
            <div class="form-group">
              <label>Mobile No.</label>
              <input type="tel" name="mobile" >
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Place of Supply.</label>
              <input type="text" list="state" name="POS"  >
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>PAN</label>
              <input type="text" name="pan" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" placeholder="ABCDE1234F">
            </div>
            <div class="form-group">
              <label>GST Status</label>
              <select name="Consignee GST Type" >
                <option selected disabled="">Select</option>
                <option value="Registered">Registered</option>
                <option value="Unregistered">Unregistered</option>
              </select>
            </div>
            <div class="form-group">
              <label>GST</label>
              <input type="text" name="GST">
            </div>
            <div class="form-group">
              <label>CIN</label>
              <input type="text" name="cin" maxlength="21" placeholder="Corporate Identity No.">
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Dispatched Details</legend>
          <div class="form-row">
            <div class="form-group">
              <label>Dispatched Document Number</label>
              <input type="text" name="Dispatched Document Number">
            </div>
            <div class="form-group">
              <label>Dispatched Through</label>
              <input type="text" name="Dispatched Through">
            </div>
            <div class="form-group">
              <label>Destination</label>
              <input type="text" name="Dispatched Destination">
            </div>
          </div>
            <div class="form-row">
              <div class="form-group">
                <label>Agent/Carrier Name</label>
                <input type="text" name="Agent/Carrier Name">
              </div>
              <div class="form-group">
                <label>Bill of lading No.</label>
                <input type="text" name="Bill of lading No">
              </div>
              <div class="form-group">
                <label>Bill of lading Date</label>
                <input type="date" name="Bill of lading No" placeholder="Bill of lading Date">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Vehicle No</label>
                <input type="text" name="Vehicle No.">
              </div>
              <div class="form-group">
                <label>Mode of Transport</label>
                <select class="form-select align-text-center px-3" name="Mode of Transport">
                <option selected disabled value="Air">Select</option>
                <option value="Air">Air</option>
                <option value="Road">Road</option>
                <option value="Sea">Sea</option>
              </select>
              </div>
              <div class="form-group">
              <label for="">Remark/Notes</label>
              <textarea name="Dispatched Remarks" placeholder="Dispatched Remarks" rows="1"></textarea>
              </div>
            </div>
        </fieldset>
        <fieldset>
          <legend>Order Details</legend>
          <div class="form-row">
            <div class="form-group">
              <label>Order No.</label>
              <input type="text" name="Order No." required maxlength="20">
            </div>
            <div class="form-group">
              <label>Order Date</label>
              <input type="date" name="invoice_date" required>
            </div>
            <div class="form-group">
              <label>Mode of Payment</label>
              <Select>
                <option value="" disabled selected>Select</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Reference Document</label>
              <input type="text" name="reference_doc" >
            </div>
            <div class="form-group">
              <label>Term of Delivery</label>
              <input type="text" name="Terms of Delivery" >
            </div>
            <div class="form-group">
              <label>Remarks / Notes</label>
              <textarea name="remarks" rows="1"></textarea>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Payment Information</legend>
          <div class="form-row">
            <div class="form-group">
              <label>Payment Mode</label>
              <select name="payment_mode" required>
                <option value="">-- Select --</option>
                <option>Cash</option>
                <option>Cheque</option>
                <option>Bank Transfer</option>
                <option>UPI</option>
                <option>Credit</option>
              </select>
            </div>
            <div class="form-group">
              <label>Payment Terms</label>
              <input type="text" name="payment_terms" placeholder="Net 30 days">
            </div>
            <div class="form-group">
              <label>Interest Rate on Late Payment (%)</label>
              <input type="number" name="interest_rate" step="0.01" min="0" max="100" placeholder="e.g. 18%">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" name="bank_name">
            </div>
            <div class="form-group">
              <label>Account No.</label>
              <input type="text" name="bank_account" pattern="\\d{9,18}">
            </div>
            <div class="form-group">
              <label>IFSC Code</label>
              <input type="text" name="ifsc" pattern="^[A-Z]{4}0[A-Z0-9]{6}$">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>SWIFT Code</label>
              <input type="text" name="swift" maxlength="11">
            </div>
            <div class="form-group">
              <label>UPI ID</label>
              <input type="text" name="upi" placeholder="example@upi">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Transport & Logistics</legend>
          <div class="form-row">
            <div class="form-group">
              <label>AWB No.</label>
              <input type="text" name="awb_no" maxlength="20">
            </div>
            <div class="form-group">
              <label>LR No.</label>
              <input type="text" name="lr_no" maxlength="20">
            </div>
            <div class="form-group">
              <label>Mode of Transport</label>
              <select name="transport_mode">
                <option value="">-- Select --</option>
                <option>Road</option>
                <option>Rail</option>
                <option>Air</option>
                <option>Sea</option>
                <option>Courier</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Vehicle No.</label>
              <input type="text" name="vehicle_no" pattern="^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$" placeholder="e.g. MH12AB1234">
            </div>
            <div class="form-group">
              <label>Transporter Name</label>
              <input type="text" name="transporter_name">
            </div>
            <div class="form-group">
              <label>Transporter Contact</label>
              <input type="text" name="transporter_contact">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Attachments</legend>
          <div class="form-group">
            <label>Upload Supporting Documents</label>
            <input type="file" name="attachments" multiple>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="button" class="btn-primary" onclick="collectFormData('${mainFormId}')">Add Additional Data</button>
        </div>
    </div>
</body>
        `;

    // 4. Insert the HTML into the container
    openCustomOffcanvas("Additional Feilds", code)
    console.log(`[DEBUG] Additional form content injected into #${mainFormId}`);
}



function collectFormData(mainFormId) {
    // 1. Close the modal
    closeCustomModal(); 
    closeCustomOffcanvas()

    // 2. Identify target elements
    const mainForm = document.getElementById(mainFormId);
    // CRITICAL: The injected form element is "Additional_Data_Content"
    const adform = document.getElementById("Additional_Data_Content");
    
    if (!mainForm || !adform) {
        console.error("⚠️ Cannot find main form or additional data container.");
        // A simple message box replacement since alert() is forbidden
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Error: Main form or additional data form not found.';
        errorMsg.style = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:red;color:white;padding:15px;border-radius:8px;z-index:9999;";
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
        return;
    }

    // 3. Cleanup existing hidden inputs generated by this function to prevent duplication
    // We look for inputs with a name starting with "Additional_Data-" inside the main form.
    const existingHiddenInputs = mainForm.querySelectorAll('input[type="hidden"][name^="Additional_Data-"]');
    existingHiddenInputs.forEach(input => input.remove());
    
    console.log(`[DEBUG] Cleared ${existingHiddenInputs.length} existing hidden inputs from #${mainFormId}`);


    // Select all inputs, selects, and textareas, but exclude file inputs (which can't be easily stored in hidden fields)
    const elements = adform.querySelectorAll("input:not([type='file']), select, textarea");
    const filledData = {};

    elements.forEach(el => {
        const value = el.value?.trim();
        if (!value) return; // skip empty

        const key = el.name || el.id;

        // ✅ Get parent fieldset legend
        const fieldset = el.closest("fieldset");
        const legend = fieldset?.querySelector("legend")?.textContent?.trim() || "Additional Data";

        // 4. Build filledData object (for logging/other purposes)
        filledData[key] = value;

        // 5. Create hidden input and append to main form
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";

        // Format Legend for the name: replace all spaces with underscores for a clean name.
        const legendName = legend.replace(/\s+/g, "_"); 
        // Format Key for the name: use the beautifyLabel function, then replace spaces with underscores.
        const keyName = beautifyLabel(key).replace(/\s+/g, "_"); 

        // Final Name pattern: "Additional_Data-{Legend}_{Key}"
        hiddenInput.name = `Additional_Data-${legendName}_${keyName}`;
        
        // Class for styling (as requested by user's code)
        hiddenInput.className = "propercase-input";

        // Set value
        hiddenInput.value = value;

        // Append to the main form
        mainForm.appendChild(hiddenInput);
    });

    // ✅ Log collected data and continue with other processes if necessary
    console.log("[INFO] Collected Additional Data:", filledData);
    // The user's original commented-out function call: getsubjectiveform(form, filledData);
}


// // Attach to Add button
// document.querySelector("#Additional_Data .btn-primary").addEventListener("click", function (e) {
//   e.preventDefault(); // prevent form reset/submit
//   collectFormData();
// });

