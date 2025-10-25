

  
      // Function to calculate the total amount
      const calculateTotal = (eventOrForm) => {
  let form;
  // Case 1: called from event listener
  if (eventOrForm instanceof Event) {
    const input = eventOrForm.target;
    form = input.closest("form");
    // console.log(form)
  } 
  // Case 2: called manually with a form element
  else if (eventOrForm instanceof HTMLFormElement) {
    form = eventOrForm;
    // console.log(form)
  }

  if (!form) return; // safety: no form found

  let total = 0;
  form.querySelectorAll(".amount").forEach(el => {
    const value = parseFloat(el.value) || 0;
    total += value;
  });

  const totalElement = form.querySelector("#totalAmount");
  // console.log(totalElement)
  if (totalElement) {
    totalElement.textContent = formatIndianCurrency(total);
  }
};

// Auto-bind all `.amount` inputs
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("amount")) {
    calculateTotal(e); // pass the event
  }
});
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("rpamount")) {
    calculateTotal(e); // pass the event
  }
});

  
      
  
      function formatIndianCurrency(amount) {
          return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
  
      
// Utility: Validate list inputs against datalist options
function validateListInputs(form) {
  let valid = true;
  form.querySelectorAll("input[list]").forEach(input => {
    const listId = input.getAttribute("list");
    const dataList = document.getElementById(listId);
    const options = Array.from(dataList.options).map(o => o.value);

    if (!options.includes(input.value)) {
      valid = false;
      input.classList.add("border", "border-danger");
      errorNotificationHandler("error", `Invalid value in '${beautifyLabel(input.name)}'. Please choose from list.`);
    } else {
      input.classList.remove("border", "border-danger");
    }
  });
  return valid;
}

// Save and Async Submit Handler
document.querySelectorAll('.tosendtransa').forEach(form => {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!validateListInputs(form)) return; // ⛔ Invalid list input

    const allloaderremoval = form.querySelectorAll('input[type=list]')
    allloaderremoval.forEach(input =>{
      removeLoaderFromInput(input)
    })
    handleFormSubmissionBtncall(form, "Saving Locally...");
    // console.log('Form submission started (local first)');

    setFormReadonly(form, true); // 🔒 Make all fields readonly

    const isSynced = validateItemDocumentNumbers(form);
    if (!isSynced) return; // Stop if any row is not synced

    const submissionId = `SUB-${Date.now()}`;
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const formId = event.target.id;
    const sheetName = `${userId}_${formId}`;

    const constantFields = {};
    form.querySelectorAll('input, select, textarea').forEach(input => {
      if (!form.querySelector('table').contains(input)) {
        constantFields[input.name] = input.value;
      }
    });

    constantFields.submission_id = submissionId;
    constantFields.sheet_name = sheetName;
    constantFields.unique_code = uniqueCode;

    const tableRows = form.querySelectorAll('table tbody tr');
    const formDataToStore = [];

    for (const row of tableRows) {
      const rowData = {};
      let isRowEmpty = true;

      row.querySelectorAll('input, select, textarea').forEach(input => {
        rowData[input.name] = input.value;
        if (input.value.trim() !== '') isRowEmpty = false;
      });

      if (!isRowEmpty) {
        const dataToSend = { ...constantFields, ...rowData };
        formDataToStore.push(dataToSend);
      }
    }

    // ✅ Save all form data to localStorage first
    localStorage.setItem(`pending-${uniqueCode}`, JSON.stringify(formDataToStore));

    // Reset form immediately after storing
    form.reset();
    resetFormTableToSingleRow(form);
    handleFormSubmissionBtncall(form, "Submit");
    setTodayDate();
    updateTotal(form);
    totaltozero(form);
    clearTaxSummaryIDIfExists(form);
    setFormReadonly(form, false);
    invoicegen()

    errorNotificationHandler("saving", "Data saved locally. Syncing to server in background...");

    // ⏳ Gradual background sync
    let allSuccess = true;
    for (const data of formDataToStore) {
      let attempt = 0;
      let success = false;

      while (!success && attempt < 5) {
        try {
          const queryString = new URLSearchParams(data).toString();
          const scriptURL = `https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec?callback=processServerReply&${queryString}`;
          await sendRequestForm(scriptURL);
          success = true;
        } catch (error) {
          console.error('Sync attempt failed:', error);
          attempt++;
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!success) {
        allSuccess = false;
        localStorage.setItem(`failed-${uniqueCode}`, JSON.stringify(data));
      }
    }

    if (allSuccess) {
      errorNotificationHandler("success", "All data successfully synced to server.");
      sendFormDataToServer(uniqueCode, "Transaction Submission", scriptURL)
      localStorage.removeItem(`pending-${uniqueCode}`);
    } else {
      errorNotificationHandler("error", "Some data failed to sync. It will retry in the background later.");
    }

  });
});


 function totaltozero(form) {
    const div = form.querySelector("#totalAmount");
    if (div) {
        div.textContent = "0.00";  // or div.innerText = "0.00";
    }
}




invoicegen();
    function invoicegen() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomPart = '';
      for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const timePart =
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0') +
        String(now.getMilliseconds()).padStart(3, '0');
      const uniqueInvoice = `${randomPart}${year}${timePart}`;
      document.querySelector('#SalesForm #Invoice').value = uniqueInvoice;
    }





function getDocumentNumber(response) {
    if (response.status === 'success' && response.matching_rows?.length > 0) {
        const docNumber = response.matching_rows[0]["Document Number"];
        return docNumber ? docNumber.toUpperCase() : null;
    }
    return null;
}
        
        async function sendRequestForm(url) {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onerror = () => reject(new Error('Network error'));
            document.body.appendChild(script);
            setTimeout(() => resolve('Request sent'), 3000);
          });
        }
        
        function processServerReply(response) {
          if (response.status === 'success') {
            console.log('Server Response:', response);
            loggerlogging(userId, response.document_number)
            localStorage.removeItem(`failed-${response.uniquecode}`);
          } else {
            console.error('Server error:', response);
          }
        }
        
        async function retryFailedSubmissions() {
          Object.keys(localStorage).forEach(async key => {
            if (key.startsWith('failed-')) {
              errorNotificationHandler("info", "Unsaved data is under process." + key);
              const data = JSON.parse(localStorage.getItem(key));
              try {
                const queryString = new URLSearchParams(data).toString();
                const scriptURL = `https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec?callback=processServerReply&${queryString}`;
                await sendRequestForm(scriptURL);
                errorNotificationHandler("success", "Operation completed successfully! "+ key );

              } catch (error) {
                console.error('Retry failed:', error);
              }
            }
          });
        }
        
        window.addEventListener('load', () => {
          retryFailedSubmissions();
        });
        
    
    // Function to send the request
  //   async function sendRequestForm(url) {
  //     const response = await fetch(url);
  //     return response.json();
  //   }
    
  //   // Function to save failed submission
  //   function saveFailedSubmission(data) {
  //     const failedData = JSON.parse(localStorage.getItem('failedSubmissions')) || [];
  //     failedData.push(data);
  //     localStorage.setItem('failedSubmissions', JSON.stringify(failedData));
  //   }
    
  //   // Function to retry failed submissions
  //   async function retryFailedSubmissions() {
  //     const failedData = JSON.parse(localStorage.getItem('failedSubmissions')) || [];
  //     const remainingFailed = [];
    
  //     for (const data of failedData) {
  //       const queryString = new URLSearchParams(data).toString();
  //       const scriptURL = `https://script.google.com/macros/s/AKfycbzI1bZCsUHC68RhNeYPMylYMchUnb6XBP5WwcFX-XdKP1Fg-ZhmiPfCSWkuDa45yT9q/exec?${queryString}`;
    
  //       try {
  //         const response = await sendRequestForm(scriptURL);
  //         if (response.status !== 'success') throw new Error('Server error');
  //       } catch (error) {
  //         console.error('Retry failed for:', data);
  //         remainingFailed.push(data);
  //       }
  //     }
    
  //     localStorage.setItem('failedSubmissions', JSON.stringify(remainingFailed));
  //   }
    
  
  // // Function to send JSONP request and wait for completion
  // function sendRequestForm(url) {
  //   return new Promise((resolve, reject) => {
  //     const script = document.createElement('script');
  //     script.src = url;
  
  //     // Define the callback function
  //     window.gettransresponse = function (response) {
  //       console.log('Server Response:', response);
  //       resolve(response);
  //     };
  
  //     // Handle script load error
  //     script.onerror = function () {
  //       reject(new Error(`Failed to load script: ${url}`));
  //     };
  
  //     document.body.appendChild(script);
  //   });
  // }
  
  // Checking if there is form data saved in localStorage (for offline recovery)
  
  // Function to reset the table rows back to 1
  // function resetTableRows(form) {
  //   const tableBody = form.querySelectorAll('#creditEntryTableBody');
  //   const rows = tableBody.querySelectorAll('.credit-entry-row');
    
  //   // Delete all rows except the first one
  //   rows.forEach((row, index) => {
  //     if (index > 0) {
  //       row.remove();
  //     }
  //   });
    
  //   // Reset total amount to 0
  //   document.getElementById('totalAmount').textContent = '0.00';
  // }
  

// function resetTableRows(form, tableSelector = '#ItemDataTable', rowClass = '.credit-entry-row') {
//   const tableBody = form.querySelector(tableSelector);
//   if (!tableBody) return;

//   const rows = Array.from(tableBody.querySelectorAll(rowClass));
//   if (rows.length === 0) return;

//   // Keep the first row
//   const firstRow = rows[0];

//   // Remove all other rows
//   for (let i = 1; i < rows.length; i++) {
//     rows[i].remove();
//   }

//   // Clear values from the first row inputs
//   firstRow.querySelectorAll('input, select, textarea').forEach(input => {
//     if (input.type === 'checkbox' || input.type === 'radio') {
//       input.checked = false;
//     } else {
//       input.value = '';
//     }
//   });
// }


function setFormReadonly(form, state = true) {
  const inputs = form.querySelectorAll('input, select, textarea, button');
  inputs.forEach(input => {
    if (input.tagName === 'BUTTON') {
      input.disabled = state;
    } else {
      if(input.readOnly) return;
      // input.readOnly = state;
      input.disabled = state; // Covers selects
    }
  });
} 

  // alert('hi')

  function resetFormTableToSingleRow(form) {
  if (!form || form.tagName.toLowerCase() !== 'form') {
    console.warn('❌ Provided element is not a form.');
    return;
  }

  const formId = form.id || '(no ID)';
  // console.log(`🔁 Resetting table rows in form: ${formId}`);

  // Find the first table in the form (customize if needed)
  const table = form.querySelector("table");
  if (!table) {
    console.log(`❌ No table found in form ${formId}`);
    return;
  }

  const tbody = table.querySelector("tbody") || table;
  const rows = tbody.querySelectorAll("tr");

  if (rows.length > 1) {
    // console.log(`♻️ Removing extra rows (keeping 1 of ${rows.length})`);
    rows.forEach((row, index) => {
      if (index > 0) row.remove();
    });
    // console.log("✅ Table rows after reset:", tbody.querySelectorAll("tr").length);
  } else {
    console.log(`✅ Table in form ${formId} already has 1 row`);
  }
}

setTodayDate();

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  document.querySelectorAll('input[type="date"]').forEach(input => input.value = todayStr);
}

function handleFormSubmissionBtncall(form, loadingText) {
  if (!form || form.tagName.toLowerCase() !== 'form') {
    console.warn("❌ Provided element is not a valid form.");
    return;
  }

  const formId = form.id || "(no ID)";
  // console.log(`📨 Form submitted: ID = ${formId}`);

  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  
  if (submitBtn) {
    if (submitBtn.tagName.toLowerCase() === 'button') {
      submitBtn.textContent = loadingText;
    } else {
      submitBtn.value = loadingText;
    }
    submitBtn.disabled = true; // Disable to prevent double submit
  } else {
    console.warn(`⚠️ No submit button found in form ${formId}`);
  }
}


function validateItemDocumentNumbers(form) {
  const rows = form.querySelectorAll('table .form-table-body tr');
  const formId = form.id || '(no ID)';
  let allSynced = true;

  if(form.classList.contains("receiptpayment")){
    return true
  }

  rows.forEach((row, index) => {
    const hiddenInput = row.querySelector('input[name="ItemDocumentNumber"]');
    if (!hiddenInput || hiddenInput.value.trim() === '') {
      console.warn(`🚫 Row ${index + 1} in form "${formId}" is missing ItemDocumentNumber`);
      allSynced = false;
    }
  });

  if (!allSynced) {
    alert("⚠️ Syncing is underway. Please wait a while before submitting.");
    setFormReadonly(form, false); // 🔓 Unlock the form

    // 🔄 Reset submit button
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      if (submitBtn.tagName.toLowerCase() === 'button') {
        submitBtn.textContent = "Submit";
      } else {
        submitBtn.value = "Submit";
      }
      submitBtn.disabled = false;
    }

    return false;
  }

  return true;
}

