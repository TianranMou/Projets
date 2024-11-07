window.onload = function() {
    loadGroups();
};

let addedItems = [];
let currentPage = 1;
let foodItems = [];
let pageSize = 10;

// 
function loadGroups() {
    fetch('../backend/group.php')
        .then(response => response.json())
        .then(data => {
            const foodGroupSelect = document.getElementById("foodGroup");
            foodGroupSelect.innerHTML = '<option value="">choisir</option>';
            data.forEach(group => {
                const option = document.createElement("option");
                option.value = group.ID_GROUP;
                option.textContent = group.NAME_GROUP;
                foodGroupSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching food Groups:', error));
}

// 
function loadSubGroup() {
    const groupId = document.getElementById("foodGroup").value;
    if (!groupId) return;

    fetch(`../backend/group.php?groupId=${groupId}`)
        .then(response => response.json())
        .then(data => {
            const foodSubGroupSelect = document.getElementById("foodSubGroup");
            foodSubGroupSelect.innerHTML = '<option value="">choisir</option>';
            data.forEach(subGroup => {
                const option = document.createElement("option");
                option.value = subGroup.ID_SUBGROUP;
                option.textContent = subGroup.Name_Subgroup;
                foodSubGroupSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching food subGroups:', error));
}

// 
function loadSubSubGroup() {
    const subGroupId = document.getElementById("foodSubGroup").value;
    if (!subGroupId) return;

    fetch(`../backend/group.php?subGroupId=${subGroupId}`)
        .then(response => response.json())
        .then(data => {
            const foodSubSubGroupSelect = document.getElementById("foodSubSubGroup");
            foodSubSubGroupSelect.innerHTML = '<option value="">choisir</option>';
            data.forEach(subSubGroup => {
                const option = document.createElement("option");
                option.value = subSubGroup.ID_SUBSUBGROUP;
                option.textContent = subSubGroup.Name_Subsubgroup;
                foodSubSubGroupSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching food sub-subGroups:', error));
}

// 
function loadFoodItems() {
    const subSubGroupId = document.getElementById("foodSubSubGroup").value;
    if (!subSubGroupId) return;

    fetch(`../backend/group.php?subSubGroupId=${subSubGroupId}`)
    .then(response => response.json())
    .then(data => {
        foodItems = data;
        currentPage = 1;
        loadTable();
        updatePaginationButtons();
    })
    .catch(error => console.error('Error fetching food items:', error));
}

function loadTable() {
    const tableBody = document.getElementById('foodItemsTableBody');
    tableBody.innerHTML = ''; 

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = foodItems.slice(start, end);

    paginatedItems.forEach(item => {
        let newRow = `<tr>
            <td>${item.FOOD_NAME}</td>
            <td>
                <input type="number" min="1" value="1" style="width: 60px;" id="quantity-${item.ID_FOOD}">
                <button onclick="addItemDirectly(${item.ID_FOOD}, '${item.FOOD_NAME}')">+</button>
            </td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', newRow);
    });
}

function changePage(direction) {
    currentPage += direction;
    loadTable();
    updatePaginationButtons();
}


function updatePaginationButtons() {
    const totalPages = Math.ceil(foodItems.length / pageSize);
    document.getElementById('prevPageBtn').disabled = (currentPage === 1);
    document.getElementById('nextPageBtn').disabled = (currentPage === totalPages);
    document.getElementById('currentPageLabel').innerText = ` ${currentPage} `;
}

function addItemDirectly(id, name) {
    const quantityInput = document.getElementById(`quantity-${id}`);
    const quantity = parseInt(quantityInput.value);
    
    if (quantity && !isNaN(quantity) && quantity > 0) {
        addItem(id, name, quantity);
        quantityInput.value = 1; 
    } else {
        alert("Veuillez entrer une quantité valide");
    }
}

// 
function addItem(id, name,quantity) {
        addedItems.push({ id, name, quantity}); 
        renderAddedItems(); 
        alert("Ajouter avec succès");
}

//
function renderAddedItems() {
    const addedTableBody = document.getElementById('addedItemsTableBody');
    addedTableBody.innerHTML = ''; 

    addedItems.forEach((item,index) => {
        let newRow = `<tr id="item-row-${index}">
            <td>${item.name}</td>
            <td class="quantity-cell">${item.quantity}</td>
             <td>
                <button onclick="deleteItem(${index})">Supprimer</button>
                <button class="edit-button" onclick="editItem(${index})">Modifier</button>
            </td>
        </tr>`;
        addedTableBody.insertAdjacentHTML('beforeend', newRow);
    });
}

function deleteItem(index) {
    addedItems.splice(index, 1); 
    renderAddedItems(); 
}

function editItem(index) {
    const itemRow = document.getElementById(`item-row-${index}`);
    const quantityCell = itemRow.querySelector('.quantity-cell');
    const editButton = itemRow.querySelector('.edit-button');

    quantityCell.innerHTML = `<input type="number" value="${addedItems[index].quantity}" min="1" id="edit-quantity-${index}">`;
    editButton.textContent = 'Enregistrer';
    editButton.onclick = function() {
        saveItem(index); 
    };
}

function saveItem(index) {
    const newQuantity = document.getElementById(`edit-quantity-${index}`).value;

    if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
        addedItems[index].quantity = parseInt(newQuantity); 
        renderAddedItems(); 
    } else {
        alert("Entrez la quantité");
    }
}

function searchFood() {
    const foodName = document.getElementById("foodSearchInput").value.trim();
    if (!foodName) {
        alert("entrez le nom");
        return;
    }

    fetch(`../backend/group.php?search=${encodeURIComponent(foodName)}`)
        .then(response => response.json())
        .then(data => {
            foodItems = data;
            currentPage = 1;
            loadTable();
            updatePaginationButtons();
            }
        )
        .catch(error => console.error('Error fetching search results:', error));
}

function submitSelectedItems() {

    const mealTimeInput = document.getElementById("mealTime").value;
    const formattedMealTime = formatMealTime(mealTimeInput);
    if (!mealTimeInput) {
        alert("Quand vous mangez ?");
        return;
    }
    const payload = {
        user_id: 2,
        meal_time: formattedMealTime,
        items: addedItems.map(item => ({
            food_id: item.id,
            quantity_eat: item.quantity
        }))
    };

    fetch('../backend/meal.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("succès");
            addedItems = []; 
            renderAddedItems(); 
            document.getElementById("mealTime").value = ''; 
        } else {
            alert("échoué, réessayez");
        }
    })
    .catch(error => console.error("Error submitting selected items:", error));
}

function formatMealTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = '00'; 

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
