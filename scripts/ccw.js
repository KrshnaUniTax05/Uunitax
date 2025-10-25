  var userIdElements = document.querySelectorAll('[data-user-id]'); // Example selector
  console.log(userIdElements)
  var userid = sessionStorage.getItem('userloginid');
  var userId = sessionStorage.getItem('userloginid');

  if (userid) {
    userIdElements.forEach((element) => {
      element.textContent = `User Login ID: ${userid}`; // Display user ID in matching elements
    });
    console.log("User Login ID:", userid);
  } else {
    // console.error("Unable to retrieve User Login ID.");
  }


// console.log(getUserLoginId())











  function validateFormLists(form) {
  let valid = true;

  // Find all inputs with a "list" attribute inside the submitted form
  form.querySelectorAll("input[list]").forEach(input => {
    const listId = input.getAttribute("list");
    const datalist = document.getElementById(listId);

    if (datalist) {
      // Collect all allowed options from the datalist
      const options = Array.from(datalist.options).map(opt => opt.value);
        input.style.outline = "none";

      // Check if input value exists in allowed options
      if (input.value && !options.includes(input.value)) {
        valid = false;

        // Highlight invalid input
        input.style.outline = "1px solid red";

        console.warn(`Invalid value "${input.value}" for list: ${listId}`);
       errorNotificationHandler("error",`Invalid value "${input.value}" does not match the list for "${beautifyLabel(input.name)}".`);

      } else {
        // Remove outline if valid
        input.style.outline = "";
      }
    }
  });

  return valid;
}








  // Function to convert input text to uppercase
  function convertToUppercase(input) {
    input.value = input.value.toUpperCase();
  }

  // console.log("ccw enabled.")
  // Function to convert input text to proper case (title case)
  function convertToProperCase(input) {
    input.value = input.value.replace(/\b\w/g, function(char) {
      return char.toUpperCase();
    }).replace(/\s+/g, ' ');
    console.log('called of this ' + input.name)
  }

  // Event listener for form submission
document.querySelectorAll('.tosend').forEach(form => {
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    if(form.hasAttribute("form-status")){
      errorNotificationHandler("error","Let loading finish. Submission Stoped.")
      return
    }
    // console.log('called')
    // Add the 'recently_submitted' class to mark the form as recently submitted
    if (!validateFormLists(form)) {
      event.preventDefault();
      // console.warn("Submission blocked due to invalid input.");
      return ;
    }



    form.classList.add('recently_submitted');


    
    // Get the form name
    const formName = form.getAttribute('name');
    const formId = event.target.id;
    // Get the userid dynamically
    
    // Determine the sheet_name based on the form name
    let sheetName;
    if (formName === "login_unitax") {
      sheetName = "login";
    } else if (formName === "signup_unitax") {
      sheetName = "signup";
    } else {
      // const userid = document.querySelector("#userid").value;
      sheetName = `${userid}_${formId}`; // Default behavior for other form names

      const useridInput = document.createElement('input');
    useridInput.type = 'hidden';
    useridInput.name = 'userid';
    useridInput.value = userid; // Add user data dynamically
    form.appendChild(useridInput);

    }

    // Add hidden fields dynamically
    const formidInput = document.createElement('input');
    formidInput.type = 'hidden';
    formidInput.name = 'sheet_name';
    formidInput.value = sheetName; // Use the determined sheet name
    form.appendChild(formidInput);

    
    
    // Convert relevant fields to uppercase or proper case before submission
    const uppercaseInputs = form.querySelectorAll('.uppercase-input');
    const propercaseInputs = form.querySelectorAll('.propercase-input');

    // Apply uppercase conversion
    uppercaseInputs.forEach(input => convertToUppercase(input));

    // Apply proper case conversion
    propercaseInputs.forEach(input => convertToProperCase(input));

    // Prepare the form data to send
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log(form)
    // Construct the query string
    const queryString = new URLSearchParams(data).toString();

    // Log the data for debugging
    // console.log('Form Name:', formName);
    // console.log('Sheet Name:', sheetName);
    // console.log('Form Data:', data);
    // console.log('Query String:', queryString);
    Unique_identifier = generateCode()
    // Create the URL for JSONP
    const scriptURL = "https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec" + "?callback=handleResponse&unique_code=" + Unique_identifier + "&" + queryString;

    // Create and append the script tag for JSONP
    const script = document.createElement("script");
    script.src = scriptURL;
    document.body.appendChild(script);
    console.log(scriptURL)
    sendFormDataToServer(Unique_identifier,data, scriptURL)
    errorNotificationHandler("saving", "Requesting server for saving.")
  });
});

// Generate a code
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

srno = 1

function sendFormDataToServer(Unique_identifier, data, scriptURL){
  // Send the form data to the server using JSONP
  // console.log("called")
  const table = document.querySelector("#submissionTable tbody");
  const row = document.createElement("tr");
  updated_sr = srno++
  row.innerHTML = `
  <td>${updated_sr}</td>
  <td>${Unique_identifier}</td>
  <td>${JSON.stringify(data)}</td>
  <td>${scriptURL}</td>
  <td>In Process</td>
`;
  table.appendChild(row);


  const submittedForms = document.querySelectorAll('.recently_submitted');

    // Loop through each form with the 'recently_submitted' class and reset it
    submittedForms.forEach(form => {
      form.querySelectorAll("input, textarea, select").forEach(field => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false; // Uncheck checkboxes and radio buttons
        } else {
          field.value = ""; // Clear other form fields
        }
      });

      // Remove the 'recently_submitted' class after resetting the form
      form.classList.remove('recently_submitted');
      // console.log("Form reset:", form.id);
    });
  
}


// Handle the server response after the form submission
function handleResponse(response) {
  // console.log('Server Response:', response);
  const uniqueCode = response.uniquecode;
  const rows = document.querySelectorAll("#submissionTable tbody tr");

  

  if (response.status === "success") {
   // Show the error box with a success message
  //  fetchFieldDataForAll();

  //  processFetchableInputs();
   rows.forEach(row => {
    // Check if the row's second column (which is the unique identifier) matches the response's document number or unique code
    if (row.cells[1].innerText.includes(uniqueCode)) {
      // Update the status column (assuming it's the 3rd column, index 2) to "Processed"
      const badge = document.createElement('span');
      badge.classList.add('badge', 'bg-success');  // Add Bootstrap badge classes
      badge.innerText = 'Completed';  // Set the badge text to "Completed"

      // Replace the content of the 4th cell with the badge
      row.cells[4].innerHTML = '';  // Clear the current content of the cell
      row.cells[4].appendChild(badge);  // Append the badge to the cell

      // Optional: Change the row style to visually indicate it’s processed
      row.style.backgroundColor = "#198754"; // Green background for processed rows (Bootstrap success color)
    }
  });
    

    // const errorBox = document.getElementById("errorbox");
    // errorBox.style.display = "block";  // Display the error box
    // errorBox.style.animation = "slideUp 1s ease-out";  // Slide up animation
    // errorBox.style.backgroundColor = "#198754";  // Success color (Bootstrap success green)
    var tosec  = "Success! Document No. " + response.document_number.toUpperCase() + " generated.";
    console.log(response.document_number)
    // fetchFieldDataForAll();
    processFetchableInputs()
    errorNotificationHandler("success", tosec);
    loggerlogging(userId, response.document_number)
    // errorBoxHandler("Success",tosec)
    // // Set a timeout to apply the slideDown animation after 5 seconds
    // setTimeout(function() {
    //   errorBox.style.animation = "slideDown 1s ease-out";  // Slide down animation
    // }, 5000);

    // // Set a timeout to completely hide the error box after the animations finish
    // setTimeout(function() {
    //   errorBox.style.display = "none";  // Hide the error box after the animations
    // }, 6000);

    // Get all forms with the 'recently_submitted' class
    
  } else {
    console.error('Unexpected response structure:', response);
    errorNotificationHandler("error", "Something went wrong.");
    rows.forEach(row => {
      // Check if the row's second column (which is the unique  fier) matches the response's document number or unique code
      if (row.cells[1].innerText.includes(uniqueCode)) {
        // Update the status column (assuming it's the 3rd column, index 2) to "Processed"
        const badge = document.createElement('span');
        badge.classList.add('badge', 'bg-danger');  // Red badge for error
        badge.innerText = 'Error';  // Set the badge text to "Error"
        
        // Replace the content of the 4th cell with the error badge
        row.cells[4].innerHTML = 'Error';  // Clear the current content of the cell
        row.cells[4].appendChild(badge);  // Append the badge to the cell
        
        // Optionally, change the row style to visually indicate error
        row.style.backgroundColor = "#dc3545";  // Green background for processed rows (Bootstrap success color)
      }
    });
  }
}

var debounceTimeout;  // Declare debounceTimeout globally to be used across function calls

function debouncedFunction(event) {
  // console.log('called'); // Debug log to track the function call

  // Skip if the event is triggered by a submit button
  if (event.target.type === "submit") return;
  if (!event.target.value.trim()) return;

  // Skip if the event target doesn't have the 'data-debounced' attribute
  if (!event.target.hasAttribute('data-debounced')) return;
  // alert(event.target.value)
  if (event.target.hasAttribute("minlength")) {
  const minLen = parseInt(event.target.getAttribute("minlength"), 10);
  const currentLen = event.target.value.length;
    console.log(minLen, currentLen)
  // ✅ Only run when input length is equal to OR greater than minlength
  if (currentLen < minLen) {
    console.log("Min length satisfied!", event.target.value.trim());
    return;
    
  } 
} 






  // if(!event.target.value === "") return
  const ftarged = event.target
  const formId = event.target.getAttribute('data-sheetName');  // Get the form ID

  ftarged.setAttribute("form-status", "Restricted")
  // Clear the previous timeout if it exists to prevent excessive calls
  clearTimeout(debounceTimeout);

  // Set a new timeout to call the function after a delay (500ms)
  debounceTimeout = setTimeout(() => {
    const value = event.target.value.trim();  // Get the trimmed value of the input
    // console.log(value);  // Debug log to see the value

    saveFormData(value, formId);  // Save form data for later validation
    serversideChecking(value, formId, ftarged);  // Validate input on the server side
  }, 500);  // 500ms delay, can be adjusted if needed
}

// Server-side validation request
function serversideChecking(value, formId, ftarged) {
  errorNotificationHandler("info", "Please wait while we analyze duplicasy of Company Code");
  // const userId = document.querySelector("#userid").value;
  const sheetName = `${userid}_${formId}`;
  const columnName = ftarged.getAttribute('data-columnname_singlesearch');
  // console.log(columnName)
  const queryString = `?action=getColumnData&sheet_name=${sheetName}&column_name=${columnName}&callback=handleValidationResponse`;
  const scriptURL = `https://script.google.com/macros/s/AKfycbzI1bZCsUHC68RhNeYPMylYMchUnb6XBP5WwcFX-XdKP1Fg-ZhmiPfCSWkuDa45yT9q/exec${queryString}`;
  const script = document.createElement("script");
  script.src = scriptURL;
  document.body.appendChild(script);
  console.log(scriptURL)
  console.log(formId)
}

// Function to check and retrieve saved user input from localStorage
function checkSavedUserInput() {
  const storedData = localStorage.getItem('formData');
  if (storedData) {
    const formData = JSON.parse(storedData);
    return { userInput: formData.userInput, formId: formData.formId };
  }
  return {};  // Return empty object if no data found
}

// Function to handle the server response and perform validation
function handleValidationResponse(response) {
  // console.log('Server Response:', response);
  
  const { userInput, formId } = checkSavedUserInput();  // Retrieve the saved user input and formId
  // alert(userInput)
  // Your validation logic
  if (response.column_values) {
    const columnValues = response.column_values;
    const userInputString = String(userInput);  // Ensure userInput is a string for comparison
    // console.log(columnValues,userInput)
    const columnValuesString = columnValues.map(value => String(value));
    // console.log(formId)
    // Dynamically find the error alert for the form
    const errorAlert = document.querySelector(` .error-alert`);
    const form = document.getElementById(formId);
    const submitElements = form ? form.querySelectorAll(`#${formId} button[type="submit"], input[type="submit"]`) : [];


    // Check if user input matches any of the column values
    const isMatch = columnValuesString.some(value => value === userInputString);
    hideNotification();
    if (errorAlert) {
      if (isMatch) {
        errorNotificationHandler("error","Data already exists.")
        form.removeAttribute('form-status')
       
        // console. log("match")
        errorAlert.style.display = "block";
        submitElements.forEach(btn => {
          console.log("Button disabled status BEFORE:", btn.disabled);
          btn.disabled = true;
          
          console.log("Button disabled status AFTER:", btn.disabled);
        });
        console.log("Form found:", form);
        console.log("Submit elements found:", submitElements);
        errorAlert.textContent = "The value already exists. Please enter a different value.";

      } else {
        errorAlert.style.display = "none";
        submitElements.forEach(btn => {
          btn.removeAttribute('disabled');
        });
      }
    }
  } else {
    console.error('Unexpected response structure:', response);
    // errorBoxHandler("Success","No company found.");
  }
}


// Function to save form data to localStorage (or another place)
function saveFormData(value, formId) {
  if (value && formId) {
    const formData = {
      userInput: value.trim(),
      formId: formId
    };
    
    // Save to localStorage (you can modify this to save in other ways)
    localStorage.setItem('formData', JSON.stringify(formData));
    // console.log('Form data saved:', formData);
  }
}

// console.log('hi')


// alert(userId)
// Function to fetch data for a specific field
// function fetchFieldData(field) {
//   const tempId = generateRandomCode(); // Generate a unique temporary ID
//   field.setAttribute("data-temp_id", tempId); // Add temporary ID as a custom attribute

//   // Add the temporary ID to the field's class for easier targeting
//   field.classList.add(tempId);

//   // Disable the field and add a loader
//   addLoaderToField(field);
//   field.disabled = true;

//   // const userId = document.querySelector("#userid").value; // Dynamic user ID
//   const sheetName = field.getAttribute("data-sheet_name");
//   const columnName = field.getAttribute("data-column_name");

//   // Construct the request URL
//   const queryString = `?action=getColumnData&sheet_name=${userId}_${sheetName}&column_name=${columnName}&field_id=${tempId}&callback=handleFieldResponse`;
//   const scriptURL = `https://script.google.com/macros/s/AKfycbzI1bZCsUHC68RhNeYPMylYMchUnb6XBP5WwcFX-XdKP1Fg-ZhmiPfCSWkuDa45yT9q/exec${queryString}`;
//   // console.log(columnName , scriptURL)
//   // console.log("Request URL:", scriptURL); // Log the request URL for debugging

//   const script = document.createElement("script");
//   script.src = scriptURL;
//   document.body.appendChild(script); // Send the request
// }

// Generate a random unique code
function generateRandomCode() {
  return Math.random().toString(36).substr(2, 9);
}

// Add a loader to the field
// Function to add a Bootstrap loader to the field
function addLoaderToField(field) {
  // Check if a loader already exists and prevent adding another one
  const existingLoader = field.parentElement.querySelector(".spinner-border");
  if (existingLoader) return; // If loader already exists, don't add another one

  // Create a Bootstrap spinner element
  const loader = document.createElement("div");
  loader.className = "spinner-border spinner-border-sm text-primary"; // Smaller spinner and primary color
  
  // Set the size and position of the spinner
  loader.style.position = "absolute";
  loader.style.right = "10px"; // Position 10px from the left side
  loader.style.top = "50%";   // Vertically center the spinner
  // loader.style.transform = "translateY(-50%)"; // Ensure perfect vertical centering
  loader.setAttribute("role", "status");
  loader.setAttribute("data-loader", field.getAttribute("data-temp_id")); // Bind loader to tempId
  
  // Append the loader to the field's parent container
  field.parentElement.style.position = "relative"; // Ensure proper positioning of the field's container
  field.parentElement.appendChild(loader);

  // Disable the field during the loading process
  field.disabled = true;
}




// Function to remove the loader from the field
function removeLoaderFromField(field) {
  const tempId = field.getAttribute("data-temp_id");
  const loader = field.parentElement.querySelector(`.spinner-border[data-loader="${tempId}"]`);
  if (loader) {
    field.parentElement.removeChild(loader); // Remove the loader
  }
  
  // Re-enable the field after the loader is removed
  field.disabled = false;
}


// Function to handle the server response
// function handleFieldResponse(response) {
//   if (response.field_id && response.column_values !== undefined) {
//     const tempId = response.field_id;
//     const fields = document.querySelectorAll(`[data-temp_id="${tempId}"]`);

//     fields.forEach(field => {
//       removeLoaderFromField(field);

//       // Check if column_values is empty or undefined
//       if (!response.column_values || response.column_values.length === 0) {
//         if (field.tagName.toLowerCase() === "select") {
//           // Clear existing options
//           field.innerHTML = "";

//           // Add a "No data" option
//           const noDataOption = document.createElement("option");
//           noDataOption.value = ""; // Empty value
//           noDataOption.textContent = "No data";
//           noDataOption.disabled = true; // Make it read-only
//           noDataOption.selected = true; // Ensure it's selected by default
//           field.appendChild(noDataOption);
//         } else if (field.tagName.toLowerCase() === "input" && field.hasAttribute("list")) {
//           // Get the datalist ID
//           const datalistId = field.getAttribute("list");

//           // Find or create the datalist element
//           let datalist = document.getElementById(datalistId);
//           if (!datalist) {
//             datalist = document.createElement("datalist");
//             datalist.id = datalistId;
//             document.body.appendChild(datalist);
//           }

//           // Clear existing options
//           datalist.innerHTML = "";

//           // Add a "No data" option
//           const noDataOption = document.createElement("option");
//           noDataOption.value = "No data"; // Read-only value
//           noDataOption.textContent = "No data";
//           datalist.appendChild(noDataOption);
//         }
//       } else {
//         // If column_values exist, proceed as normal
//         if (field.tagName.toLowerCase() === "input" && field.hasAttribute("list")) {
//           const datalistId = field.getAttribute("list");

//           let datalist = document.getElementById(datalistId);
//           if (!datalist) {
//             datalist = document.createElement("datalist");
//             datalist.id = datalistId;
//             document.body.appendChild(datalist);
//           }

//           // Clear existing options to avoid duplicates
//           datalist.innerHTML = "";

//           // Create a Set to ensure unique values
//           const uniqueValues = [...new Set(response.column_values)];

//           // Append only unique options
//           uniqueValues.forEach(value => {
//             const option = document.createElement("option");
//             option.value = value;
//             datalist.appendChild(option);
//           });
//         } else if (field.tagName.toLowerCase() === "select") {
//           const existingOptions = Array.from(field.options).map(opt => opt.value);
//           response.column_values.forEach(value => {
//             if (!existingOptions.includes(value)) {
//               const option = document.createElement("option");
//               option.value = value;
//               option.textContent = value;
//               field.appendChild(option);
//             }
//           });
//         }
//       }

//       field.removeAttribute('data-temp_id');
//     });
//   } else {
//     console.error("Temp ID mismatch or field not found.");
//   }
// }


// Helper function to generate a unique datalist ID based on the tempId
// function generateUniqueDatalistId(tempId) {
//   return `datalist_${tempId}`; // Generate unique ID for the datalist
// }

// Fetch data for all fields with data-fetch_column attribute
// function fetchFieldDataForAll() {
//   const fields = document.querySelectorAll("[data-fetch_column]");

//   fields.forEach(field => {
//     fetchFieldData(field); // Fetch data for each field
//   });
// }

// Call this function to fetch data for all fields
// fetchFieldDataForAll();




// console.log("Temp ID Assigned:", field_id);
// console.log("Response Temp ID:", response.temp_id);




// Statusbar()
// function Statusbar(type, text) {
//   let viewtime = 5000;  // Set viewtime to 5000ms (5 seconds)

//   const statusbars = document.getElementsByClassName("logging");
//   for (let i = 0; i < statusbars.length; i++) {
//     // Check if the status bar is already hidden
//     if (statusbars[i].style.display === "none") {
//       // Show the status bar if it's hidden
//       statusbars[i].style.display = "block";
//     }

//     // Handle the status bar display based on the 'type'
//     if (type == "ok") {
//       statusbars[i].style.backgroundColor = "green"; // Set background to green for success
//       statusbars[i].innerHTML = text; // Set the status bar's text to the passed text
//       setTimeout(() => hidestatusbar(), viewtime); // Call hidestatusbar after 'viewtime'
//     } else if (type == "notok") {
//       statusbars[i].style.backgroundColor = "red"; // Set background to red for error
//       statusbars[i].innerHTML = text; // Set the status bar's text to the passed text
//       setTimeout(() => hidestatusbar(), viewtime); // Call hidestatusbar after 'viewtime'
//     } else if (type == "check") {
//       statusbars[i].style.backgroundColor = "yellow"; // Set background to yellow for check
//       statusbars[i].innerHTML = text;
//       questcomplete(); // Handle check scenario
//     }

//     // Log the current status to the console
//     console.log('working');

//     // Select the element with the id 'logger' and access its .card-body
//     const dax = document.querySelector("#logger .card-body");
//     dax.style.padding = "0px"; // Set padding to 0px for dax

//     // Loop through all elements with class "logging"
//     statusbars[i].innerHTML = text; // Set the text content to passed text
//     statusbars[i].style.width = "100%"; // Set width to 100%
//     statusbars[i].style.height = "100%"; // Set height to 100%
//     statusbars[i].style.padding = "5px"; // Set padding to 5px
//     statusbars[i].style.paddingLeft = "15px"; // Set padding left
//     statusbars[i].style.color = "#f2f2f2"; // Set text color to white
//   }
// }

// // Function to hide the status bar after a set time
// function hidestatusbar() {
//   const statusbars = document.getElementsByClassName("logging");
//   for (let i = 0; i < statusbars.length; i++) {
//     statusbars[i].innerHTML = ""; // Hide the status bar content
//     statusbars[i].style.backgroundColor = "#fff"; // Reset background color
//     statusbars[i].style.display = "none"; // Hide the status bar
//   }
// }

// // Handle quest completion scenario (if applicable)
// function questcomplete() {
//   const statusbars = document.getElementsByClassName("logging");
//   for (let i = 0; i < statusbars.length; i++) {
//     statusbars[i].style.backgroundColor = "green"; // Set background to green for success
//   }
// }


// function hidestatusbar() {
//   const statusbars = document.getElementsByClassName("logging");
//   for (let i = 0; i < statusbars.length; i++) {
//     statusbars[i].innerHTML = ""; // Hide the status bar
//     statusbars[i].display = "none"; // Hide the status bar
//     statusbars[i].style.backgroundColor = "#fff"; // Reset background color
//   }
// }

// function questcomplete() {
//   const statusbars = document.getElementsByClassName("logging");
//   for (let i = 0; i < statusbars.length; i++) {
//     statusbars[i].style.backgroundColor = "green"; // Set background to green for success
//   }
// }

setInterval(() =>{
  let SecID = localStorage.getItem("SecID")
  if(!SecID){
    return
  } else{
    // console.log(SecID)
    processFetchableInputs(SecID) 
  }
},10)

// alert('hi')


// Step 1: Start processing all inputs with data-fetch_column
function processFetchableInputs(SecID) {
  const baseScriptURL = 'https://script.google.com/macros/s/AKfycbwFa2ISlPqVBMcnZhD8lr91leeV18Ku3TkavqxmALiZbjQ9QuFDoIT9_7frLRNZHUr3/exec';
   // Get the actual DOM element by ID
   if(!userId) return;
   if(!userid) return;
    let inputs;

    if (SecID) {
        // ✅ Try to get the section
        const section = document.getElementById(SecID);
        if (!section) {
            console.warn("[DEBUG] Section not found for ID:", SecID);
            return;
        }

        // ✅ Only select inputs inside this section
        inputs = section.querySelectorAll('input[data-fetch_column]');
        // console.log("[DEBUG] Section Mode - Inputs in section:", SecID, inputs);
    } else {
        // ⚠️ Fallback: get ALL inputs across DOM
        inputs = document.querySelectorAll('input[data-fetch_column]');
        // console.log("[DEBUG] Fallback Mode - ALL inputs:", inputs);
    }
    localStorage.setItem("PreviousID",SecID);
    localStorage.removeItem("SecID")

    // console.log("data list appended stop becasue i am working, remove below return")
    // return
   
    
    inputs.forEach(input => {
        // console.log()
        const uid = input.getAttribute("data-unique_identifier");

        if (SecID) {
            // ✅ Section Mode: Skip inputs that already have a uid_
            if (uid && uid.startsWith("uid_")) {
                // console.log("[SKIP] Already has UID:", uid, input);
                return;
            }
        }

        const form = input.closest('form')
        const formId = form?.id;
        const uniqueId = 'uid_' + formId +"_" + Date.now() + '_' + Math.floor(Math.random() * 10000);
        input.dataset.unique_identifier = uniqueId;
        input.disabled = true
        addLoaderToField(input);

        const sheetName = input.dataset.sheet_name;
        const columnName = input.dataset.column_name;
        const tempId = uniqueId;

        if (!columnName || !sheetName) return;
        
        const queryString = `?action=getColumnData&sheet_name=${userId}_${sheetName}&column_name=${encodeURIComponent(columnName)}&field_id=${tempId}&callback=handleInputRequestData`;
        const scriptURL = `${baseScriptURL}${queryString}`;

        const script = document.createElement('script');
        script.src = scriptURL;

        // console.log(uniqueId,scriptURL)
        document.body.appendChild(script);
    });
}

// Step 2: Callback for when data is received from server
function handleInputRequestData(response) {
    if (response.status !== 'success') return;

    const uniqueId = response.field_id;
    // localStorage.setItem(uniqueId, JSON.stringify(response));
    appendColumnDataToInput(uniqueId,response);
    // document.getElementById('response').innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`
}

// Step 3: Process and append data to datalist
function appendColumnDataToInput(uniqueId, response) {
    const inputs = document.querySelectorAll('input[data-fetch_column]');
    inputs.forEach(input => {
        if (input.dataset.unique_identifier !== uniqueId) return;

        // Remove previous datalist association
        const oldDatalistId = input.getAttribute('list');
        if (oldDatalistId) {
            const oldDatalist = document.getElementById(oldDatalistId);
            if (oldDatalist) oldDatalist.remove(); // Optionally remove old datalist
        }

        // Create new datalist ID using uniqueId + input name
        const inputName = input.name || 'default';
        const newDatalistId = `${uniqueId}_${inputName}`;

        // Set the new list attribute on the input
        input.setAttribute('list', newDatalistId);

        // Create or reuse the new datalist element
        let datalist = document.getElementById(newDatalistId);
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = newDatalistId;
            document.body.appendChild(datalist); // Append to body or form
        }

        // Clear previous options
        datalist.innerHTML = '';

        // Populate the datalist based on column type
        const columnName = input.dataset.column_name;
        const values = response.column_values;

        if (columnName.includes('&') || columnName.includes('{')) {
            // Complex filters
            values.forEach(item => {
                if (typeof item === 'object') {
                    const keys = Object.keys(item);
                    const value = item[keys[0]];
                    const label = keys.length > 1 ? item[keys[1]] : value;
                    datalist.innerHTML += `<option value="${label}">${value}</option>`;
                }
            });
        } else {
            // Simple column
            values.forEach(val => {
                datalist.innerHTML += `<option value="${val}">${val}</option>`;
            });
        }

        // Finalize input state
        input.disabled = false;
        // input.removeAttribute('data-unique_identifier');
        // input.setAttribute("title", uniqueId); // Optional: set title for debugging

        // Remove loader or other UI indicators
        removeLoaderFromField(input);
    });
}


// processFetchableInputs();

// Call to start processing
// document.addEventListener('DOMContentLoaded', processFetchableInputs);



function loggerlogging(userid, documentnumber) {
  // Create the main alert container
  const alert = document.createElement('div');

  // Apply styling
  alert.style.display = "flex";
  alert.style.alignItems = "center";
  alert.style.justifyContent = "space-between";
  alert.style.padding = "10px 15px";
  alert.style.borderBottom = "1px solid rgb(210, 210, 210)";
  alert.style.backgroundColor = "#f9f9f9";
  alert.style.fontFamily = "Arial, sans-serif";
  alert.style.fontSize = "14px";
  alert.style.marginBottom = "5px";

  // Log message
  const message = document.createElement('div');
  message.textContent = `User ${userid} performed action on document ${documentnumber}`;
  message.style.flex = 1;
  message.style.color = "#333";

  // Timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'text-muted small';
  timestamp.textContent = getCurrentTimestamp();
  timestamp.style.whiteSpace = 'nowrap';
  timestamp.style.marginLeft = '20px';
  timestamp.style.color = "#888";
  timestamp.style.fontSize = "12px";

  // Append elements to alert
  alert.appendChild(message);
  alert.appendChild(timestamp);

  // Append to logging container at the TOP
  const loggingContainer = document.getElementById('logging');
  loggingContainer.insertBefore(alert, loggingContainer.firstChild); // ← Adds on top

  // Optional: Keep only last 20 logs
  const maxLogs = 20;
  while (loggingContainer.children.length > maxLogs) {
    loggingContainer.removeChild(loggingContainer.lastChild);
  }
}


  // Helper function to format current date as dd-mmm-yyyy hh:mm am/pm
  function getCurrentTimestamp() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = now.getDate().toString().padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert to 12-hour format

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }



    
 











// ?action=getColumnData&sheet_name=TestSheet&column_name=Company&field_id=companyInput&callback=handleFieldResponse






