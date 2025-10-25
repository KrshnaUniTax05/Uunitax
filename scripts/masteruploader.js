// const scriptURL = "https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec";

// console.log("am i visible")

let fullExcelData = [];
let validDataToUpload = [];

const inputExcelFile = document.getElementById("excelFile");
const btnSubmitUpload = document.getElementById("UploaderSubmitter");
const uploadStatusMessage = document.getElementById("statusMessage");
const previewTableContainer = document.getElementById("tableContainerMassive");

inputExcelFile.addEventListener("change", async function () {
  const file = this.files[0];
  console.log("changed detected")
  if (!file) {
    resetState("No file selected.");
    return;
  }

  resetState("Reading file...");

  const reader = new FileReader();
  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

    if (!json.length) {
      resetState("❌ No data found in the Excel file.");
      return;
    }

    fullExcelData = json;

    renderTablePreview(json);

    const headers = Object.keys(json[0]).map(h => h.trim().toLowerCase());
    const uploadedHeaders = headers.filter(h => !["timestamp", "document number", "action", "reconciliation"].includes(h));

    const uniqueSheetNames = [...new Set(json.map(r => r["sheet_name"]?.toLowerCase().trim()).filter(Boolean))];
    validDataToUpload = [];

    uploadStatusMessage.textContent = "Validating headers from server...";

    for (const sheetName of uniqueSheetNames) {
      const serverHeaders = await fetchHeadersFromServer(sheetName);
      const expectedHeaders = serverHeaders.map(h => h.toLowerCase().trim()).filter(h => !["timestamp", "document number", "action", "reconciliation"].includes(h));

      const missingHeaders = expectedHeaders.filter(h => !uploadedHeaders.includes(h));
      if (missingHeaders.length === 0) {
        const matchingRows = json.filter(row => row["sheet_name"]?.toLowerCase().trim() === sheetName);
        validDataToUpload.push(...matchingRows);
      } else {
        console.warn(`⛔ Skipping "${sheetName}" due to missing headers:`, missingHeaders);
      }
    }

    if (validDataToUpload.length) {
      uploadStatusMessage.textContent = `${validDataToUpload.length} valid rows ready to upload. Click Submit.`;
      btnSubmitUpload.disabled = false;
    } else {
      uploadStatusMessage.textContent = "❌ No valid rows found to upload.";
      btnSubmitUpload.disabled = true;
    }
  };

  reader.readAsArrayBuffer(file);
});

btnSubmitUpload.addEventListener("click", () => {
  if (!validDataToUpload.length) {
    alert("❌ No valid rows to upload. Please upload a valid file first.");
    return;
  }

  btnSubmitUpload.disabled = true;
  uploadStatusMessage.textContent = "Starting upload...";
  uploadInBatches(validDataToUpload);
});

async function uploadInBatches(data) {
  const batchSize = 50;
  const totalRequests = data.length; // Total number of rows to send
  const failedRows = [];

  let requestsCompleted = 0; // Counter for completed requests

  const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  for (let i = 0; i < Math.ceil(data.length / batchSize); i++) {
    const batch = data.slice(i * batchSize, (i + 1) * batchSize);

    const batchWithRecon = batch.map(row => ({
      ...row,
      Reconciliation: "Unreconciled"
    }));

    for (const row of batchWithRecon) {
      let attempt = 0;
      let success = false;

      while (!success && attempt < 5) {
        try {
          const params = {};
          Object.keys(row).forEach(key => {
            params[key] = row[key];
          });

          const queryString = new URLSearchParams(params).toString();
          const url = `${scriptURL}?callback=processServerReply&action=uploadBatch&${queryString}`;

          await sendRequestForm(url);
          success = true;

        } catch (err) {
          console.warn("Upload failed:", err.message);
          attempt++;

          if (attempt >= 5) {
            row.error = `Failed after ${attempt} attempts: ${err.message}`;
            failedRows.push(row);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // retry delay
      }

      requestsCompleted++;
      const percent = Math.round((requestsCompleted / totalRequests) * 100);
      uploadStatusMessage.textContent = `Uploading... (${requestsCompleted}/${totalRequests}) - ${percent}% complete`;
    }
  }

  if (failedRows.length > 0) {
    localStorage.setItem(`failed-upload-${uniqueCode}`, JSON.stringify(failedRows));
    const worksheet = XLSX.utils.json_to_sheet(failedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Uploads");
    XLSX.writeFile(workbook, "Failed_Uploads.xlsx");

    uploadStatusMessage.textContent += ` ⚠️ ${failedRows.length} entries failed. Downloaded failed entries.`;
    errorNotificationHandler("error", "Some data failed to sync. It will retry in the background later.");
  } else {
    uploadStatusMessage.textContent += " ✅ All data uploaded successfully!";
    errorNotificationHandler("success", "All data successfully synced to server.");
  }

  btnSubmitUpload.disabled = false;
}

function fetchHeadersFromServer(sheetName) {
  return new Promise((resolve) => {
    const callbackName = `cb_${sheetName.replace(/\W/g, '')}_${Date.now()}`;
    window[callbackName] = function (response) {
      delete window[callbackName];
      if (response?.all_rows?.length) {
        resolve(Object.keys(response.all_rows[0]));
      } else {
        resolve([]);
      }
    };

    const url = `${scriptURL}?action=getRowData&sheet_name=${encodeURIComponent(sheetName)}&column_to_search=Document Number&document_number=*&callback=${callbackName}&unique_code=${Date.now()}`;
    const script = document.createElement("script");
    script.src = url;
    script.onerror = () => {
      delete window[callbackName];
      resolve([]);
    };
    document.body.appendChild(script);
  });
}

function renderTablePreview(data) {
  if (!data.length) {
    previewTableContainer.innerHTML = "<p>No data to preview</p>";
    return;
  }

  const headers = Object.keys(data[0]);
  let html = `<table class="table table-bordered table-striped"><thead><tr>`;
  html += headers.map(h => `<th>${h}</th>`).join("");
  html += `</tr></thead><tbody>`;

  data.slice(0, 50).forEach(row => {
    html += `<tr>${headers.map(h => `<td>${row[h]}</td>`).join("")}</tr>`;
  });

  html += `</tbody></table>`;

  previewTableContainer.innerHTML = html;
}

function resetState(message) {
  fullExcelData = [];
  validDataToUpload = [];
  previewTableContainer.innerHTML = "";
  uploadStatusMessage.textContent = message || "";
  btnSubmitUpload.disabled = true;
}
