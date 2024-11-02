window.onload = function() {
    loadGroups();
};

let currentPage = 1;
let totalPages = 0;

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
        loadTable(data);
    })
    .catch(error => console.error('Error fetching food items:', error));
}

function loadTable(items) {
    const tableBody = document.getElementById('foodItemsTableBody');
    tableBody.innerHTML = ''; 

    items.forEach(item => {
        let newRow = `<tr>
            <td>${item.FOOD_NAME}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', newRow);
    });
}