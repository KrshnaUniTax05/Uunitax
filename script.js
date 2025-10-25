// onload





// Key ListnerGloabl;

document.addEventListener("keydown", FindActiononButton);

function FindActiononButton(event) {
  const keyname = event.key.toLowerCase(); // normalize
  const isShiftPressed = event.shiftKey;
  const isCtrlPressed = event.ctrlKey;
  const isAltPressed = event.altKey;

  const pagename = localStorage.getItem("PreviousID");
  // console.log("Current Page:", pagename, "Key Pressed:", keyname);
  
  if(isAltPressed && keyname === "d"){
    event.preventDefault()
    openOffcanvasAndFocusButton();
  }

  // if(keyname === "escape"){
  //   // console.log(bottomModalStatus)
  //   // if(bottomModalStatus === true);
  //     closeBottomModal()
  // }

  // Ignore standalone modifier keys
  if (["shift", "control", "alt"].includes(keyname)) return;



  // PAGE SPECIFIC
  if (pagename === "transactions") {
    // Shift + I
    if (isShiftPressed && keyname === "i") {
      // alert("Shift + I detected on Transactions page!");
    }

    // Alt + I
    if (isAltPressed && keyname === "i") {
      // alert("Alt + I detected on Transactions page!");
    }

    if(isAltPressed && keyname === "6"){
      showHeaderSettingsModal();
    }
  }

  if(pagename === "sales"){
    if(isAltPressed && keyname === "6"){
      // Pass the actual form ID to the function
      addadditonaldata("SalesForm"); 
      // alert("Additional data form shown. Check inside the SalesForm.");
    }
  }

  if(pagename === "purchase"){
    if(isAltPressed && keyname === "6"){
      // Pass the actual form ID to the function
      addadditonaldata("PurchaseForm"); 
      // alert("Additional data form shown. Check inside the SalesForm.");  
    }
  }
// You'd have similar logic for 'purchase' page passing 'PurchaseForm'
// ...

  // Example: F-key handling
  if (/^f\d{1,2}$/.test(keyname) && keyname !== "f12") {
    event.preventDefault();
    switch (keyname) {
      case "f9":
        showNotificationModal();
        break;
      case "f10":
        $('#calculatorModal').modal('show');
        initCalculatorSystem();
        break;
      case "f5":
        opentaskmodal()
        break;
      case "f2":
        setDatetoInputs()
        break;
      default:
        console.log("No function assigned to " + keyname);
    }
  }
}

function setDatetoInputs(){
 var code = `
          <div class="modal-footer">
            <input type="date">
            <button type="button" id="setCustomDateBtn" class="btn btn-primary">Set Date</button>
          </div>
        `


      openCustomModal(code)
}


document.querySelectorAll('.table input[type="number"]').forEach(input => {
    input.style.textAlign = "right";
  });

document.addEventListener('DOMContentLoaded', function() {
    // Function to create a notification with customizable title and body
    
    function createNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            var notification = new Notification(title, {
                body: body,
            });
            let timestampText = getTimestamp();
            appendNotification(title, timestampText);
        }
    }

//     // Function to check and request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                } else {
                    console.log('Notification permission denied or not yet granted.');
                }
            });
        } else {
            console.log('This browser does not support notifications.');
        }
    }

    // Example: Request permission on page load
    requestNotificationPermission();

    // Example: Use createNotification function with custom title and body
    // Replace these values with the desired title and body
    var customTitle = 'Custom Notification Title';
    var customBody = 'This is a custom notification created using JavaScript.';
    
    // Now you can call createNotification with different titles and bodies as needed
    // createNotification(customTitle, customBody);
  });

// Function to create and append the notification structure
// Function to append a new notification
// =================================================================
// GLOBAL UTILITY: TIME AGO
// =================================================================

/**
 * Converts a past timestamp into a human-readable "time ago" string.
 * This is defined globally so it can be used by both task rendering and notifications.
 * @param {string|Date} dateInput - The past timestamp.
 * @returns {string} The relative time string (e.g., "5 minutes ago", "yesterday").
 */
function timeAgo(dateInput) {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) return "in the future";
    if (seconds < 5) return "just now";

    const intervals = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
    ];

    // Handle 'Yesterday' specifically
    if (seconds >= intervals[2].seconds && seconds < intervals[2].seconds * 2) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === date.getFullYear()) {
            return "yesterday";
        }
    }
    
    // Loop through intervals
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            const noun = count === 1 ? interval.name : interval.name + 's';
            return `${count} ${noun} ago`;
        }
    }
    
    return "just now";
}

// =================================================================
// NOTIFICATION SYSTEM
// =================================================================
const NOTI_STORAGE_KEY = 'taskNotifications';
const MAX_NOTIFICATIONS = 30;
const NOTI_CONTAINER_SELECTOR = '.model-noti';
const NOTI_BADGE_ID = 'notificationBadge'; // ID of the red badge element

/**
 * Helper to get a professional icon based on the message content.
 */
function getNotificationIcon(messageText) {
    const text = messageText.toLowerCase();
    if (text.includes('overdue')) {
        return '<i class="bi bi-x-circle-fill text-danger fs-5"></i>';
    }
    if (text.includes('reminder') || text.includes('due')) {
        return '<i class="bi bi-bell-fill text-warning fs-5"></i>';
    }
    if (text.includes('success') || text.includes('added')) {
        return '<i class="bi bi-check-circle-fill text-success fs-5"></i>';
    }
    return '<i class="bi bi-info-circle-fill text-primary fs-5"></i>';
}

/**
 * Retrieves the current notification list from Local Storage.
 */
function getNotificationsFromStorage() {
    try {
        const stored = localStorage.getItem(NOTI_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error reading notifications from storage:", e);
        return [];
    }
}

/**
 * Saves the updated notification list to Local Storage, applying the 30-item limit.
 */
function saveNotificationsToStorage(notifications) {
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedNotifications = notifications.slice(0, MAX_NOTIFICATIONS);
    
    try {
        localStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(limitedNotifications));
    } catch (e) {
        console.error("Error saving notifications to storage:", e);
    }
}

// ------------------------------------------------------------------
// NEW/UPDATED CORE LOGIC
// ------------------------------------------------------------------

/**
 * Toggles the visibility of the red notification badge based on unread count.
 */
function updateNotificationBadge() {
    const badgeElement = document.getElementById(NOTI_BADGE_ID);
    if (!badgeElement) return;

    const notifications = getNotificationsFromStorage();
    
    // Count notifications where 'read' property is false
    const unreadCount = notifications.filter(n => n.read === false).length;
    
    if (unreadCount > 0) {
        badgeElement.style.display = 'inline';
        // Optional: Update the badge text with the count
        badgeElement.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
    } else {
        badgeElement.style.display = 'none';
    }
}

/**
 * Marks ALL current notifications as read and saves the updated list.
 * This is called when the notification modal is opened.
 */
function markAllAsRead() {
    let notifications = getNotificationsFromStorage();
    let updated = false;

    notifications = notifications.map(n => {
        if (n.read === false) {
            n.read = true;
            updated = true;
        }
        return n;
    });

    if (updated) {
        saveNotificationsToStorage(notifications);
        // Re-render to remove the unread highlight in the modal
        renderAllNotifications();
        // Update the badge status immediately
        updateNotificationBadge(); 
    }
}

// ------------------------------------------------------------------
// RENDERING FUNCTIONS (MODIFIED to highlight unread items)
// ------------------------------------------------------------------

/**
 * Generates the HTML for a single notification item.
 */
function createNotificationHTML(notification) {
    const iconHTML = getNotificationIcon(notification.text);
    const timeAgoText = timeAgo(notification.timestamp);
    
    // Add a class for unread notifications to allow styling
    const unreadClass = notification.read === false ? 'list-group-item-light fw-bold' : '';

    return `
        <div class="list-group-item list-group-item-action d-flex align-items-start py-2 noti-item ${unreadClass}" data-id="${notification.id}">
            
            <div class="noti-icon me-3 pt-1">
                ${iconHTML}
            </div>

            <div class="noti-text-part flex-grow-1">
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="noti-message mb-0">${notification.text}</div>
                    
                    <small class="text-muted noti-timestamp text-end" style="min-width: 80px;">
                        ${timeAgoText}
                    </small>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders all notifications from the data array to the DOM and updates the badge.
 */
function renderAllNotifications() {
    const notiContainer = document.querySelector(NOTI_CONTAINER_SELECTOR);
    if (!notiContainer) return;

    const notifications = getNotificationsFromStorage();
    
    notiContainer.innerHTML = ''; 

    if (notifications.length === 0) {
        notiContainer.innerHTML = '<div class="text-center p-3 text-muted">No notifications yet.</div>';
    } else {
        const listGroup = document.createElement('div');
        listGroup.classList.add('list-group', 'list-group-flush');

        notifications.forEach(notification => {
            const html = createNotificationHTML(notification);
            listGroup.insertAdjacentHTML('beforeend', html);
        });
        
        notiContainer.appendChild(listGroup);
    }
    
    // Crucial: Update the badge after rendering
    updateNotificationBadge(); 
}

/**
 * Appends a new notification message to the UI and updates Local Storage.
 */
function appendNotification(messageText, idPrefix = 'Noti') {
    const now = new Date();
    
    // NEW: All new notifications start as unread
    const newNotification = {
        id: `${idPrefix}-${now.getTime()}`,
        text: messageText,
        timestamp: now.toISOString(),
        read: false 
    };

    let notifications = getNotificationsFromStorage();
    notifications.unshift(newNotification);

    saveNotificationsToStorage(notifications);
    renderAllNotifications(); // Renders and updates the badge
}

// ------------------------------------------------------------------
// INITIALIZATION & EVENT HANDLERS (MODIFIED for Modal Show/Hide)
// ------------------------------------------------------------------

function showNotificationModal() {
    const modalElement = document.getElementById('notificationModal');
    if (!modalElement) {
        console.error("Modal element with ID 'notificationModal' not found.");
        return;
    }

    // Create Bootstrap modal instance
    const modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });

    // Render all notifications (update UI)
    renderAllNotifications();

    // Mark all as read immediately when showing modal
    markAllAsRead();

    // Show the modal
    modalInstance.show();

    // (Optional) If you want live refresh every 1 min while modal is open:
    const intervalId = setInterval(() => {
        if (!modalElement.classList.contains('show')) {
            clearInterval(intervalId); // stop when modal closes
        } else {
            renderAllNotifications();
        }
    }, 60000);
}



// Function to get the formatted timestamp (today, yesterday, or earlier)
function getTimestamp() {
  const today = new Date();
  const actionDate = today;

  const isToday = today.toDateString() === actionDate.toDateString();
  const isYesterday = new Date(today - 86400000).toDateString() === actionDate.toDateString(); // 86400000 milliseconds = 1 day

  if (isToday) {
      // Return hh:mm format for actions done today
      const hours = actionDate.getHours().toString().padStart(2, '0');
      const minutes = actionDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
  } else if (isYesterday) {
      // Return "Yesterday" for actions done yesterday
      return 'Yesterday';
  } else {
      // Return dd mmm format for actions done prior to yesterday
      const day = actionDate.getDate().toString().padStart(2, '0');
      const month = (actionDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
      const year = actionDate.getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[parseInt(month, 10) - 1]}`;
  }
}

// Example usage:
// appendNotification('Notification 1');
// setTimeout(() => appendNotification('Notification 2'), 1000);
// setTimeout(() => appendNotification('Notification 3'), 2000);


// Example usage:
const currentActionTimestamp = getTimestamp();
// console.log(currentActionTimestamp);

// searchbox

function focusSearchBox() {
    document.getElementById('searchBox').focus();
}

// Event listener for keypress
document.addEventListener('keydown', function(event) {
    // Check if the pressed key is "/"
    if (event.key === '/') {
        event.preventDefault(); // Prevent the "/" character from being inserted in the input
        focusSearchBox(); // Call the function to focus on the search box
    }
    var searchBox = document.getElementById('searchBox')
    // Check if the pressed key is "Escape"
    if (event.key === 'Escape' && document.activeElement === searchBox) {
        searchBox.blur(); // Remove focus from the search box
        // searchResults.style.display = 'none'; // Hide the dropdown
    }
});
// code to open assortnment

function openOffcanvasAndFocusButton() {
  // Find the anchor tag that triggers the offcanvas
  const offcanvasTrigger = document.querySelector('a[data-bs-toggle="offcanvas"]');
  
  if (!offcanvasTrigger) return;

  // Programmatically trigger a click on the anchor tag
  offcanvasTrigger.click();

  // Wait for the offcanvas to show and then focus the specific button
  const offcanvasElement = document.querySelector('.offcanvas');
  if (!offcanvasElement) return;

  // Use once:true to avoid multiple bindings
  offcanvasElement.addEventListener('shown.bs.offcanvas', function () {
    const button = document.querySelector('#nav-home-tab'); // Button to focus
    if (button) button.focus();
  }, { once: true });
}


function changeInitialSection(anchor) {
  // Get the href attribute of the anchor tag (remove the '#' part)
  hideOffcanvas();
  var sectionId = $(anchor).attr('href').substring(1); // Removes the '#' from href

  // Hide all sections first
  $(".section").hide();

  // Show the section corresponding to the sectionId
  $("#" + sectionId).show();
  localStorage.setItem("SecID",sectionId)
  localStorage.setItem("PreviousSecID",sectionId)
  // Hide the offcanvas if it is open
}

// Function to hide the offcanvas and its backdrop properly using CSS in JS
function hideOffcanvas() {
  // Find the offcanvas and backdrop elements
   // Find the close button within the offcanvas
   const closeButton = document.querySelector('.offcanvas .btn-close');

   // Check if the close button exists
   if (closeButton) {
     // Trigger a click on the close button
     closeButton.click();
   }
}


// Function to enable navigation between <li> elements using arrow keys
function enableArrowNavigation() {
  // Listen for keydown event on the document
  document.addEventListener('keydown', function(event) {
    // Check if the focused element is a link (<a>) inside a <li> in a <ul>
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.tagName.toLowerCase() === 'a' && focusedElement.parentElement.tagName.toLowerCase() === 'li') {
      const currentLi = focusedElement.parentElement; // The <li> that is currently focused
      const parentUl = currentLi.parentElement; // The <ul> containing the <li>s
      const liItems = Array.from(parentUl.children); // All <li> items in the <ul>

      const currentIndex = liItems.indexOf(currentLi); // Get the index of the current <li>

      // Handle Down Arrow Key (ArrowDown)
      if (event.key === 'ArrowDown' && currentIndex < liItems.length - 1) {
        event.preventDefault(); // Prevent default scrolling behavior
        liItems[currentIndex + 1].querySelector('a').focus(); // Focus next <a> tag inside next <li>
      }

      // Handle Up Arrow Key (ArrowUp)
      if (event.key === 'ArrowUp' && currentIndex > 0) {
        event.preventDefault(); // Prevent default scrolling behavior
        liItems[currentIndex - 1].querySelector('a').focus(); // Focus previous <a> tag inside previous <li>
      }
    }
  });
}

// Call this function to initialize the navigation
enableArrowNavigation();

  localStorage.removeItem("SecID");

// display none behaviour
$(document).ready(function () {
  var currentSectionId = "transactions"; // Initial value set to "led"
  localStorage.setItem("SecID", currentSectionId)
  // Show the initial section
  $("#" + currentSectionId).show();
  localStorage.setItem("SecID", currentSectionId)
  localStorage.setItem("PreviousSecID", currentSectionId)


  // Function to change the initial section
 // Function to change the initial section




  // Listen for changes in the search input
  $("#searchBox").on("input", function () {
    var searchText = $(this).val().toLowerCase();
    currentSectionId = searchText; // Update current section ID dynamically
  });

  // Listen for Enter key press
$("#searchBox").on("keydown", function (e) {
    // Detect Enter key (not keypress, because 'keypress' is deprecated)
    if (e.key === "Enter") {
        e.preventDefault(); // Prevent default Enter behavior

        // Immediately hide all sections and show loader
        $(".section").hide();
        $("#section-loader").show();

        setTimeout(() => {
            if (currentSectionId !== "") {
                const matchingSection = $("#" + currentSectionId);

                if (matchingSection.length) {
                    // Hide loader and show the correct section
                    $("#section-loader").hide();
                    $(".section").hide();
                    matchingSection.show();

                    const sectionId = matchingSection.attr("id");
                    localStorage.setItem("SecID", sectionId);
                    localStorage.setItem("PreviousSecID", sectionId);

                    // Focus first input field
                    const firstInput = matchingSection.find("input, textarea, select").first();
                    if (firstInput.length) firstInput.focus();

                } else {
                    // Handle invalid section
                    errorNotificationHandler("error", "No matching section found for: " + currentSectionId);
                    $("#section-loader").hide();

                    const prev = localStorage.getItem("PreviousSecID");
                    if (prev) $("#" + prev).show();
                    return;
                }

                $(this).val('');
                $(this).blur();

            } else {
                // No section ID case
                $("#section-loader").hide();
            }
        }, 400); // Smooth 400ms delay
    }
});




  // Example: Change initial section when needed
   // Replace 'ogls' with your desired initial section
});

// function changeInitialSection(newSectionId) {
//     // Remove the previous SecID
//     localStorage.removeItem("SecID");

//     // Hide all sections first
//     $(".section").hide();

//     // Show the new section
//     $("#" + newSectionId).show();

//     // Update current section ID
//     currentSectionId = newSectionId;

//     // Automatically focus the first input field in the new section
//     var firstInput = $("#" + newSectionId).find("input, textarea, select").first();
//     if (firstInput.length) {
//         firstInput.focus(); // Focus the first input field
//     }

//     // ✅ Update SecID in localStorage
//     localStorage.setItem("SecID", currentSectionId);
//     console.warn(localStorage.getItem("SecID"))
//     console.log("[DEBUG] SecID updated to:", currentSectionId);
// }





document.addEventListener("DOMContentLoaded", function() {
    const sectionLinks = document.querySelectorAll('.section-link');
    sectionLinks.forEach(link => {
        link.addEventListener('click', function() {
            const filePath = this.dataset.href;
            includeHTML(filePath, 'dynamicContent');
        });
    });
});

function includeHTML(filePath, targetId) {
    fetch(filePath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
        })
        .catch(error => console.error('Error fetching HTML:', error));
}


// Function to handle Ctrl+A key press
function handleCtrlA(event) {
  // Check if Ctrl+A is pressed
  if (event.ctrlKey && event.key === '1') {
      // alert('cl')
        // Prevent the default behavior of selecting all text
        event.preventDefault();
        
        // Find the active form
        var activeForm = document.activeElement.closest('form');
        
        // Check if an active form is found
        if (activeForm) {
            // Submit the active form
            activeForm.submit();
        }
    }
}

// Add event listener to capture key press events
document.addEventListener('keydown', handleCtrlA);

// time and date

function updateTimeAndDate() {
    var now = new Date();
    
    // Format time in hh:mm AM/PM
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var timeString = hours + ':' + minutes + ' ' + ampm;
    
    // Format date in MMM dd, yyyy
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = months[now.getMonth()];
    var day = now.getDate();
    var year = now.getFullYear();
    var dateString = month + ' ' + day + ', ' + year;
    
    // Update HTML elements
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
  }
  
  // Update time and date every second
  setInterval(updateTimeAndDate, 1000);
  
  // Initial call to display time and date immediately
  updateTimeAndDate();


//  

function initCalculatorSystem() {
  // 🛑 FIX: Use an initialization flag to ensure global listeners are registered ONLY ONCE.
  if (initCalculatorSystem.isInitialized) {
    console.warn("Calculator system already initialized. Skipping listener setup.");
    return;
  }
  initCalculatorSystem.isInitialized = true;

  (function() {
    // --- Constants and Setup ---
    const modal = $('#calculatorModal');
    const display = $('#display');

    if (typeof jQuery === 'undefined' || typeof $.fn.modal === 'undefined') {
      console.error("❌ Dependencies missing: jQuery and Bootstrap Modal are required.");
      return;
    }

    if (modal.length === 0 || display.length === 0) {
      console.error("❌ Calculator modal (#calculatorModal) or display element (#display) not found. Initialization stopped.");
      return;
    }

    // --- Core Calculator Logic ---
    function clearDisplay() {
      display.val('');
    }

    function deleteLastCharacter() {
      const currentVal = display.val();
      display.val(currentVal.substring(0, currentVal.length - 1));
    }

    function appendToDisplay(value) {
      const currentVal = display.val();
      const lastChar = currentVal.slice(-1);
      // Added '%' and '/' to the operator list for validation
      const isOperator = ['+', '-', '*', '/', '%'].includes(value); 
      const lastIsOperator = ['+', '-', '*', '/', '%'].includes(lastChar);
      
      // Prevents adding two operators in a row, replaces the previous one instead
      if (isOperator && lastIsOperator) {
         display.val(currentVal.slice(0, -1) + value);
      } else {
         display.val(currentVal + value);
      }
    }

    function calculate() {
      try {
        let expression = display.val();
        
        // Handle Percentage (e.g., 50% becomes 50/100).
        expression = expression.replace(/%/g, '/100'); 
        
        const result = eval(expression);
        display.val(Number.isFinite(result) ? result : 'Error'); 
      } catch (error) {
        display.val('Error');
      }
    }
    
    // --- Event Handling ---

    // Focus Display when Modal is Visible (Bootstrap event - registered once)
    modal.on('shown.bs.modal', function () {
      display.trigger('focus');
    });

    // KeyDOWN Handler (For control keys and the problematic '/')
    document.addEventListener('keydown', function(event) {
      if (!modal.hasClass('show')) return;
      
      const key = event.key;
      // 🛑 FIX 1: Include '/' here so its default browser action is prevented IMMEDIATELY.
      const isImmediatePreventKey = ['Enter', 'Backspace', 'Escape', '=', '/'].includes(key); 
      
      if (isImmediatePreventKey) {
          event.preventDefault(); 

          if (key === "Enter" || key === "=") {
              calculate();
          } else if (key === "Backspace") {
              deleteLastCharacter();
          } else if (key === "Escape") {
              clearDisplay();
          } else if (key === "/") {
              // 🛑 FIX 2: Manually append the division symbol here after preventing default
              appendToDisplay(key);
          }
      }
      display.trigger('focus');
    });

    // KeyPRESS Handler (For all other characters - FIXES DOUBLE ENTRY)
    document.addEventListener('keypress', function(event) {
        if (!modal.hasClass('show')) return;

        const key = event.key;
        // '/' is REMOVED from this check, as it's handled in keydown
        const isAppendableKey = /^[0-9+\-*%.]$/.test(key); 

        if (isAppendableKey) {
            event.preventDefault(); // Stops the browser from inserting the character
            appendToDisplay(key); // Manually inserts the character once
        }
    });

    // Public API Exposure
    window.showCalculatorModal = function() { modal.modal('show'); };
    window.clearDisplay = clearDisplay;
    window.calculate = calculate;

  })();
}

//   loader
  // $(window).on('load', function () {
  //     $('#loader').fadeOut('slow');
  //   });


//   document.addEventListener("DOMContentLoaded", function() {
//     const dynamicContentDiv = document.getElementById("dynamicContent");
//     const htmlFilePath = dynamicContentDiv.getAttribute("data-src");

//     fetch(htmlFilePath)
//         .then(response => response.text())
//         .then(html => {
//             dynamicContentDiv.innerHTML = html;
//         })
//         .catch(error => console.error('Error fetching HTML:', error));
// });

document.addEventListener("DOMContentLoaded", function() {
    // --- DOM Elements ---
    const taskForm = document.getElementById('taskForm');
    const reminderCheck = document.getElementById('reminderCheck');
    const reminderTimeInputContainer = document.getElementById('reminderTimeInput');
    const taskTableBody = document.getElementById('taskTableBody');
    const toastElement = document.getElementById('toast');
    
    // Check if the toast element exists before trying to initialize it
    const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

    // --- Local Storage Key ---
    const STORAGE_KEY = 'taskListData';
    
    // --- Global Task List Array ---
    let tasks = [];

    // =================================================================
    // 1. HELPER FUNCTIONS
    // =================================================================

    /**
  
    /**
     * Converts a past timestamp into a human-readable "time ago" string.
     * @param {string|Date} dateInput - The past timestamp.
     * @returns {string} The relative time string (e.g., "5 minutes ago").
     */
    function timeAgo(dateInput) {
        const date = new Date(dateInput);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 0) return "in the future";
        if (seconds < 5) return "just now";

        const intervals = [
            { name: 'year', seconds: 31536000 },
            { name: 'month', seconds: 2592000 },
            { name: 'week', seconds: 604800 },
            { name: 'day', seconds: 86400 },
            { name: 'hour', seconds: 3600 },
            { name: 'minute', seconds: 60 },
            { name: 'second', seconds: 1 }
        ];

        // Yesterday check
        if (seconds >= intervals[3].seconds && seconds < intervals[3].seconds * 2) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
                return "yesterday";
            }
        }
        
        // Loop through intervals
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                const noun = count === 1 ? interval.name : interval.name + 's';
                return `${count} ${noun} ago`;
            }
        }
        
        return "just now";
    }
    
    /**
     * Saves the current tasks array to Local Storage.
     */
    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }


    /**
 * Calculates the time remaining until a future timestamp in a human-readable format.
 * @param {string|Date} futureDateInput - The future timestamp.
 * @returns {string} The relative time string (e.g., "in 5 minutes") or null if overdue.
 */
function timeUntil(futureDateInput) {
    const futureDate = new Date(futureDateInput);
    const now = new Date();
    const seconds = Math.floor((futureDate - now) / 1000);

    if (seconds <= 60) return "in less than a minute";
    if (seconds < 0) return null; // Overdue

    const intervals = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            const noun = count === 1 ? interval.name : interval.name + 's';
            return `in ${count} ${noun}`;
        }
    }
    
    return "soon";
}

setInterval(renderTasks, 60000);

/**
 * Generates the HTML markup for a single task row, aligning with 4 table columns.
 * Implements relative time display and Overdue status for reminders.
 * @param {Object} task - The task object.
 * @param {number} index - The display row index (1-based).
 * @returns {string} The HTML string for the table row.
 */
function createTaskRowHTML(task, index) {
    // Human-readable creation time (Assumes timeAgo is defined elsewhere)
    const creationTimeAgo = timeAgo(task.timestampInput); 

    let reminderInfo = `<span class="badge bg-secondary">No Reminder</span>`;
    let rowClass = '';
    
    if (task.reminderSet) {
        const timeRemaining = timeUntil(task.reminderTime); // Assumes timeUntil is defined elsewhere

        if (timeRemaining === null) {
            // FIX: Overdue state - Set RED badge and DANGER row class
            reminderInfo = `<span class="badge bg-danger">OVERDUE</span>`;
            rowClass = 'table-danger'; 
        } else {
            // Upcoming state - Set YELLOW badge and WARNING row class
            reminderInfo = `<span class="badge bg-warning text-dark">${timeRemaining}</span>`;
            rowClass = 'table-warning'; 
        }
    }
    
    // Fallback row class if no reminder is set
    rowClass = rowClass || '';

    return `
        <tr class="task-row p-3 ${rowClass} align-middle" data-id="${task.id}">
            
            <th>${index}</th>
            
            <td class="task-main">
                <div class="fw-bold text-primary text-wrap align-item-center p-1 mb-1">${task.taskInput.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}</div>
                <small class="text-muted fst-italic">
                    Created: ${creationTimeAgo}
                </small>
            </td>

            <td class="text-center p-0 m-0">
                ${reminderInfo}
            </td>

            <td class="text-end">
                <button class="btn btn-sm btn-primary delete-task  m-0" data-id="${task.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

    /**
     * Sorts the tasks: Reminder time ascending (if set), otherwise Creation time descending.
     * @param {Object} a - First task.
     * @param {Object} b - Second task.
     * @returns {number} Sort comparison result.
     */
    function sortTasks(a, b) {
        // Priority 1: Sort by Reminder Time (Soonest first)
        if (a.reminderSet && b.reminderSet) {
            return new Date(a.reminderTime) - new Date(b.reminderTime);
        }
        // Priority 2: Tasks WITH a reminder come before tasks WITHOUT a reminder
        if (a.reminderSet && !b.reminderSet) {
            return -1;
        }
        if (!a.reminderSet && b.reminderSet) {
            return 1;
        }
        // Priority 3: If neither has a reminder, sort by Creation Time (Newest first)
        return new Date(b.timestampInput) - new Date(a.timestampInput);
    }

    /**
     * Renders the sorted tasks array to the DOM and sets up event listeners.
     */
    function renderTasks() {
        if (!taskTableBody) return;
        
        tasks.sort(sortTasks);
        taskTableBody.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const rowHTML = createTaskRowHTML(task, index + 1);
            taskTableBody.insertAdjacentHTML('beforeend', rowHTML);
            
            // Set up reminder alarms if they haven't been handled
            if (task.reminderSet && !task.reminderHandled) {
                setReminderAlarm(task);
            }
        });

        // Attach delete listeners to the newly rendered buttons
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', handleDeleteTask);
        });
    }

    /**
     * Loads tasks from Local Storage and renders them.
     */
    function loadTasks() {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        if (storedTasks) {
            try {
                tasks = JSON.parse(storedTasks);
                // Ensure every task has a unique ID for deletion
                tasks.forEach(task => {
                    if (!task.id) task.id = crypto.randomUUID();
                });
                renderTasks();
            } catch (e) {
                console.error("Could not parse tasks from Local Storage:", e);
                tasks = [];
            }
        }
    }

    /**
     * Sets a setTimeout for a task reminder.
     * @param {Object} task - The task object.
     */
    function setReminderAlarm(task) {
        const now = new Date();
        const reminderTimestamp = new Date(task.reminderTime);

        if (now < reminderTimestamp) {
            setTimeout(() => {
                showToast('⏰ REMINDER!', `Task "${task.taskInput}" is due now.`);
                appendNotification(`Task "${task.taskInput}" is due now.`);
                
                // Mark as handled
                task.reminderHandled = true;
                saveTasks();
                renderTasks(); // Re-render to update any visual status
            }, reminderTimestamp - now);
        } else {
             // Reminder time has already passed
             showToast('⚠️ MISSED REMINDER!', `Task "${task.taskInput}" was due ${timeAgo(reminderTimestamp)}.`);
             task.reminderHandled = true;
             saveTasks();
        }
    }

    // =================================================================
    // 2. EVENT HANDLERS
    // =================================================================

    /**
     * Handles form submission to add a new task.
     */
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const taskInput = document.getElementById('taskInput').value.trim();
            const timestampInput = document.getElementById('timestampInput').value;
            const reminderTime = document.getElementById('reminderTime').value;
            const reminderSet = reminderCheck.checked;
            
            if (!taskInput || !timestampInput) {
                 showToast('Input Error', 'Please ensure Task and Creation Time are filled.');
                 return;
            }

            const newTask = {
                id: crypto.randomUUID(),
                taskInput: taskInput,
                timestampInput: timestampInput, 
                reminderSet: reminderSet,
                reminderTime: reminderSet ? reminderTime : null,
                reminderHandled: false 
            };

            tasks.push(newTask);
            saveTasks();
            renderTasks();

            showToast('Task Added!', `"${taskInput}" saved and scheduled.`);

            // Reset form and UI
            taskForm.reset();
            if (reminderCheck) reminderCheck.checked = false;
            if (reminderTimeInputContainer) reminderTimeInputContainer.style.display = 'none';
        });
    }

    /**
     * Handles the delete button click.
     * @param {Event} e - The click event.
     */
    function handleDeleteTask(e) {
        const button = e.target.closest('.delete-task');
        const taskIdToDelete = button.dataset.id;
        
        if (!taskIdToDelete) return;

        tasks = tasks.filter(task => task.id !== taskIdToDelete);
        
        showToast('Task Deleted', 'The task has been permanently removed.');  
        saveTasks();
        renderTasks();
    }

    /**
     * Toggles the visibility of the reminder time input.
     */
    if (reminderCheck && reminderTimeInputContainer) {
        reminderCheck.addEventListener('change', function() {
            reminderTimeInputContainer.style.display = this.checked ? 'block' : 'none';
        });
    }

    // =================================================================
    // 3. INITIALIZATION
    // =================================================================
    
    loadTasks();
    if (reminderTimeInputContainer && reminderCheck) {
        // Set initial state for the reminder input container
        reminderTimeInputContainer.style.display = reminderCheck.checked ? 'block' : 'none';
    }
});
  


function showToast(title, bodyMessage, timestamp = new Date()) {
    const toastElement = document.getElementById('toast');

    // 1. Basic Safety Check: Ensure the main element exists
    if (!toastElement) {
        console.error("Toast element with ID 'toast' not found.");
        return;
    }

    // 2. Identify Inner Elements
    const toastTitle = toastElement.querySelector('.toast-header strong');
    const toastTime = toastElement.querySelector('.toast-header small');
    const toastBody = toastElement.querySelector('.toast-body');

    // 3. Format Time
    const timeDisplay = new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // 4. Update Content
    if (toastTitle) toastTitle.textContent = title;
    if (toastTime) toastTime.textContent = timeDisplay;
    if (toastBody) toastBody.textContent = bodyMessage;

    // 5. Show Toast - FIX APPLIED HERE
    const toast = new bootstrap.Toast(toastElement, {
        // Set the duration in milliseconds. 7000ms = 7 seconds. 
        // Default is 5000ms, but setting it here is more robust.
        delay: 5000, 
        // Ensure autohide is true (the default, but explicit is better)
        autohide: true 
    });
    
    // Reset the toast state (crucial if you are reusing the same DOM element quickly)
    toastElement.classList.remove('hide');
    toastElement.classList.remove('showing'); 
    
    toast.show();
}

// Example Usage:
// showToast('Success!', 'Task has been successfully saved.', new Date()); 
// showToast('Reminder!', 'Time to check your task list.', '2025-10-15T10:30:00');



//   document.addEventListener("DOMContentLoaded", function() {
//     // Add event listener for keydown event
//     document.addEventListener("keydown", function(event) {
//       // Check if the pressed key is F5 (key code 116)
//       if (event.keyCode === 116) {
//         // Prevent default reloading behavior
//         event.preventDefault();
        
//         // Open the modal
//         const modal = new bootstrap.Modal(document.getElementById('taskModal'));
//         modal.show();
//       }
//     });
    
// // code to fetch section.
//   });


function opentaskmodal(){
        
        // Open the modal
  const modal = new bootstrap.Modal(document.getElementById('taskModal'));
  modal.show();

}
  
//   document.addEventListener("DOMContentLoaded", function() {
//     // Get all elements with class 'dynamic-content'
//     var contentDivs = document.querySelectorAll(".dynamic-content");

//     // Iterate over each div
//     contentDivs.forEach(function(contentDiv) {
//         // Get the data-href attribute value for each div
//         var href = contentDiv.getAttribute("data-href");

//         // Create a new XMLHttpRequest object
//         var xhr = new XMLHttpRequest();

//         // Configure the request
//         xhr.open("GET", href, true);

//         // Set up event listener to handle the response
//         xhr.onreadystatechange = function() {
//             if (xhr.readyState === XMLHttpRequest.DONE) {
//                 if (xhr.status === 200) {
//                     // Insert the fetched content into the div
//                     contentDiv.innerHTML = xhr.responseText;
//                 } else {
//                     console.error('Error loading content:', xhr.statusText);
//                 }
//             }
//         };

//         // Send the request
//         xhr.send();
//     });
// });


// Function to handle keydown event
 document.addEventListener("keydown", function(event) {
    // Check if Ctrl key and '.' key (keyCode 190) are pressed simultaneously
    if (event.ctrlKey && event.keyCode === 190) {
      // Show the Bootstrap modal with unique ID
      $('#shortcutModal_5f2d8c9e').modal('show');
    }
  });

  document.addEventListener("DOMContentLoaded",()=>{
    user = document.getElementById("main_userid_show");
    if(!user) alert("User not loaded");
    user.innerHTML ="User: "+ userId;
  })













  // Iterate over each div
// A global Set to track scripts that have already been requested/appended.
// This is the key to preventing duplicate script execution errors.
const loadedScripts = new Set();

// Function to load external scripts safely and only once
function loadDynamicScript(src) {
    // 1. Deduplication check
    if (loadedScripts.has(src)) {
        // console.warn('Script already loaded, ignoring duplicate:', src);
        return Promise.resolve();
    }
    loadedScripts.add(src);
    
    // 2. Load the script using a Promise
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true; // Use async to prevent blocking

        script.onload = resolve;

        script.onerror = () => {
            loadedScripts.delete(src); // Remove from set if it fails, allowing a retry
            reject(new Error(`Failed to load script ${src}`));
        };
        
        // Append the script to the document body to start loading
        document.body.appendChild(script);
    });
}



// Robust dynamic content + script loader
document.addEventListener("DOMContentLoaded", () => {
  const contentDivs = Array.from(document.querySelectorAll(".dynamic-content"));
  if (!contentDivs.length) return console.log("No .dynamic-content elements found.");

  const origin = window.location.origin;
  const pathnameParts = window.location.pathname.split("/").filter(Boolean); // e.g. ["Uunitax","index.html"]
  const repoSegment = pathnameParts.length ? `/${pathnameParts[0]}/` : "/"; // "/Uunitax/" or "/"
  const defaultPrefixes = [
    "",                      // relative like "Sections/foo.html" or "foo.html"
    "Uunitax/",              // "Uunitax/Sections/foo.html"
    "/Uunitax/",             // absolute path from origin "/Uunitax/Sections/foo.html"
    "Sections/",             // "Sections/foo.html"
    "/Sections/",            // "/Sections/foo.html"
    repoSegment,             // "/RepoName/foo.html"
    `${origin}${repoSegment}`, // "https://.../RepoName/"
    `${origin}/`,            // "https://.../"
    `${origin}/Uunitax/`     // explicit origin + Uunitax
  ];

  const loadedScripts = new Set(); // keep track of loaded external scripts (full URLs)
  const TIMEOUT = 8000; // ms per fetch attempt

  // Utility: fetch with timeout and validate content-type
  async function fetchWithTimeout(url, timeout = TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const resp = await fetch(url, { method: "GET", signal: controller.signal, cache: "no-cache" });
      clearTimeout(id);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const ct = resp.headers.get("content-type") || "";
      if (!ct.includes("text/html") && !ct.includes("text/plain")) {
        // still accept text/plain (some hosts), but reject images etc.
        // We will still attempt to read text — but reject if clearly not HTML.
        // For strictness, you could reject here.
      }
      const text = await resp.text();
      return { ok: true, text, url };
    } catch (err) {
      clearTimeout(id);
      return { ok: false, error: err, url };
    }
  }

  // Build candidate full URLs for a given href
  function buildCandidatesFor(href) {
    // If href is absolute URL, try it directly first
    const candidates = [];
    if (/^https?:\/\//i.test(href)) {
      candidates.push(href);
      return candidates;
    }

    // Normalize href: remove leading slash for combination
    const bareHref = href.replace(/^\/+/, "");

    // For each prefix produce full URL or relative string depending
    for (const p of defaultPrefixes) {
      // if prefix already looks like origin, combine directly
      if (p.startsWith("http")) {
        candidates.push(p + bareHref);
      } else if (p.startsWith("/")) {
        candidates.push(origin + p + bareHref);
      } else {
        // include relative and origin versions
        candidates.push(p + bareHref);           // e.g. "Uunitax/Sections/foo.html" or "Sections/foo.html" or "foo.html"
        candidates.push(origin + "/" + p + bareHref); // e.g. "https://.../Uunitax/Sections/foo.html"
      }
    }

    // Also try a candidate relative to the current document location directory
    const currentDir = window.location.pathname.replace(/\/[^/]*$/, "/").replace(/^\/+/, "");
    candidates.push(currentDir + bareHref);
    candidates.push(origin + "/" + currentDir + bareHref);

    // De-duplicate while preserving order
    return Array.from(new Set(candidates));
  }

  // Resolve scriptSrc relative to a base URL (base is the successful HTML URL)
  function resolveScriptUrl(scriptSrc, baseUrl) {
    if (!scriptSrc) return null;
    if (/^https?:\/\//i.test(scriptSrc)) return scriptSrc;
    // If scriptSrc starts with '/', treat as origin absolute
    if (scriptSrc.startsWith("/")) return origin + scriptSrc;
    // If baseUrl is provided, build relative to base directory
    try {
      const baseDir = baseUrl.replace(/\/[^\/]*$/, "/"); // strip filename
      return new URL(scriptSrc, baseDir).toString();
    } catch (e) {
      // fallback: try repoSegment
      return origin + repoSegment + scriptSrc.replace(/^\/+/, "");
    }
  }

  // Dynamically add external script if not already present
  function loadExternalScriptOnce(url) {
    return new Promise((resolve, reject) => {
      if (!url) return resolve();
      // If already loaded or loading (tracked by set), resolve
      if (loadedScripts.has(url)) return resolve();
      // If a <script src="..."> already exists in DOM with same src, treat as loaded
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        loadedScripts.add(url);
        // If existing script hasn't fired yet, attach onload/onerror
        if (existing.hasAttribute("data-loaded")) {
          return resolve();
        } else {
          existing.addEventListener("load", () => {
            existing.setAttribute("data-loaded", "1");
            loadedScripts.add(url);
            resolve();
          });
          existing.addEventListener("error", (e) => reject(e));
          return;
        }
      }
      // Otherwise create and append
      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => {
        s.setAttribute("data-loaded", "1");
        loadedScripts.add(url);
        resolve();
      };
      s.onerror = (e) => reject(new Error(`Failed to load script ${url}`));
      document.body.appendChild(s);
    });
  }

  // Execute inline scripts inside a container safely
  function runInlineScripts(container) {
    // Query for inline scripts that have no src (we already handled external)
    const scripts = Array.from(container.querySelectorAll("script")).filter(s => !s.src);
    for (const inline of scripts) {
      try {
        // Using Function is slightly safer than eval and has its own scope
        const code = inline.textContent || inline.innerText || "";
        if (!code.trim()) continue;
        const fn = new Function(code);
        fn();
      } catch (err) {
        console.error("Error executing inline script:", err);
      }
    }
  }

  // Main loader per dynamic-content div
  (async function processAll() {
    let successCount = 0;
    let failCount = 0;

    for (const contentDiv of contentDivs) {
      const rawHref = (contentDiv.getAttribute("data-href") || "").trim();
      const rawScript = (contentDiv.getAttribute("data-script") || "").trim();

      if (!rawHref) {
        contentDiv.setAttribute("data-load-status", "skipped");
        continue;
      }

      const candidates = buildCandidatesFor(rawHref);
      let loaded = false;
      let usedUrl = null;
      for (const candidate of candidates) {
        try {
          const res = await fetchWithTimeout(candidate);
          if (res.ok) {
            // success: insert content and resolve script relative to candidate
            contentDiv.innerHTML = res.text;
            usedUrl = res.url || candidate;
            // load external script resolved against usedUrl
            const scriptUrl = resolveScriptUrl(rawScript, usedUrl);
            try {
              if (scriptUrl) {
                await loadExternalScriptOnce(scriptUrl);
              }
            } catch (err) {
              console.warn(`External script failed to load for ${usedUrl}:`, err);
              // continue — inline script may still run
            }
            // execute inline scripts (if any)
            runInlineScripts(contentDiv);
            contentDiv.setAttribute("data-load-status", "success");
            loaded = true;
            successCount++;
            console.log(`✅ Loaded ${rawHref} from: ${candidate}`);
            break;
          } else {
            // not ok: try next candidate
            // console.warn(`Not ok: ${candidate} status`);
          }
        } catch (err) {
          // fetchWithTimeout returns ok:false or thrown, we'll ignore and go next
          // console.warn(`Fetch failed for ${candidate}:`, err);
        }
      }

      if (!loaded) {
        // Final fallback: show small friendly error inside the div (instead of console spam)
        contentDiv.innerHTML = `<div style="color:#a00;font-size:14px;padding:16px;">
          Could not load section: <strong>${rawHref}</strong>.
          (Tried multiple paths.)</div>`;
        contentDiv.setAttribute("data-load-status", "failed");
        failCount++;
        console.error(`❌ Failed to load ${rawHref} from all candidate paths.`);
      }
    }

    // Summary
    console.log(`Loader summary: ${successCount} loaded, ${failCount} failed (of ${contentDivs.length}).`);
    // Dispatch an event so other code can react if needed
    document.dispatchEvent(new CustomEvent("dynamic-content-loaded", {
      detail: { successCount, failCount }
    }));
  })();
});





// Function to format input value with commas as thousands separators
function formatInputValue(input) {
  // Remove any non-digit characters from the input value
  var value = parseFloat(input.value.replace(/[^\d.]/g, ''));
  // Format the input value with commas as thousands separators and update the input value
  input.value = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

  

// function showToast(message) {
//   var toast = document.getElementById('toast');
//   var toastBody = document.getElementById('toast-message');
//   var toastTimestamp = document.getElementById('toast-timestamp');
  
//   // Update toast message content
//   toastBody.textContent = message;
  
//   // Update timestamp
//   var timestamp = new Date().toLocaleTimeString();
//   toastTimestamp.textContent = timestamp;
  
//   // Show the toast
//   var bootstrapToast = new bootstrap.Toast(toast);
//   bootstrapToast.show();
// }














const timestamp = new Date().getTime();
const loaderContainer = document.getElementById("loader-container-main-window");
const mainContent = document.getElementById("main-content");

// Step 1: Keep body clean and hidden until ready
document.body.style.visibility = "hidden";

// Step 2: Function to safely hide loader and show content
function hideLoaderSafely() {
  if (loaderContainer) {
    loaderContainer.style.display = "none";
    document.body.style.overflow = "auto";
  }

  if (mainContent) {
    mainContent.style.display = "block";
    mainContent.classList.add("fade-in");
  }

  document.body.style.visibility = "visible";
  console.log("✅ Loader hidden and main content displayed.");
}

// Step 3: Trigger after all resources (JS, images, etc.) are fully loaded
window.addEventListener("load", () => {
  hideLoaderSafely();
});

// Step 4: Failsafe — hide loader after 10s even if load event fails
setTimeout(hideLoaderSafely, 10000);





        // function errorBoxHandler(type, value){
        //   stopErrorHandler();
        //   setTimeout(() => {
        //     errorBoxHandlerbase(type, value);
        //   }, 900)
        // }
        
        
        
        
        // errorbox handi\ling
        
        // // Define the error handler function
        // function errorBoxHandlerbase(type, value) {
        //   const errorBox = document.getElementById("errorbox");
        
        //   // Define state within the errorBox itself
        //   if (!errorBox.dataset.state) {
        //     errorBox.dataset.state = JSON.stringify({ activeType: null, timeoutId: null });
        //   }
        
        //   const state = JSON.parse(errorBox.dataset.state);
        
        //   // Check if Analyze is active and block other types
        //   if (state.activeType === "Analyze" && type !== "Analyze") {
        //     return; // Do not process if Analyze is active
        //   }
        
        //   // Clear existing timeout and reset animations
        //   if (state.timeoutId) {
        //     clearTimeout(state.timeoutId);
        //     state.timeoutId = null;
        //   }
        //   errorBox.style.animation = ""; // Reset animation
        
        //   // Set the new message and style
        //   if (type === "Success") {
        //     errorBox.style.backgroundColor = "#198754"; // Green
        //     errorBox.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 10px;"></i>${value}`;
        //   } else if (type === "Error") {
        //     errorBox.style.backgroundColor = "#dc3545"; // Red
        //     errorBox.innerHTML = `<i class="fas fa-times-circle" style="margin-right: 10px;"></i>${value}`;
        //   } else if (type === "Analyze") {
        //     errorBox.style.backgroundColor = "#ffc107"; // Yellow
        //     errorBox.innerHTML = `<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>${value}`;
        //   }
        
        //   // Show the error box with slide-up animation
        //   errorBox.style.display = "block";
        //   errorBox.style.animation = "slideUp 0.350s ease";
        
        //   state.activeType = type;
        
        //   // Set a timeout for non-Analyze messages
        //   if (type !== "Analyze") {
        //     state.timeoutId = setTimeout(() => {
        //       errorBox.style.animation = "slideDown 0.750s ease";
        //       setTimeout(() => {
        //         errorBox.style.display = "none";
        //         state.activeType = null; // Reset state
        //         errorBox.dataset.state = JSON.stringify(state);
        //       }, 750); // Match animation duration
        //     }, 5000); // Display for 5 seconds
        //   }
        
        //   // Save the updated state
        //   errorBox.dataset.state = JSON.stringify(state);
        // }
        
        // // Function to explicitly stop Analyze messages
        // function stopErrorHandler() {
        //   const errorBox = document.getElementById("errorbox");
        
        //   // Retrieve state
        //   const state = JSON.parse(errorBox.dataset.state || "{}");
        
        //   if (state.activeType === "Analyze") {
        //     // Stop the Analyze message
        //     errorBox.style.animation = "slideDown 1s ease";
        //     setTimeout(() => {
        //       errorBox.style.display = "none";
        //       state.activeType = null; // Reset state
        //       errorBox.dataset.state = JSON.stringify(state);
        //     }, 800); // Match animation duration
        //   }
        // }
        
        // // Function to check the status of the error box every second
        // setInterval(displayHello, 1000);
        
        // function displayHello() {
        //   const errorBox = document.getElementById("errorbox");
        
        //   if (!errorBox) {
        //     // console.log("Error box element not found");
        //     return;
        //   }
        
        //   // Get the computed style of the element
        //   const displayStyle = window.getComputedStyle(errorBox).display;
        
        //   // console.log(`Error box display style: ${displayStyle}`);
        //   return displayStyle;
        // }
        
        



// user verification 
// ----------------------------------------------------------------
// 💡 GLOBAL VARIABLES: Declared outside the function scope 
//    or initialized as part of the window object.
// ----------------------------------------------------------------

const userId = localStorage.getItem('userloginid')
var userID = localStorage.getItem('userloginid')
var userid = localStorage.getItem('userloginid')
console.log(userID, userId, userid)

document.addEventListener('DOMContentLoaded', function () {
    // Hide the page content until authentication is verified
    document.body.style.display = 'none';
    if(!userID) window.location.href = "login.html"

    // Retrieve user details from localStorage
    const userloginname = localStorage.getItem('userName');
    const userloginid = localStorage.getItem('userloginid');
    const userEmail = localStorage.getItem('useremail_we');

    // Session duration in milliseconds (30 minutes here for example)
    const SESSION_DURATION = 30 * 60 * 1000;

    // Validate the presence of essential user data
    if (userloginname && userloginid) {
        // --- Access Granted Logic ---
        console.log("User data found in localStorage. Access granted.");
        
        // 🚀 CRITICAL FIX: Assigning to the global variables
        userID = userloginid;
        userid = userloginid;
        userName = userloginname;
        // Optionally, make them accessible directly via the window object too
        window.globalUserID = userloginid;
        window.globalUserName = userloginname;
        
        console.log(`Global User ID assigned: ${userID}`);

        document.body.style.display = 'block'; // Show content
        updateUserDetails(userName, userID); // Update user details on the page
        startSessionExpirationTimer(); // Start session expiration timer (if needed)

        // Manual logout button event listener
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', function () {
                alert("You have logged out successfully.");
                handleLogout();
            });
        }

    } else {
        // --- Access Denied Logic ---
        alert("Session data not found. Access denied.");
        handleInvalidToken();
    }


    // ----------------------------------------------------------------
    // Helper Functions
    // ----------------------------------------------------------------

    // Function to handle invalid access or expired session
    function handleInvalidToken() {
        // Clear global variables
        userID = null;
        userName = null;
        delete window.globalUserID;
        delete window.globalUserName;
        
        // Clear all user data from localStorage
        localStorage.removeItem('userName'); 
        localStorage.removeItem('userloginid');
        localStorage.removeItem('useremail_we');
        
        // Redirect to login page
        window.location.href = 'login.html'; 
    }

    // Function for manual logout
    function handleLogout() {
        // Clear global variables
        userID = null;
        userName = null;
        delete window.globalUserID;
        delete window.globalUserName;
        
        // Clear all user data from localStorage
        localStorage.removeItem('userName'); 
        localStorage.removeItem('userloginid');
        localStorage.removeItem('useremail_we');
        
        // Redirect to login page
        window.location.href = 'login.html'; 
    }
    

    // Function to update user details on the page
    function updateUserDetails(userloginname, userloginid) {
        // Update elements with class "username"
        document.querySelectorAll(".username").forEach((el) => {
            el.innerHTML = userloginname;
        });

        // Update all input fields with id "userid" or "userId"
        document.querySelectorAll("#userid, #userId").forEach((el) => {
            el.value = userloginid; // Dynamically update the value of the input field
        });

        // Update all elements with class "userId" (for text display)
        document.querySelectorAll(".userId").forEach((el) => {
            el.textContent = userloginid; // Display ID in text elements
        });
    }

    // Function to start session expiration timer
    function startSessionExpirationTimer() {
        setTimeout(() => {
            alert("Session expired. You will be logged out.");
            handleLogout(); // Logout the user after session expires
        }, SESSION_DURATION); // Expire after the set session duration
    }
});



document.getElementById('logoutButton').addEventListener('click', function () {
  alert("You have logged out successfully.");
  handleLogout();
});

function handleLogout() {
  // alert('Logging out...');
  sessionStorage.clear(); // Clear all session storage
  window.location.href = 'login.html'; // Redirect to login page
}

function setuser(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  const elements = document.getElementsByClassName('userprofile_name');
  if (elements.length > 0) {
    elements[0].textContent = firstLetter;
  }
}


function UserProfile() {
  var form = document.getElementsByClassName('userprofile_full-window')[0]; // Get the first match
  if (form) {
    form.style.display = "block";
    openCustomModal(form);
  } else {
    console.error("Element with class 'userprofile_full-window' not found.");
  }
}













let inactivityTimer;
let remainingTime = 60; // Set idle timeout (in seconds)
let confirmDialogTriggered = false; // To prevent multiple confirm dialog triggers
let confirmTimeout;



// Function to log the user out and redirect to login page
function autoLogout() {
  // Perform the logout actions without waiting for alert
  sessionStorage.removeItem('userToken'); // Remove session token
  window.location.href = 'login.html'; // Redirect to login page immediately

  // Optionally, log the action
  console.log("User has been logged out due to inactivity.");
}


// Function to show the confirm dialog and update remaining time in the console



document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  document.querySelectorAll('input[type="date"]').forEach(input => {
      if (!input.value) input.value = today; // only set if empty
  });
});

// Global variable to track active timeout
// Declare once, globally
var currentNotificationTimeout = null;
var notificationType = null;

async function errorNotificationHandler(type, text, autoHideDuration = 5000) {
    notificationType = type; // just assign, don’t redeclare

    const box = document.getElementById("errorNotificationBox");

    if (!box) {
        console.warn("Notification box not found in DOM");
        return;
    }

    // Clear timeout
    if (currentNotificationTimeout) {
        clearTimeout(currentNotificationTimeout);
        currentNotificationTimeout = null;
    }

    // Reset styles
    box.classList.remove("success", "fail", "error");
    box.style.backgroundColor = "";
    box.className = box.className.replace(/\bslide-\w+/g, '').trim();
    box.style.transform = '';
    box.style.opacity = '';

    // Icon + type
    let iconHTML = "";
    switch (type.toLowerCase()) {
        case "success":
            iconHTML = '<i class="fas fa-check-circle"></i> ';
            box.classList.add("success");
            box.style.color = "#f2f2f2";
            break;
        case "fail":
        case "error":
            iconHTML = '<i class="fas fa-exclamation-circle"></i> ';
            box.classList.add("error");
            box.style.color = "#f2f2f2";
            break;
        case "info":
            iconHTML = '<i class="fas fa-spinner fa-spin"></i> ';
            box.style.backgroundColor = "#333";
            box.style.color = "#f2f2f2";
            break;
        case "saving":
            iconHTML = '<i class="fas fa-spinner fa-spin"></i> ';
            box.style.backgroundColor = "#d7ff35ff";
            box.style.color = "#282828ff";
            break;
        default:
            iconHTML = '<i class="fas fa-info-circle"></i> ';
            box.style.backgroundColor = "#333";
            box.style.color = "#f2f2f2";

            break;
    }

    // Content
    box.innerHTML = `${iconHTML}<span>${text}</span>`;
    box.style.display = 'flex';

    // Slide up
    box.classList.add('slide-up');
    setTimeout(() => box.classList.remove('slide-up'), 350);

    // Auto-hide
    if (autoHideDuration > 0) {
        currentNotificationTimeout = setTimeout(() => {
            box.classList.add('slide-down');
            setTimeout(() => {
                box.style.display = 'none';
                box.classList.remove('slide-down');
                box.textContent = "";
            }, 750);
        }, autoHideDuration);
    }
}




function hideNotification() {
    const box = document.getElementById("errorNotificationBox");

    if (!box) {
        console.warn("Notification box not found in DOM");
        return;
    }

    // Optional: Only hide certain types
    if (notificationType !== "success" && notificationType !== "error") {
        return;
    }

    if (currentNotificationTimeout) {
        clearTimeout(currentNotificationTimeout);
        currentNotificationTimeout = null;
    }

    box.classList.add('slide-down');

    setTimeout(() => {
        box.style.display = 'none';
        box.classList.remove('slide-down');
        box.textContent = "";
    }, 750);
}






function showBrowserNotification(title, message, iconUrl = "") {
  // Check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
    return;
  }

  // Ask for permission if not granted
  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        showNotification(title, message, iconUrl);
      }
    });
  } else if (Notification.permission === "granted") {
    showNotification(title, message, iconUrl);
  } else {
    console.warn("Notifications are blocked by the user.");
  }

  function showNotification(title, message, icon) {
    const notification = new Notification(title, {
      body: message,
      icon: icon || "https://cdn-icons-png.flaticon.com/512/1827/1827392.png" // fallback icon
    });

    // Optional: Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Optional: Add click handler
    notification.onclick = () => {
      window.focus(); // bring the tab to focus
    };
  }
}



function beautifyTitle(formId) {
  return formId
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

let customModalStatus = "close"

function openCustomModal(content) {
  let customModalStatus = "open"
  const modal = document.getElementById('customModalOverlay');
  const container = document.getElementById('uniquemultimodal');
  const footer = document.getElementById('uniquemodalfooter');
  const headerTitle = document.querySelector('.customModalTitle');

  installHighPriorityEsc(customModalStatus) ;
  // Show modal
  modal.style.display = 'flex';

  // Clear old content
  container.innerHTML = '';
  footer.innerHTML = '';

  let form;

  if (typeof content === 'string') {
    container.innerHTML = content.trim();
    form = container.querySelector('form');
  } else if (content instanceof HTMLElement) {
    const cloned = content.cloneNode(true);
    container.appendChild(cloned);
    form = cloned.tagName.toLowerCase() === "form" ? cloned : cloned.querySelector("form");
  }

  if (form) {
    const formId = form.id || 'Form';
    console.log("[DEBUG] Opened Modal with Form:", formId);

    if (headerTitle) {
      headerTitle.innerHTML = beautifyTitle(formId);
    }
  } else if (headerTitle) {
    headerTitle.innerHTML = "Information";
  }
  return customModalStatus
}



function installHighPriorityEsc(customModalStatus) {
  // handler: function to call when Esc pressed
  const escListener = function (e) {
    // Normalize check for Escape key
    const key = e.key || e.keyIdentifier || e.keyCode;
    const isEsc = key === 'Escape' || key === 'Esc' || key === 'Escape' || key === 27;

    if (!isEsc) return;
    if(customModalStatus !== "open") return;

    // Prevent default behaviour and stop other handlers
    try { e.preventDefault(); } catch (err) { /* noop */ }
    try { e.stopImmediatePropagation(); } catch (err) { /* noop */ }
    try { e.stopPropagation(); } catch (err) { /* noop */ }

    // Call the user-provided handler
    closeCustomModal()
  };

  // Add as capturing listener (so it runs early) and not passive (so preventDefault is allowed)
  document.addEventListener('keydown', escListener, { capture: true, passive: false });

  // Return uninstall function
  return function uninstall() {
    document.removeEventListener('keydown', escListener, { capture: true });
  };
}





function closeCustomModal() {
  document.getElementById('customModalOverlay').style.display = 'none';
  let customModalStatus = "close"

}

// Keyboard handler Not Working check
// document.addEventListener('keydown', function (e) {
//   if (e.altKey && e.key.toLowerCase() === 'a') {
//     e.preventDefault();
//     const form = document.getElementById('LedgerCreation');
//     if (form) openCustomModal(form);
//   }

//   if (e.altKey && e.key.toLowerCase() === 's') {
//     e.preventDefault();
//     const form = document.getElementById('Stock');
//     if (form) openCustomModal(form);
//   }
//   if (e.altKey && e.key.toLowerCase() === 'l') {
//     e.preventDefault();
//     const form = document.getElementById('companyForm');
//     if (form) openCustomModal(form);
//   }
//   if (e.key === 'F3') {
//     e.preventDefault();
//     const form = document.getElementById('Chat_Form');
//     if (form) openCustomModal(form);
//   }
//   lastsec = localStorage.getItem("PreviousID")
//   console.log(lastsec)

  
// });



 const toggle = document.getElementById('darkModeToggle');
  const body = document.body;

  // Initialize from localStorage
  if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'disabled');
    }
  });




/**
 * Opens the Bootstrap Offcanvas with the ID "demo".
 * This simulates a user clicking the button that triggers the offcanvas.
 */
function openDemoOffcanvas() {
    // 1. Get the HTML element by its ID.
    const offcanvasElement = document.getElementById('demo');

    // 2. Check if the element exists.
    if (offcanvasElement) {
        // 3. Create a new Bootstrap Offcanvas instance.
        // If the offcanvas has already been initialized (e.g., by Bootstrap's data attributes), 
        // you can retrieve the existing instance using bootstrap.Offcanvas.getInstance(offcanvasElement)
        const demoOffcanvas = new bootstrap.Offcanvas(offcanvasElement);

        // 4. Call the 'show' method to open the offcanvas.
        demoOffcanvas.show();
        
        console.log('Offcanvas "demo" is now opening.');
        
        // Optional: Add a listener to confirm it's fully visible
        offcanvasElement.addEventListener('shown.bs.offcanvas', () => {
            console.log('Offcanvas "demo" is visible.');
        }, { once: true });
        
    } else {
        console.error('Error: Offcanvas element with ID "demo" not found.');
    }
}







/**
 * Opens the custom bottom offcanvas.
*/
function openCustomOffcanvas(headercs, htmlcs) {
  const offcanvasElement = document.getElementById("uc-custom-offcanvas-bottom");
  const headerElement = document.querySelector('.uc-offcanvas-title');
  const bodyElement = document.querySelector('.uc-offcanvas-body');
  const OPEN_CLASS = 'uc-bottom-drawer-open';

  if (offcanvasElement) {
    // Add open class to show offcanvas
    offcanvasElement.classList.add(OPEN_CLASS);
    console.log('Custom Offcanvas is open.');

    // Update header and body content
    if (headerElement) headerElement.innerHTML = headercs;
    if (bodyElement) bodyElement.innerHTML = htmlcs;

    return "open";
  } else {
    console.error('Offcanvas element not found!');
    return "error";
  }
}

        
        /**
         * Closes the custom bottom offcanvas.
         */
        function closeCustomOffcanvas() {
          const offcanvasElement = document.getElementById("uc-custom-offcanvas-bottom");
                  const OPEN_CLASS = 'uc-bottom-drawer-open';

            if (offcanvasElement) {
                offcanvasElement.classList.remove(OPEN_CLASS);
                console.log('Custom Offcanvas is closed.');
            }
        }
        
        // --- Event Listeners for Control ---
        document.addEventListener('DOMContentLoaded', () => {
            const openButton = document.getElementById('uc-js-open-drawer-btn');
            const closeButton = document.getElementById('uc-js-close-drawer-btn');
            
            if (openButton) {
                openButton.addEventListener('click', openCustomOffcanvas);
            }
            if (closeButton) {
                closeButton.addEventListener('click', closeCustomOffcanvas);
            }
        });

  // end of offcanvas code



  // Section id shortcut categorization.














// showBrowserNotification("Reminder", "CA exam study time!", "/icons/reminder.png");







