//initial all users data
let all_meals = [];   

//send get request to db and return all users data
function getData() {

    const requestBody ={
        user_id : 2
    };
    fetch('./backend/getmeal.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            if (data !== "") {
                all_meals = data;
                loadTable(all_meals);
            } else {
                alert("Error from API " + data.message);
            }
        })
        .catch(error => {
            console.error('Error', error)
            alert('Failed to get data.');
        });
}

// print all data in table
function loadTable(meals) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; 

    meals.forEach((meal,index) => {
        let newRow = `<tr class="data-row" onclick="toggleActionRow(${index})">
            <td>${meal.DATE_MEAL}</td>
            <td>${meal.FOOD_NAME}</td>
            <td>${meal.QUANTITY_EAT}</td>
        </tr>

        <tr id="action-row-${index}" class="action-row" style="display: none;">
            <td colspan="3">
                <button onclick="editMeal(${index}, event)">Modify</button>
                <button onclick="deleteMeal(${index}, event)">Delete</button>
            </td>
        </tr>`
        tableBody.insertAdjacentHTML('beforeend', newRow);
    });
}

// Initialize table when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    getData();

    document.getElementById('searchButton').addEventListener('click', function() {
        let searchQuery = document.getElementById('searchField').value.trim();
        searchMeals(searchQuery);
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.data-row') && !event.target.closest('.action-row')) {
            document.querySelectorAll('.action-row').forEach(row => {
                row.style.display = 'none';
            });
        }
    });


});


function searchMeals(query) {
    const filteredMeals = all_meals.filter(meal => {
        return meal.DATE_MEAL.includes(query) || meal.FOOD_NAME.includes(query);
    });

    loadTable(filteredMeals); 
}

function toggleActionRow(index) {
    // Hide all action rows first
    document.querySelectorAll('.action-row').forEach(row => {
        row.style.display = 'none';
    });
    
    // Show the clicked row's action row
    const actionRow = document.getElementById(`action-row-${index}`);
    actionRow.style.display = '';
}

// Navigate to add page
function goToAddPage() {
    window.location.href = 'add.html';
}