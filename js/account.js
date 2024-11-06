let userinfo=[];
const sexeMapping = {
    0: "Neutre",
    1: "Homme",
    2: "Femme"
};

const sportLevelMapping = {
    0:"Pas du tout",
    1: "Level 1 - Exercice léger 1 à 3 jours par semaine",
    2: "Level 2 - Exercice modéré 3 à 5 jours par semaine",
    3: "Level 3 - Exercice d'intensité 6 à 7 jours par semaine",
    4: "Level 4 - Travail physique ou entraînement deux fois/jour"
};

function get_userinfo(){
    fetch('./backend/statis.php?action=userinfo')
    .then(response => response.json())
    .then(data => {

    userinfo = data;
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; 


    const keyDisplayNames ={
        ID_USER	: "ID-Utilisateur",
        ID_SEXE	: "Gendre",
        SPORT_VALUE	: "Fréquence de sport",
        SURNAME: "Prénom",
        NAME : "Nom",
        DATE_OF_BIRTH :"Date de naissance",
        PWD:"PWD",
        EMAIL:"Email",
        Height:"Hauteur(cm)"
    };

    const displayOrder= ["SURNAME","NAME","ID_USER","ID_SEXE","DATE_OF_BIRTH","EMAIL","SPORT_VALUE","Height"]

        data.forEach((user) => {
            displayOrder.forEach((key,index) => {
                const displayName = keyDisplayNames[key] || key;
                let value = user[key];
        
                if (key === "ID_SEXE") {
                    value = sexeMapping[value] || value;
                }
        
                if (key === "SPORT_VALUE") {
                    value = sportLevelMapping[value] || value;
                }
        
                let newRow = `<tr class="data-row" onclick="toggleActionRow(${index})">
                    <td>${displayName}</td>
                    <td>${value}</td>
                </tr>
                <tr id="action-row-${index}" class="action-row" style="display: none;">
                    <td colspan="3">
                        <button onclick="edituser(${index}, event)">Modifier</button>
                    </td>
                </tr>`;
        
                tableBody.insertAdjacentHTML('beforeend', newRow);
            });
        });
})

document.addEventListener('click', function(event) {
    if (!event.target.closest('.data-row') && !event.target.closest('.action-row')) {
        document.querySelectorAll('.action-row').forEach(row => {
            row.style.display = 'none';
        });
    }
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

function edituser(index, event) {
    event.stopPropagation();

    const row = document.querySelector(`#action-row-${index}`).previousElementSibling;
    const cells = row.querySelectorAll('td');
    

    cells[1].dataset.originalValue = cells[1].textContent;
    
    
    const fieldName = cells[0].textContent;
    let inputHTML = '';

    switch (fieldName) {
        case 'Prénom':
            inputHTML = `<input type="text" id="edit-surname-${index}" value="${cells[1].textContent}" required>`;
            break;
        case 'Nom':
            inputHTML = `<input type="text" id="edit-name-${index}" value="${cells[1].textContent}" required>`;
            break;
        case 'Email':
            inputHTML = `<input type="email" id="edit-email-${index}" value="${cells[1].textContent}" required>`;
            break;
        case 'Gendre':
            inputHTML = `<select id="edit-gender-${index}">
                            <option value="0" ${cells[1].textContent === 'Neutre' ? 'selected' : ''}>Neutre</option>
                            <option value="1" ${cells[1].textContent === 'Homme' ? 'selected' : ''}>Homme</option>
                            <option value="2" ${cells[1].textContent === 'Femme' ? 'selected' : ''}>Femme</option>
                         </select>`;
            break;
        case 'Fréquence de sport':
            inputHTML = `<select id="edit-sport-${index}">
                            <option value="0" ${cells[1].textContent.includes('Pas du tout') ? 'selected' : ''}>Level 0 - Pas du tout</option>
                            <option value="1" ${cells[1].textContent.includes('1 à 3 jours') ? 'selected' : ''}>Level 1 - Exercice léger 1 à 3 jours par semaine</option>
                            <option value="2" ${cells[1].textContent.includes('3 à 5 jours') ? 'selected' : ''}>Level 2 - Exercice modéré 3 à 5 jours par semaine</option>
                            <option value="3" ${cells[1].textContent.includes('6 à 7 jours') ? 'selected' : ''}>Level 3 - Exercice d'intensité 6 à 7 jours par semaine</option>
                            <option value="4" ${cells[1].textContent.includes('deux fois/jour') ? 'selected' : ''}>Level 4 - Travail physique ou entraînement deux fois/jour</option>
                         </select>`;
            break;
        case 'Hauteur(cm)':
            inputHTML = `<input type="number" id="edit-height-${index}" value="${cells[1].textContent}" min="1" max="300" required>`;
            break;
        case 'Date de naissance':
            inputHTML = `<input type="date" id="edit-dob-${index}" value="${cells[1].textContent}" required>`;
            break;
        default:
            inputHTML = `<input type="text" id="edit-${fieldName}-${index}" value="${cells[1].textContent}">`;
    }

    
    cells[1].innerHTML = inputHTML;

   
    const actionCell = document.querySelector(`#action-row-${index} td`);
    actionCell.innerHTML = `<button onclick="saveField(${index}, event)">Enregistrer</button>
                            <button onclick="cancelEdit(${index}, event)">Annuler</button>`;

    
    function handleClickOutside(e) {
        const editRow = row;
        const actionRow = document.querySelector(`#action-row-${index}`);

        if (!editRow.contains(e.target) && !actionRow.contains(e.target)) {
            cancelEdit(index, event); 
            document.removeEventListener('click', handleClickOutside);
        }
    }

    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 0);
}



function cancelEdit(index, event) {
    event.stopPropagation();

    const row = document.querySelector(`#action-row-${index}`).previousElementSibling;
    const valueCell = row.querySelector('td:nth-child(2)');
    const actionCell = document.querySelector(`#action-row-${index} td`);

    valueCell.textContent = valueCell.dataset.originalValue;

    
    actionCell.innerHTML = `<button onclick="edituser(${index}, event)">Modifier</button>`;
}


function saveField(index, event) {
    event.stopPropagation();

    const row = document.querySelector(`#action-row-${index}`).previousElementSibling;
    const fieldName = row.querySelector('td:nth-child(1)').textContent;
    const valueCell = row.querySelector('td:nth-child(2)');



    const fieldMapping = {
        'Prénom': 'SURNAME',
        'Nom': 'NAME',
        'Email': 'EMAIL',
        'Gendre': 'ID_SEXE',
        'Fréquence de sport': 'SPORT_VALUE',
        'Hauteur (cm)': 'Height',
        'Date de naissance': 'DATE_OF_BIRTH'
    };


    const dbFieldName = fieldMapping[fieldName] || fieldName; 

    
    let updatedValue;
    if (fieldName === 'Prénom') {
        updatedValue = document.getElementById(`edit-surname-${index}`).value;
    } else if (fieldName === 'Nom') {
        updatedValue = document.getElementById(`edit-name-${index}`).value;
    } else if (fieldName === 'Email') {
        updatedValue = document.getElementById(`edit-email-${index}`).value;
    } else if (fieldName === 'Gendre') {
        updatedValue = document.getElementById(`edit-gender-${index}`).value;
    } else if (fieldName === 'Fréquence de sport') {
        updatedValue = document.getElementById(`edit-sport-${index}`).value;
    } else if (fieldName === 'Hauteur (cm)') {
        updatedValue = document.getElementById(`edit-height-${index}`).value;
    } else if (fieldName === 'Date de naissance') {
        updatedValue = document.getElementById(`edit-dob-${index}`).value;
    }

    fetch('./backend/statis.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userinfo.ID_USER,
            field_name: dbFieldName, 
            updated_value: updatedValue
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed');
        }
        return response.json();
    })
    .then(data => {
        console.log('Succès', data);

        if (fieldName === 'Gendre'){
            dicvalue = sexeMapping[updatedValue];
            valueCell.textContent = dicvalue;
        } else if (fieldName === 'Fréquence de sport'){
            dicvalue = sportLevelMapping[updatedValue];
            valueCell.textContent = dicvalue;
        } else {
            valueCell.textContent = dicvalue;
        };

        const actionCell = document.querySelector(`#action-row-${index} td`);
        actionCell.innerHTML = `<button onclick="editUser(${index}, event)">Modifier</button>`;
    });
}






