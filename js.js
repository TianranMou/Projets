//initial all users datas
let all_users=[];   

//send get request to db and return all users data
function getdata(){
    fetch('../../tp4/ex5/users.php')
        .then(response => response.json())
        .then(data => {
            if (data !=="") {
                all_users = data;
                load_Table(all_users);
            }else {
                alert("Error from API   " + data.message);
            }
        })
        .catch(error => {
            console.error('Error',error)
            alert('Failed to get data.');
        })

}

// print all data in table
function load_Table(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; 

    users.forEach(user => {
        let newRow = `<tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button onclick="editRow(this)">Edit</button>
                <button onclick="deleteRow(this)">Delete</button>
            </td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', newRow);
    });
}



document.addEventListener("DOMContentLoaded",function(){

    getdata();

    // submit the form
    document.querySelector('.form').addEventListener('submit',function(event){

        //Cancel the default action of event
        event.preventDefault();

        // get the value in the form
        let name = document.getElementById('name').value.trim(); //trim can delete the space before and after
        let email = document.getElementById('email').value.trim();

        
        // if name is entered, prepare the request body
        if(name !== ""){
            let Requestbody = {
                name : name,
                email : email
            }
                fetch('../../tp4/ex5/users.php',{
                method : 'POST',
                headers : {
                    'Content-type' : 'application/json',
                },
                body : JSON.stringify(Requestbody)
            })
            .then(response => response.json())

            //if post sucessful, add new row to the table.
            .then(data => {
                if (data !=="" ) {
                    let newrow = `<tr>
                                        <td>${data.id}</td>
                                        <td>${name}</td>
                                        <td>${email}</td>
                                        <td>
                                            <button onclick="editRow(this)">Edit</button>
                                            <button onclick="deleteRow(this)">Delete</button>
                                        </td>
                                </tr>`;

                    document.getElementById('usersTableBody').insertAdjacentHTML('beforeend', newrow);

                    //reset the form
                    document.querySelector('.form').reset();

                    all_users.push({
                        id : data.id,
                        name : name ,
                        email : email
                    })

                }else{
                    alert("Error from API" + data.message);
                }
                
            })

            .catch(error =>{
                console.error('Error',error);
                alert('An error while sending request');
            })
        } else {
            alert("You should enter the name");
        }
    })
    

    document.getElementById('searchButton').addEventListener('click', function() {
        let searchQuery = document.getElementById('searchField').value.trim();
        searchUsers(searchQuery);
    });

});



function searchUsers(query) {
    const filteredUsers = all_users.filter(user => {
        return user.id.includes(query) || user.name.includes(query) || user.email.includes(query);
    });

    load_Table(filteredUsers); 
}

function deleteRow(button){

    let row_to_be_deleted = button.closest('tr');
    let userID = row_to_be_deleted.cells[0].textContent;
    let requestbody={
        id : userID
    };

        fetch('../../tp4/ex5/users.php',{
        method : 'DELETE',
        headers : {
            'Content-type' : 'application/json',
        },
        body : JSON.stringify(requestbody)
        })
    .then(response=> {
        if (response.status === 200){
            row_to_be_deleted.parentNode.removeChild(row_to_be_deleted);
            alert('delete successful');
        }else{
            alert('delete unsuccessful');
        }
    })  

    

}


function editRow(button) {

    let row_to_be_edited = button.closest('tr');
    let cells = row_to_be_edited.cells;

 
    for (let i= 1; i<cells.length-1;i++){
        // skip the 1st column, id cant be modified.
        let originaldata = cells[i].textContent;
        cells[i].innerHTML= `<input type="text" id="input${i}" value="${originaldata}">`;
    }
    cells[cells.length-1].innerHTML=`<button onclick="confirmEdit(this)">Confirm</button>
                                     <button onclick="deleteRow(this)">Delete</button>`


}


function confirmEdit(button) {
    let row = button.closest('tr'); 
    let cells = row.cells; 
    let requestbody = {};
    let headers = document.querySelectorAll('thead th');

    requestbody.id=cells[0].textContent;

    if (document.getElementById("input1").value.trim() === ""){
        alert('you should enter the name')
    }else{
        for (let i = 1; i < cells.length - 1; i++) { 
            let input = cells[i].querySelector('input');
            let fieldName = headers[i].textContent.toLowerCase();
            requestbody[fieldName] = input.value;
        }


        fetch('../../tp4/ex5/users.php',{
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify(requestbody) 
        })
        .then(response => {
            if (response.status === 200 ) {
                alert('update success');
                for (let i = 1; i < cells.length - 1; i++) { 
                    let input = cells[i].querySelector('input');
                    cells[i].textContent = input.value; 
                }
                
                cells[cells.length - 1].innerHTML = `<button onclick="editRow(this)">Edit</button>
                                                    <button onclick="deleteRow(this)">Delete</button>`;
            } else {
                alert('update failed: ' + response.status);
            }
        })
        .catch(error => {
            console.error('error:', error);
            alert('error: ' + error.message);
        });

    }
}
