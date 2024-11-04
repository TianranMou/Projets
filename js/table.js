//initial all users data
let all_meals = [];  

let selectedFoodId= null;

let currentEditingIndex = null;

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


function editMeal(index, event) {
    event.stopPropagation();

    const meal = all_meals[index];
    const row = document.querySelector(`#action-row-${index}`).previousElementSibling; 
    const dateCell = row.querySelector('td:nth-child(1)'); 
    const foodCell = row.querySelector('td:nth-child(2)'); 
    const quantityCell = row.querySelector('td:nth-child(3)'); 

    row.dataset.originalDate = dateCell.textContent;
    row.dataset.originalFood = foodCell.textContent;
    row.dataset.originalQuantity = quantityCell.textContent;

    
    dateCell.innerHTML = `<input type="text" id="edit-date-${index}" value="${meal.DATE_MEAL}">`;
    foodCell.innerHTML = `<input type="text" id="edit-input-${index}" value="${meal.FOOD_NAME}" placeholder="enter...">`;
    quantityCell.innerHTML = `<input type="number" id="edit-quantity-${index}" value="${meal.QUANTITY_EAT}" min="1">`;

    const input = document.getElementById(`edit-input-${index}`);
    const quantityInput = document.getElementById(`edit-quantity-${index}`);
    const dateInput = document.getElementById(`edit-date-${index}`);
    
    selectedFoodId = meal.ID_FOOD;


    const dropdown = document.createElement('ul');
    dropdown.id = `dropdown-${index}`;
    dropdown.style.position = 'absolute';
    dropdown.style.border = '1px solid #ccc';
    dropdown.style.backgroundColor = 'white';
    dropdown.style.listStyleType = 'none';
    dropdown.style.padding = '5px';
    dropdown.style.margin = '0';
    dropdown.style.width = `${input.offsetWidth}px`;
    dropdown.style.maxHeight = '150px';
    dropdown.style.overflowY = 'auto';

    foodCell.style.position = 'relative';
    dropdown.style.top = `${input.offsetHeight}px`;
    foodCell.appendChild(dropdown);

    input.addEventListener('input', function () {
        const query = input.value.trim();
        if (query.length > 0) {
            fetch(`./backend/group.php?search=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    dropdown.innerHTML = '';
                    data.forEach(food => {
                        const item = document.createElement('li');
                        item.textContent = food.FOOD_NAME;
                        item.style.cursor = 'pointer';
                        item.style.padding = '5px';
                        item.style.borderBottom = '1px solid #ddd';
                        item.addEventListener('click', () => {
                            input.value = food.FOOD_NAME;
                            selectedFoodId = food.ID_FOOD;
                            dropdown.innerHTML = '';
                        });
                        dropdown.appendChild(item);
                    });
                })
                .catch(error => console.error('Error fetching food data:', error));
        } else {
            dropdown.innerHTML = '';
        }
    });

    const actionCell = document.querySelector(`#action-row-${index} td`);
    actionCell.innerHTML = `<button onclick="saveMeal(${index}, event)">Save</button>
                           <button onclick="deleteMeal(${index}, event)">Delete</button>`;

    function handleClickOutside(e) {
    const editRow = row;
    const actionRow = document.querySelector(`#action-row-${index}`);
    const dropdown = document.getElementById(`dropdown-${index}`);
                            
                        
        if (!editRow.contains(e.target) && !actionRow.contains(e.target) && 
        (!dropdown || !dropdown.contains(e.target))) {
                                
    
        dateCell.textContent = row.dataset.originalDate;
        foodCell.textContent = row.dataset.originalFood;
        quantityCell.textContent = row.dataset.originalQuantity;
                                

        actionCell.innerHTML = `<button onclick="editMeal(${index}, event)">Modify</button>
                                <button onclick="deleteMeal(${index}, event)">Delete</button>`;
                                

        if (dropdown) {
            dropdown.remove();}
                                

        document.removeEventListener('click', handleClickOutside);
        }
    }
                        
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        }, 0);                       
}


function saveMeal(index) {

    const meal = all_meals[index];
    const foodName = document.getElementById(`edit-input-${index}`).value;
    const quantityEat = document.getElementById(`edit-quantity-${index}`).value;
    const mealTime = document.getElementById(`edit-date-${index}`).value;

    
    meal.FOOD_NAME = foodName;
    meal.QUANTITY_EAT = quantityEat;
    meal.DATE_MEAL = mealTime;

    
    const row = document.querySelector(`#action-row-${index}`).previousElementSibling;
    row.querySelector('td:nth-child(1)').textContent = mealTime;
    row.querySelector('td:nth-child(2)').textContent = foodName;
    row.querySelector('td:nth-child(3)').textContent = quantityEat;

    fetch('./backend/meal.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            meal_id: meal.ID_MEAL,
            meal_time: mealTime, 
            food_id: selectedFoodId,
            quantity_eat: quantityEat,
            food_id_old : meal.ID_FOOD
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Update successful:', data);
        meal.ID_FOOD = selectedFoodId;
        const actionCell = document.querySelector(`#action-row-${index} td`);
        actionCell.innerHTML = `<button onclick="editMeal(${index}, event)">Modify</button>
                               <button onclick="deleteMeal(${index}, event)">Delete</button>`;
        loadTable(all_meals); 
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}



function deleteMeal(index) {

    const meal = all_meals[index]; 
    const mealId = meal.ID_MEAL; 
    const foodId = meal.ID_FOOD; 

    fetch('./backend/meal.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            meal_id: mealId,
            food_id: foodId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Delete successful:', data);
        all_meals.splice(index, 1);
        loadTable(all_meals); 
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}