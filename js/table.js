//initial all users data
let all_meals = [];  
let selectedFoodId = null;
let currentEditingIndex = null;
let currentUserId = null;

//send get request to db and return all users data
function getData() {
    fetch('./backend/getmeal.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('请求失败');
        }
        return response.json();
    })
    .then(data => {
        if (Array.isArray(data) && data.length > 0) {
            all_meals = data;
            loadTable(all_meals);
        } else {
            all_meals = [];
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 20px;">
                        暂无餐食记录，点击 "Add New Meal" 添加新的餐食
                    </td>
                </tr>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// print all data in table
function loadTable(meals) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; 

    meals.forEach((meal, index) => {
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
    fetch('./backend/getmeal.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search: query
        })
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data) && data.length > 0) {
            all_meals = data;
            loadTable(all_meals);
        } else {
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 20px;">
                        can not find
                    </td>
                </tr>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('fail');
    });
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
                           <button onclick="cancelEdit(${index}, event)">Cancel</button>`;

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
                dropdown.remove();
            }

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
            food_id_old: meal.ID_FOOD
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
        meal.FOOD_NAME = foodName;
        meal.QUANTITY_EAT = quantityEat;
        meal.DATE_MEAL = mealTime;
        loadTable(all_meals);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('更新失败');
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
        if (all_meals.length === 0) {
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 20px;">
                        暂无餐食记录，点击 "Add New Meal" 添加新的餐食
                    </td>
                </tr>
            `;
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('删除���败');
    });
}

function cancelEdit(index, event) {
    event.stopPropagation();
    const row = document.querySelector(`#action-row-${index}`).previousElementSibling;
    const dateCell = row.querySelector('td:nth-child(1)');
    const foodCell = row.querySelector('td:nth-child(2)');
    const quantityCell = row.querySelector('td:nth-child(3)');
    
    dateCell.textContent = row.dataset.originalDate;
    foodCell.textContent = row.dataset.originalFood;
    quantityCell.textContent = row.dataset.originalQuantity;

    const actionCell = document.querySelector(`#action-row-${index} td`);
    actionCell.innerHTML = `<button onclick="editMeal(${index}, event)">Modify</button>
                           <button onclick="deleteMeal(${index}, event)">Delete</button>`;

    const dropdown = document.getElementById(`dropdown-${index}`);
    if (dropdown) {
        dropdown.remove();
    }
}