window.onload = function() {
    loadGroups();
};

let addedItems = [];
let currentPage = 1;
let foodItems = [];
let pageSize = 10;

// 
function loadGroups() {
    fetch('./backend/group.php')
        .then(response => response.json())
        .then(data => {
            const foodGroupSelect = document.getElementById("foodGroup");
            foodGroupSelect.innerHTML = '<option value="">choose</option>';
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

    fetch(`./backend/group.php?groupId=${groupId}`)
        .then(response => response.json())
        .then(data => {
            const foodSubGroupSelect = document.getElementById("foodSubGroup");
            foodSubGroupSelect.innerHTML = '<option value="">choose</option>';
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

    fetch(`./backend/group.php?subGroupId=${subGroupId}`)
        .then(response => response.json())
        .then(data => {
            const foodSubSubGroupSelect = document.getElementById("foodSubSubGroup");
            foodSubSubGroupSelect.innerHTML = '<option value="">choose</option>';
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

    fetch(`./backend/group.php?subSubGroupId=${subSubGroupId}`)
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
            <td><button onclick="addItem(${item.ID_FOOD}, '${item.FOOD_NAME}')">+</button></td>
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

// 
function addItem(id, name) {
        addedItems.push({ id, name }); 
        renderAddedItems(); 
        alert("add successfully");
}

//
function renderAddedItems() {
    const addedTableBody = document.getElementById('addedItemsTableBody');
    addedTableBody.innerHTML = ''; 

    addedItems.forEach(item => {
        let newRow = `<tr>
            <td>${item.name}</td>
        </tr>`;
        addedTableBody.insertAdjacentHTML('beforeend', newRow);
    });
}





