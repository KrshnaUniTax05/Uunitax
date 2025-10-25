// $(document).ready(function(){
//     $.getJSON('https://script.google.com/macros/s/AKfycbztY-JnPf-wRVvb945J56UTrIe5wHiTwH_mggRUAx6rJMhFZ0p02YahtZlGujNldJYV/exec',
// function(data){
//     var table =""
//     var rows =""
//     var columns ="";
//     $.each(data, function(key,value){
//         columns = "";
//         $.each(value, function(key1, value1){
//             columns = columns+'<td>'+value1+'</td>';
//         });
//         rows = rows + '<tr>'+columns+'</tr>';
//     });
//     $("#table-fbl3n").append(rows);
// })
// })
// let userId = 20130059976;

// Function to fetch data and populate datalist
// Function to fetch data, filter by userId, and populate datalist
// function fetchDataAndPopulateDatalistAndTable(userId) {
//     // Show loader for datalist
//     const datalist = document.getElementById('fbl3n-option');
//     datalist.innerHTML = '<option>Loading...</option>';

//     // Show loader for table
//     const table = document.querySelector('#table-fbl3n tbody');
//     table.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

//     // Fetch data from your Google Apps Script URL
//     fetch('https://script.google.com/macros/s/AKfycbylwFgnfuwK299WJ2rtmqAjXf1r41jtBzG1OR8TGZfgkilJFvmuuobAZi4AqlunPwxf/exec')
//         .then(response => response.json())
//         .then(data => {
//             // Clear existing options in datalist
//             datalist.innerHTML = '';

//             // Filter data by userId
//             const filteredData = data.filter(row => row[0] === userId);

//             // Check if data exists for the given user ID
//             if (filteredData.length > 0) {
//                 // Populate datalist with unique GL values
//                 const uniqueGLs = [...new Set(filteredData.map(row => row[1]))];
//                 uniqueGLs.forEach(gl => {
//                     const option = document.createElement('option');
//                     option.value = gl;
//                     option.textContent = gl;
//                     datalist.appendChild(option);
//                 });

//                 // Populate table with filtered data
//                 filteredData.forEach(row => {
//                     const tr = document.createElement('tr');
//                     row.forEach(cellData => {
//                         const td = document.createElement('td');
//                         td.textContent = cellData;
//                         tr.appendChild(td);
//                     });
//                     table.appendChild(tr);
//                 });
//             } else {
//                 // If no data found, display a message in both datalist and table
//                 datalist.innerHTML = '<option>No data available</option>';
//                 table.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
//             }
//         })
//         .catch(error => console.error('Error fetching data:', error));
// }
// fetchDataAndPopulateDatalistAndTable(userId);
hideLoader()

// function fetchDataAndPopulateDatalist() {
//     // Get reference to the datalist
//     const datalist = document.getElementById('fbl3n-option');
//     // Get reference to the input field
//     const inputField = document.getElementById('fbl3n-gls');

//     // Clear existing options
//     datalist.innerHTML = '';

//     // Add loading class to input field
//     inputField.setAttribute('placeholder', 'Loading...');

//     // Fetch data from the Google Apps Script URL
//     fetch(`https://script.google.com/macros/s/AKfycbz2-EOm_r1BW-lBnfCCqQbO-L5MTiPwwjBWmqp00NgefX7uz4wFXWnjHiUmQUlIDRKG/exec?userId=${userId}`)
//         .then(response => response.json())
//         .then(data => {
//             // Remove loading class from input field
//             inputField.removeAttribute('placeholder');

//             // Get the "gls" array from the data
//             const glsArray = data.gls;

//             // Filter glsArray by userId
//             const filteredGLs = glsArray.filter(row => row[0] === userId); // Assuming userId is in the first column

//             // Create a unique set of GLs
//             const uniqueGLs = new Set();
//             filteredGLs.forEach(row => uniqueGLs.add(row[1])); // Assuming GLs are in the second column

//             // Add options to the datalist
//             uniqueGLs.forEach(gl => {
//                 const option = document.createElement('option');
//                 option.value = gl; // Set the value attribute to GL
//                 option.textContent = gl; // Set the text content to GL
//                 datalist.appendChild(option);
//             });
//         })
//         .catch(error => {
//             // Remove loading class from input field
//             inputField.removeAttribute('placeholder');
//             console.error('Error fetching data:', error);
//         });
// }

// fetchDataAndPopulateDatalist();


function tableshow(userId) {
    clearTableData('table-fbl3n'); 
    // Get reference to the input field and trim whitespace
    let loader = document.getElementById('fbl3n-loader')
    const inputField = document.getElementById('fbl3n-gls').value.trim();
    console.log('Input field value:', inputField);

    let loadertext = document.getElementById('fbl3n-sub')
    loader.style.display = 'block'
    loadertext.innerHTML = 'Loading...'

    // Get reference to the table body
    const tableBody = document.getElementById('table-fbl3n');

    // Clear existing table rows
    // tableBody.innerHTML = '';

    // Fetch data from the Google Apps Script URL
    fetch(`https://script.google.com/macros/s/AKfycbz2-EOm_r1BW-lBnfCCqQbO-L5MTiPwwjBWmqp00NgefX7uz4wFXWnjHiUmQUlIDRKG/exec?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            // Check if data contains any transactions
            if (!data.transactions || data.transactions.length === 0) {
                // Show a message indicating no transactions found
                console.log('No transactions found for the specified user.');
                return;
            }

            // Filter transactions by userId and GL code
            const filteredTransactions = data.transactions.filter(row => {
                // Extract userId and GL code from the row
                const rowUserId = row[0].toString().trim(); // Convert to string and trim whitespace
                const rowGlCode = row[1].toString().trim(); // Convert to string and trim whitespace
                
                // Check if either userId or GL code matches
                return rowUserId === userId || rowGlCode === inputField;
            });
            loader.style.display = 'none'
            loadertext.innerHTML = 'Go'
            // Check if any transactions are found
            if (filteredTransactions.length === 0) {
                // Show a message indicating no transactions found
                console.log('No transactions found for the specified user and GL code.');
                return;
            }

            // Populate table with filtered transactions
            filteredTransactions.forEach(transaction => {
                // Create a row for the transaction
                const tr = document.createElement('tr');

                // Create cells for the initial columns
                const initialColumns = [2, 3, 4, 5, 9]; // Adjust column indices as needed
                initialColumns.forEach(index => {
                    const td = document.createElement('td');
                    if (index === 4 || index === 5) {
                        // Format date (assuming it's in UTC format)
                        const date = new Date(transaction[index]);
                        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        td.textContent = formattedDate;
                    } else {
                        let content = transaction[index];
                        if (index === 2) {
                            content = content.toString().toUpperCase(); // Capitalize content at index 2
                        }
                        if (index === 9 ) {
                            content = parseFloat(content).toFixed(2); // Format content at index 3 as amount with two decimal places
                            content = formatIndianNumber(content); // Format number in Indian style
                            td.style.textAlign = 'right';
                        }
                        
                        td.textContent = content;
                    }
                    tr.appendChild(td);
                });

                // Create a cell for the unreconciled badge
                const badgeCell = document.createElement('td');
                const badge = document.createElement('span');
                badge.textContent = 'Unreconciled';
                badge.classList.add('badge', 'bg-danger');
                badge.style.color = "#fff" ;
                badgeCell.appendChild(badge);
                tr.appendChild(badgeCell);

                // Append the row to the table body
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}


function hideLoader(){
  
    var loader = document.getElementById("fbl3n-loader");
    //   console.log("clicked");
    loader.style.display = 'none';
    }


    function clearTableData(tableId) {
        const table = document.getElementById(tableId);
        const rows = table.getElementsByTagName('tr');
        
        // Starting from 1 to skip the header row
        while (rows.length > 1) {
            table.deleteRow(1);
        }
        fetchDataAndPopulateDatalist() 
        // tableshow();    
        
        
    }
    



    document.getElementById('exportBtn').addEventListener('click', () => {
        // Get the table element
        const table = document.getElementById('table-fbl3n');
        // Create an empty CSV string
        let csvContent = '';
    
        // Loop through each row of the table
        table.querySelectorAll('tr').forEach(row => {
            // Loop through each cell in the row
            row.querySelectorAll('td').forEach((cell, index) => {
                // Add the cell's text content to the CSV string
                // Add quotes around the content to ensure proper CSV formatting
                csvContent += '"' + cell.textContent.replace(/"/g, '""') + '"';
    
                // Add a comma if it's not the last cell in the row
                if (index < row.cells.length - 1) {
                    csvContent += ',';
                }
            });
            // Add a new line character after each row
            csvContent += '\n';
        });
    
        // Create a Blob containing the CSV data
        const blob = new Blob([csvContent], { type: 'text/csv' });
    
        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = formatDateForFilename();
    
        // Trigger the download by clicking the link
        link.click();
    });
    


function formatIndianNumber(number) {
    const [integerPart, decimalPart] = number.split('.');
    let lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedNumber = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? ',' : '') + lastThree;
    return formattedNumber + '.' + decimalPart;
}


function formatDateForFilename() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');

    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${formattedHours}-${minutes} ${ampm}`;

    return `${formattedDate} ${formattedTime}`;
}

// When the user scrolls the page, execute myFunction
window.onscroll = function() {
    myFunction();
};

// Get the header element
var header = document.querySelector('thead');

// Get the offset position of the header
var sticky = header.offsetTop;

// Add the sticky class to the header when it reaches its scroll position.
// Remove the "sticky" class when you leave the scroll position.
function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}
