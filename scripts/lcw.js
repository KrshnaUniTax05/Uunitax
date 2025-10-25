async function getLedgerFields() {
  const ledgerType = document.getElementById("ledgerType").value;
  const container = document.getElementById('dynamicfeilds');
  container.style.display = "block";
  container.innerHTML = "Working...";

  if (!container) {
    console.error("Error: #dynamicfeilds container not found in DOM.");
    alert("Form container missing in HTML.");
    return;
  }

  const sheetName = "Concept";
  const submitBtn = document.getElementById("dsw_submit");
  submitBtn.textContent = "Loading...";

  if (!ledgerType) {
    alert('Please select a Ledger Type.');
    submitBtn.textContent = "Fetch Data";
    return;
  }

  const url = `https://script.google.com/macros/s/AKfycby4WEYQjiJJOg_nyP-oRLB39fatKNpu_9TMK__t91-3GJEEQDuY0F9mZ_OdByZI76Wa/exec?action=getAllData&sheet_name=${sheetName}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonData = JSON.parse(text.replace(/^undefined\(/, '').replace(/\)$/, ''));

    if (jsonData.status === "success" && jsonData.all_data.length > 0) {
      const matchedFields = jsonData.all_data.filter(item => item.Type === ledgerType);
      container.innerHTML = ""; // Clear container

      const para = document.createElement("p");
      para.className = "my-3";
      para.innerHTML = "<b>Additional Information</b>";
      container.appendChild(para);

      // Group fields by Legend
      const fieldGroups = {};

      for (const field of matchedFields) {
        const legendTitle = field.Legend?.trim() || "Other";

        if (!fieldGroups[legendTitle]) {
          // Create fieldset and legend for new group
          const fieldset = document.createElement("fieldset");
          fieldset.className = "border p-3 mb-4 rounded";

          const legend = document.createElement("legend");
          legend.textContent = legendTitle;
          legend.className = "float-none w-auto px-2";
          fieldset.appendChild(legend);

          fieldGroups[legendTitle] = fieldset;
        }

        const fieldLabel = field.Name?.trim() +":" || "Field";
        const baseId = ledgerType + "_" + fieldLabel;
        const fieldId = await generateHashedId(baseId);

        let input;
        const inputType = field["Input Type"]?.toLowerCase();

        if (inputType === "list") {
          input = document.createElement("select");
          input.className = "form-select";
          input.name = field.Name?.trim();
          input.id = fieldId;

          if (field.Data?.trim()) {
            const options = field.Data.split(",").map(opt => opt.trim());
            options.forEach(opt => {
              const option = document.createElement("option");
              option.value = opt;
              option.textContent = opt;
              input.appendChild(option);
            });
          }
        } else {
          input = document.createElement("input");
          input.type = inputType || "text";
          input.id = fieldId;
          input.name = field.Name?.trim();
          input.className = "form-control " + fieldId;

          if (field.Required?.toLowerCase() === "yes") input.required = true;
          if (field.Pattern?.trim()) input.pattern = field.Pattern;
          if (field.accesskey?.trim()) input.accessKey = field.accesskey;
          if (field.autocomplete?.toLowerCase() === "yes") input.autocomplete = "on";
          else input.autocomplete = "off";
          if (field.maxlength?.trim()) input.maxLength = parseInt(field.maxlength);
          if (field.minlength?.trim()) input.minLength = parseInt(field.minlength);
          if (field.placeholder?.trim()) input.placeholder = field.placeholder;
        }

        const label = document.createElement("label");
        label.setAttribute("for", fieldId);
        label.className = "form-label";
        label.innerHTML = input.required ? `${fieldLabel} <span class="text-danger">*</span>` : fieldLabel;

        const div = document.createElement("div");
        div.className = "mb-3";
        div.appendChild(label);
        div.appendChild(input);

        // Append to the respective fieldset
        fieldGroups[legendTitle].appendChild(div);
      }

      // Append all fieldsets to container
      Object.values(fieldGroups).forEach(fieldset => container.appendChild(fieldset));

      submitBtn.textContent = "Loaded";
    } else {
      alert('No fields found for the selected Ledger Type.');
      submitBtn.textContent = "Fetch Data";
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while fetching data. Check the console for details.');
    submitBtn.textContent = "Fetch Data";
  }
}

// Helper function to generate hashed IDs using SHA-256
async function generateHashedId(inputText) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'id_' + hashHex.slice(0, 12); // first 12 chars only
}
